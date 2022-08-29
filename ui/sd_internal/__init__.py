import json

class Request:
    prompt: str
    init_image: str = None # base64
    mask: str = None # base64
    num_outputs: int = 1
    num_inference_steps: int = 50
    guidance_scale: float = 7.5
    width: int = 512
    height: int = 512
    seed: int = 42
    prompt_strength: float = 0.8

class Image:
    data: str # base64
    is_nsfw: bool

    def __init__(self, data, is_nsfw):
        self.data = data
        self.is_nsfw = is_nsfw

    def json(self):
        return {
            "data": self.data,
            "is_nsfw": self.is_nsfw,
        }

class Response:
    images: list

    def json(self):
        res = {
            "status": 'succeeded',
            "output": [],
        }

        for image in self.images:
            res["output"].append(image.json())

        return res
