'use client';

import { motion } from 'framer-motion';

export function Hero() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
      className="text-center space-y-6"
    >
      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="text-5xl sm:text-6xl font-bold tracking-tight"
      >
        <span className="gradient-text">Knowledge Search</span>
      </motion.h1>

      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="text-lg text-gray-600 max-w-2xl mx-auto"
      >
        Upload documents and ask questions. Get answers from your data.
      </motion.p>
    </motion.div>
  );
}

