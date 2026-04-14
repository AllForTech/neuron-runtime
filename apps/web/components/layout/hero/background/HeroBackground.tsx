'use client';

import { motion } from 'framer-motion';
import { ParticleField } from '@/components/layout/hero/background/ParticleField';

export function HeroBackground() {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden bg-[radial-gradient(circle_at_50%_50%,rgba(24,24,27,1)_0%,rgba(0,0,0,1)_40%)]">
      {/* Primary Focal Glow (Center) */}
      <div className="absolute top-1/2 left-1/2 h-[800px] w-[800px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/[0.01] blur-[120px]" />

      {/* Ambient Top Light */}
      <div className="absolute top-0 left-1/4 h-[300px] w-[500px] -rotate-12 rounded-full bg-white/[0.01] blur-[100px]" />

      {/* Deep Bottom Shadow Gradient */}
      <div className="absolute right-0 bottom-0 left-0 h-[40vh] bg-gradient-to-t from-black to-transparent opacity-80" />

      {/* The Particle Canvas */}
      <ParticleField />
    </div>
  );
}
