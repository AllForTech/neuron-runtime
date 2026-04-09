'use client';

import { motion } from 'framer-motion';
import { useRef, useState, memo, useCallback } from 'react';
import { HeroSphere } from './HeroSphere';
import { FloatingElements } from './FloatingElements';
import { HeroOverlay } from './HeroOverlay';
import { FabricReveal } from './TerminalReveal';
import { AppButton } from '@/components/CustomButton';
import { Rocket, ArrowRight } from 'lucide-react';
import { useHeroBridge } from '@/hooks/use-hero-bridge';
import { HeroBackground } from '@/components/layout/hero/background/HeroBackground';
import { useRouter } from 'next/navigation';
import { Footer } from '@/components/layout/footer/Footer';

const SECTIONS = ['intro', 'features', 'capabilities', 'demos'] as const;
export type SectionType = (typeof SECTIONS)[number];

export const HeroSection = memo(function HeroSection() {
  const containerRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const router = useRouter();
  const [ballPos, setBallPos] = useState({ x: 0, y: 0 });

  const { activeSection, scrollYProgress, transforms } =
    useHeroBridge(containerRef);

  const handleBallUpdate = useCallback((pos: { x: number; y: number }) => {
    setBallPos(pos);
  }, []);

  return (
    <div
      ref={containerRef}
      className="relative h-[600dvh] overflow-clip text-white"
    >
      {/* 1. THE ATMOSPHERE (Deepest Layer) */}
      <HeroBackground />

      {/* LAYER 1: THE FLOATING HERO */}
      <motion.div
        style={transforms.heroExit}
        className="pointer-events-none sticky top-0 z-20 flex h-screen w-full items-center justify-center"
      >
        {/*/!* Background radial glow *!/*/}
        {/*<div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(24,24,27,1)_0%,rgba(0,0,0,1)_50%)]" />*/}

        {/* Status Overlays */}
        <motion.div
          style={{ opacity: scrollYProgress.get() > 0.12 ? 1 : 0 }}
          className="transition-opacity duration-500"
        >
          <HeroOverlay section={activeSection} />
        </motion.div>

        <div className="pointer-events-none relative z-10 flex h-full w-full items-center">
          {/* LEFT CONTENT: HEADLINE */}
          <div className="mx-auto flex h-full w-full max-w-7xl items-center px-10">
            <motion.div
              style={transforms.text}
              className="pointer-events-auto flex w-1/2 flex-col gap-10 pr-10"
            >
              <div className="space-y-6">
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex items-center gap-3"
                >
                  <div className="bg-primary h-[1px] w-8" />
                  <span className="text-primary text-[10px] font-black tracking-[0.5em] uppercase">
                    Neuron v3.0
                  </span>
                </motion.div>
                <h1 className="text-7xl leading-[0.85] font-black tracking-tighter select-none md:text-9xl">
                  <span className="from-foreground via-foreground/90 to-foreground/40 inline-block bg-gradient-to-b bg-clip-text text-transparent drop-shadow-[0_5px_15px_rgba(255,255,255,0.05)]">
                    BEYOND
                  </span>
                  <br />
                  <span className="font-light text-neutral-600 italic opacity-80">
                    CODE.
                  </span>
                </h1>
                <p className="max-w-sm text-sm leading-relaxed font-medium text-neutral-500">
                  Autonomous backend orchestration kernel. <br />
                  Build visually, deploy instantly.
                </p>
              </div>
              <div className="flex items-center gap-5">
                <AppButton
                  onClick={() => router.push('/sign-in')}
                  label="Get Started"
                  icon={<Rocket size={14} />}
                  className="transition-300 rounded-2xl bg-white px-10 py-7 text-[12px] font-black tracking-widest text-black uppercase shadow-2xl transition-transform active:scale-95"
                />
                <AppButton
                  onClick={() => router.push('/sign-in')}
                  label="Explore"
                  variant="ghost"
                  icon={<ArrowRight size={14} />}
                  className="transition-300 rounded-2xl px-10 py-7 text-[10px] font-black tracking-widest text-neutral-400 uppercase hover:bg-white hover:text-neutral-800"
                />
              </div>
            </motion.div>
          </div>

          {/* SPHERE: ABSOLUTE CENTER-TARGETED */}
          <motion.div
            style={transforms.sphere}
            className="pointer-events-none absolute top-0 z-30 flex h-full items-center justify-center"
          >
            <div className="relative flex h-[420px] w-[420px] items-center justify-center">
              <div className="bg-primary/5 absolute z-0 h-[600px] w-[600px] rounded-full blur-[120px]" />

              <div className="relative z-10">
                <HeroSphere
                  section={activeSection}
                  onBallUpdate={handleBallUpdate}
                />
              </div>

              <FloatingElements section={activeSection} cardRefs={cardRefs} />
            </div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
});
