'use client';

import { motion } from 'framer-motion';

export function AnimatedLogo({ size = 48 }: { size?: number }) {
  return (
    <motion.div
      initial={{ rotate: 0, scale: 0.98, opacity: 0.95 }}
      animate={{ rotate: [0, 6, -6, 0], scale: [0.98, 1.02, 0.99, 1], opacity: [0.95, 1, 0.98, 1] }}
      transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
      style={{ width: size, height: size }}
      className="rounded-3xl bg-gradient-to-br from-blue-500 to-violet-600 p-1 shadow-lg"
    >
      <svg viewBox="0 0 48 48" width={size} height={size} className="block rounded-[10px] bg-white">
        <defs>
          <linearGradient id="g1" x1="0" x2="1">
            <stop offset="0%" stopColor="#7c3aed" />
            <stop offset="100%" stopColor="#2563eb" />
          </linearGradient>
        </defs>
        <rect x="6" y="6" width="36" height="36" rx="10" fill="url(#g1)" />
        <g transform="translate(14,12)" fill="#fff">
          <path d="M0 0h2v12H0z" />
          <path d="M6 0h2v12H6z" opacity="0.9" />
          <path d="M12 0h2v12h-2z" opacity="0.7" />
        </g>
      </svg>
    </motion.div>
  );
}
