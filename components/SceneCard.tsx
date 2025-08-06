import React from "react";
import { Scene } from "../types";
import { BrokenImageIcon } from "./icons/Icons";

interface SceneCardProps {
  scene: Scene;
}

const SceneCard: React.FC<SceneCardProps> = ({ scene }) => {
  return (
    <div className="w-full h-full rounded-2xl shadow-xl overflow-hidden bg-white flex flex-col">
      <div className="relative w-full h-3/5 bg-orange-100 flex-shrink-0 flex items-center justify-center">
        {scene.imageUrl ? (
          <img
            src={scene.imageUrl}
            alt={scene.imagePrompt}
            className="w-full h-full object-cover"
          />
        ) : scene.imageError ? (
          <div className="flex flex-col items-center text-orange-400">
            <BrokenImageIcon className="w-12 h-12" />
            <span className="mt-2 text-xs font-semibold">Image failed</span>
          </div>
        ) : (
          <div className="w-12 h-12 border-4 border-dashed rounded-full animate-spin border-orange-300"></div>
        )}
      </div>
      <div className="w-full flex-grow p-4 md:p-6 overflow-y-auto text-gray-800">
        <p className="text-lg leading-relaxed">{scene.text}</p>
      </div>
    </div>
  );
};

export default SceneCard;
