
import React from 'react';
import { LoadingAnimationIcon } from './icons/Icons';

interface LoaderProps {
  text: string;
}

const Loader: React.FC<LoaderProps> = ({ text }) => {
  return (
    <div className="flex flex-col items-center justify-center text-center p-8 text-orange-500">
      <div className="relative">
        <LoadingAnimationIcon className="w-24 h-24" />
      </div>
      <p className="mt-4 text-lg font-bold animate-pulse">{text}</p>
    </div>
  );
};

export default Loader;