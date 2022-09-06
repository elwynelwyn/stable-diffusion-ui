import React from "react";
import { useImageDisplay } from "../../store/imageDisplayStore";

import GeneratedImage from "./generatedImage";

export default function DisplayPanel() {

  //@ts-ignore
  const currentImage = useImageDisplay((state) => state.currentImage);

  console.log('DisplayPanel: currentImage', currentImage);
  return (
    <div className="display-panel">
      <h1>Display Panel</h1>
      {currentImage ? <GeneratedImage imageData={currentImage}></GeneratedImage> : null}
    </div>
  );
};
