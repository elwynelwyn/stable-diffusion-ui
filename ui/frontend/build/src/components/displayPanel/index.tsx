import React from "react";
import { useImageQueue } from "../../store/imageQueueStore";
import { useQueryClient } from '@tanstack/react-query'

import CurrentImage from "./currentImage";

import GeneratedImage from "./generatedImage";

export default function DisplayPanel() {

  const hasQueuedImages = useImageQueue((state) => state.hasQueuedImages());
 return (
    <div className="display-panel">
      <h1>Display Panel</h1>
      <div>
        {hasQueuedImages && <CurrentImage />}
      </div>
    </div>
  );
};
