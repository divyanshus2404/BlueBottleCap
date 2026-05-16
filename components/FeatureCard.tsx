'use client';

import { motion } from 'framer-motion';

type FeatureCardProps = {
  icon: string;
  title: string;
  description: string;
  index: number;
};

export function FeatureCard({ icon, title, description, index }: FeatureCardProps) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.55, delay: index * 0.12, ease: 'easeOut' }}
      whileHover={{ y: -6, scale: 1.03, boxShadow: '0 32px 80px rgba(15, 23, 42, 0.12)' }}
      className="rounded-[28px] border border-white/80 bg-white/80 p-6 shadow-soft backdrop-blur-xl transition"
    >
      <div className="mb-5 inline-flex h-14 w-14 items-center justify-center rounded-3xl bg-blue-50 text-blue-600 shadow-md shadow-blue-100/80">
        <span className="text-2xl">{icon}</span>
      </div>
      <h3 className="text-lg font-semibold text-slate-950">{title}</h3>
      <p className="mt-3 text-sm leading-7 text-slate-600">{description}</p>
    </motion.article>
  );
}
