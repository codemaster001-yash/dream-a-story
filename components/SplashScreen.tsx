import React from 'react';
import { motion } from 'framer-motion';

const SplashScreen: React.FC = () => {
  return (
    <motion.div
      className="absolute inset-0 bg-gradient-to-b from-orange-50 to-amber-100 flex flex-col items-center justify-center z-[100]"
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.5, delay: 0.5 } }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1, transition: { duration: 0.7, delay: 0.2, type: 'spring' } }}
      >
        <img src="/logo.svg" alt="Dream a Story Logo" className="w-32 h-32" />
      </motion.div>
      <motion.h1
        className="text-4xl font-extrabold text-orange-600 mt-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0, transition: { duration: 0.6, delay: 0.8 } }}
      >
        Dream a Story
      </motion.h1>
    </motion.div>
  );
};

export default SplashScreen;