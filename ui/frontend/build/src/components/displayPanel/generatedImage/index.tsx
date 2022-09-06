import React from "react";

export default function GeneratedImage({imageData}) {
  return (
    <div className="generated-image">
      <p>Your image</p>
      <img src={imageData.display} alt="generated" />
    </div>
  );
};