import React, { ChangeEvent } from "react";

import MakeButton from "./makeButton";
import AdvancedSettings from "./advancedSettings";
import ImageModifiers from "./imageModifiers";

import { useImageCreate } from "../../store/imageCreateStore";

import './creationPanel.css';

export default function CreationPanel() {
  const promptText = useImageCreate((state) => state.imageOptions.prompt);
  const setPrompt = useImageCreate((state) => state.setPrompt);

  const handlePromptChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
    console.log("handlePromptChange", event.target.value);
    setPrompt(event.target.value);
  };

  return (
    <div className="create-panel">
      <div className="basic-create">
        <div className="prompt">
          <p>Prompt </p>
          <textarea value={promptText} onChange={handlePromptChange}></textarea>
        </div>

        <div className="seed-image">
          <p>Seed Image</p>
          <input type="file" accept="image/*" />
        </div>

        <MakeButton></MakeButton>
        <div>
          [selected tags]
        </div>
      </div>

      <div className="advanced-create">
        <AdvancedSettings></AdvancedSettings>
        <ImageModifiers></ImageModifiers>
      </div>
    </div>
  );
}