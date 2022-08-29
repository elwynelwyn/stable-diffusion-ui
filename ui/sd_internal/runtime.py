import argparse, os, sys, glob
import cv2
import torch
import numpy as np
from omegaconf import OmegaConf
from PIL import Image
from tqdm import tqdm, trange
from imwatermark import WatermarkEncoder
from itertools import islice
from einops import rearrange
from torchvision.utils import make_grid
import time
from pytorch_lightning import seed_everything
from torch import autocast
from contextlib import contextmanager, nullcontext

from ldm.util import instantiate_from_config
from ldm.models.diffusion.ddim import DDIMSampler
from ldm.models.diffusion.plms import PLMSSampler

from diffusers.pipelines.stable_diffusion.safety_checker import StableDiffusionSafetyChecker
from transformers import AutoFeatureExtractor

# my stuff
from . import Request, Response, Image as ResponseImage
import base64
from io import BytesIO


# load safety model
safety_model_id = "CompVis/stable-diffusion-safety-checker"
safety_feature_extractor = AutoFeatureExtractor.from_pretrained(safety_model_id)
safety_checker = StableDiffusionSafetyChecker.from_pretrained(safety_model_id)

# local
model = None
device = None
sampler_plms = None
sampler_ddim = None

# api
def load_model(config="configs/stable-diffusion/v1-inference.yaml", ckpt="models/ldm/stable-diffusion-v1/model.ckpt"):
    global model, device
    global sampler_plms, sampler_ddim

    config = OmegaConf.load(f"{config}")
    model = load_model_from_config(config, f"{ckpt}")

    device = torch.device("cuda") if torch.cuda.is_available() else torch.device("cpu")
    model = model.to(device)

    sampler_plms = PLMSSampler(model)
    sampler_ddim = DDIMSampler(model)

def txt2img(req: Request):
    res = Response()
    res.images = []

    sampler = sampler_plms

    opt_prompt = req.prompt
    opt_seed = req.seed
    opt_n_samples = req.num_outputs
    opt_n_iter = 1
    opt_scale = req.guidance_scale
    opt_C = 4
    opt_H = req.height
    opt_W = req.width
    opt_f = 8
    opt_ddim_steps = req.num_inference_steps
    opt_ddim_eta = 0.0
    opt_precision = "autocast"
    opt_skip_save = False

    print(opt_prompt, ': seed', opt_seed, 'num_inference_steps', opt_ddim_steps, 'guidance_scale', opt_scale, 'w', opt_W, 'h', opt_H, 'allow_nsfw', req.allow_nsfw)

    seed_everything(opt_seed)

    batch_size = opt_n_samples
    prompt = opt_prompt
    assert prompt is not None
    data = [batch_size * [prompt]]

    start_code = None

    precision_scope = autocast if opt_precision=="autocast" else nullcontext
    with torch.no_grad():
        with precision_scope("cuda"):
            with model.ema_scope():
                for n in trange(opt_n_iter, desc="Sampling"):
                    for prompts in tqdm(data, desc="data"):
                        uc = None
                        if opt_scale != 1.0:
                            uc = model.get_learned_conditioning(batch_size * [""])
                        if isinstance(prompts, tuple):
                            prompts = list(prompts)
                        c = model.get_learned_conditioning(prompts)

                        # this part is specific to txt2img
                        shape = [opt_C, opt_H // opt_f, opt_W // opt_f]
                        samples_ddim, _ = sampler.sample(S=opt_ddim_steps,
                                                         conditioning=c,
                                                         batch_size=opt_n_samples,
                                                         shape=shape,
                                                         verbose=False,
                                                         unconditional_guidance_scale=opt_scale,
                                                         unconditional_conditioning=uc,
                                                         eta=opt_ddim_eta,
                                                         x_T=start_code)

                        x_samples_ddim = model.decode_first_stage(samples_ddim)
                        x_samples_ddim = torch.clamp((x_samples_ddim + 1.0) / 2.0, min=0.0, max=1.0)
                        x_samples_ddim = x_samples_ddim.cpu().permute(0, 2, 3, 1).numpy()

                        if req.allow_nsfw:
                            x_checked_image = x_samples_ddim
                        else:
                            x_checked_image, has_nsfw_concept = check_safety(x_samples_ddim)

                        x_checked_image_torch = torch.from_numpy(x_checked_image).permute(0, 3, 1, 2)

                        if not opt_skip_save:
                            for i, x_sample in enumerate(x_checked_image_torch):
                                x_sample = 255. * rearrange(x_sample.cpu().numpy(), 'c h w -> h w c')
                                img = Image.fromarray(x_sample.astype(np.uint8))
                                img_data = img_to_base64_str(img)

                                res.images.append(ResponseImage(data=img_data))

    return res

def img2img(req: Request):
    res = Response()
    res.images = [ResponseImage(data="haha2", is_nsfw=False)]
    return res

# internal

def chunk(it, size):
    it = iter(it)
    return iter(lambda: tuple(islice(it, size)), ())


def numpy_to_pil(images):
    """
    Convert a numpy image or a batch of images to a PIL image.
    """
    if images.ndim == 3:
        images = images[None, ...]
    images = (images * 255).round().astype("uint8")
    pil_images = [Image.fromarray(image) for image in images]

    return pil_images


def load_model_from_config(config, ckpt, verbose=False):
    print(f"Loading model from {ckpt}")
    pl_sd = torch.load(ckpt, map_location="cpu")
    if "global_step" in pl_sd:
        print(f"Global Step: {pl_sd['global_step']}")
    sd = pl_sd["state_dict"]
    model = instantiate_from_config(config.model)
    m, u = model.load_state_dict(sd, strict=False)
    if len(m) > 0 and verbose:
        print("missing keys:")
        print(m)
    if len(u) > 0 and verbose:
        print("unexpected keys:")
        print(u)

    model.cuda()
    model.eval()
    return model


def put_watermark(img, wm_encoder=None):
    if wm_encoder is not None:
        img = cv2.cvtColor(np.array(img), cv2.COLOR_RGB2BGR)
        img = wm_encoder.encode(img, 'dwtDct')
        img = Image.fromarray(img[:, :, ::-1])
    return img


def load_replacement(x):
    try:
        hwc = x.shape
        y = Image.open("assets/rick.jpeg").convert("RGB").resize((hwc[1], hwc[0]))
        y = (np.array(y)/255.0).astype(x.dtype)
        assert y.shape == x.shape
        return y
    except Exception:
        return x


def check_safety(x_image):
    safety_checker_input = safety_feature_extractor(numpy_to_pil(x_image), return_tensors="pt")
    x_checked_image, has_nsfw_concept = safety_checker(images=x_image, clip_input=safety_checker_input.pixel_values)
    assert x_checked_image.shape[0] == len(has_nsfw_concept)
    for i in range(len(has_nsfw_concept)):
        if has_nsfw_concept[i]:
            x_checked_image[i] = load_replacement(x_checked_image[i])
    return x_checked_image, has_nsfw_concept

# https://stackoverflow.com/a/61114178
def img_to_base64_str(img):
    buffered = BytesIO()
    img.save(buffered, format="PNG")
    buffered.seek(0)
    img_byte = buffered.getvalue()
    img_str = "data:image/png;base64," + base64.b64encode(img_byte).decode()
    return img_str