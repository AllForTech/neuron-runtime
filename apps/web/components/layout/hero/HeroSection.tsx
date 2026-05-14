'use client';

import { motion } from 'motion/react';
import { useRef, useEffect, useState, memo, useCallback } from 'react';
import { HeroSphere } from './HeroSphere';
import { FloatingElements } from './FloatingElements';
import { HeroOverlay } from './HeroOverlay';
import { FabricReveal } from './TerminalReveal';
import { AppButton } from '@/components/CustomButton';
import { Rocket, ArrowRight } from 'lucide-react';
import { useRouter } from 'next/navigation';

export type SectionType = 'intro' | 'features' | 'capabilities' | 'demos';

const SECTIONS: SectionType[] = ['intro', 'features', 'capabilities', 'demos'];

interface SectionData {
  id: SectionType;
  label: string;
  desc: string;
}

const SECTION_DATA: Record<SectionType, SectionData> = {
  intro: { id: 'intro', label: 'NEURON', desc: 'Architecture of Intelligence' },
  features: { id: 'features', label: 'FEATURES', desc: 'Visual Logical Design' },
  capabilities: { id: 'capabilities', label: 'CAPABILITIES', desc: 'Autonomous Power' },
  demos: { id: 'demos', label: 'DEMONSTRATION', desc: 'The Future Revealed' },
};

function getSectionFromProgress(progress: number): SectionType {
  'worklet';
  if (progress < 0.25) return 'intro';
  if (progress < 0.5) return 'features';
  if (progress < 0.75) return 'capabilities';
  return 'demos';
}

export const HeroSection = memo(function HeroSection() {
  const containerRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const router = useRouter();
  const [scrollProgress, setScrollProgress] = useState(0);
  const [activeSection, setActiveSection] = useState<SectionType>('intro');

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let rafId: number;
    let lastProgress = -1;

    const update = () => {
      const rect = container.getBoundingClientRect();
      const totalHeight = container.offsetHeight - window.innerHeight;
      const scrolled = -rect.top;
      const progress = Math.max(0, Math.min(1, scrolled / totalHeight));

      if (Math.abs(progress - lastProgress) > 0.0001) {
        lastProgress = progress;
        setScrollProgress(progress);
        setActiveSection(getSectionFromProgress(progress));
      }

      rafId = requestAnimationFrame(update);
    };

    rafId = requestAnimationFrame(update);
    return () => cancelAnimationFrame(rafId);
  }, []);

  const getSectionStyle = useCallback((section: SectionType) => {
    const sectionMap: Record<SectionType, { top: string; bottom: string }> = {
      intro: { top: '0%', bottom: '75%' },
      features: { top: '25%', bottom: '50%' },
      capabilities: { top: '50%', bottom: '25%' },
      demos: { top: '75%', bottom: '0%' },
    };
    return sectionMap[section];
  }, []);

  return (
    <div
      ref={containerRef}
      className="relative h-[400dvh] snap-y snap-mandatory overflow-clip text-white md:h-[600dvh]"
    >
      {/* ATMOSPHERE */}
      <div className="fixed inset-0 -z-10 overflow-hidden bg-[radial-gradient(circle_at_50%_50%,rgba(24,24,27,1)_0%,rgba(0,0,0,1)_40%)]">
        <div className="pointer-events-none absolute top-1/2 left-1/2 h-[800px] w-[800px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/[0.01] blur-[120px]" />
        <div className="pointer-events-none absolute top-0 left-1/4 h-[300px] w-[500px] -rotate-12 rounded-full bg-white/[0.01] blur-[100px]" />
        <div className="pointer-events-none absolute right-0 bottom-0 left-0 h-[40vh] bg-gradient-to-t from-black to-transparent opacity-80" />
      </div>

      {/* HERO LAYER — sticky at top */}
      <div className="sticky top-0 z-20 flex h-screen w-full items-center justify-center overflow-hidden">
        {/* Section anchors for scroll-snap */}
        {SECTIONS.map((section) => {
          const pos = getSectionStyle(section);
          return (
            <div
              key={section}
              id={`section-${section}`}
              className="absolute"
              style={{ top: pos.top, bottom: pos.bottom, left: 0, right: 0, pointerEvents: 'none' }}
            />
          );
        })}

        {/* Status Overlays */}
        <div
          style={{
            opacity: scrollProgress > 0.05 ? 1 : 0,
            transition: 'opacity 0.5s',
          }}
          className="pointer-events-none absolute top-20 right-0 left-0 z-50 select-none px-6"
        >
          <HeroOverlay section={activeSection} />
        </div>

        {/* Main Content */}
        <div className="relative z-10 flex h-full w-full items-center px-6 md:px-10">
          {/* LEFT CONTENT: HEADLINE */}
          <div className="mx-auto flex h-full w-full max-w-7xl items-center">
            <div className="flex w-full flex-col gap-8 md:flex-row md:items-center">
              {/* Text Column */}
              <div className="pointer-events-auto flex w-full flex-col gap-8 md:w-1/2 md:pr-10">
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
                  <h1 className="text-6xl font-black tracking-tighter leading-[0.9] md:text-7xl lg:text-9xl">
                    <span className="from-foreground via-foreground/90 to-foreground/40 inline-block bg-gradient-to-b bg-clip-text text-transparent drop-shadow-[0_5px_15px_rgba(255,255,255,0.05)]">
                      BEYOND
                    </span>
                    <br />
                    <span className="font-light text-neutral-600 italic opacity-80">
                      CODE.
                    </span>
                  </h1>
                  <p className="max-w-sm text-sm leading-relaxed font-medium text-neutral-500">
                    Autonomous backend orchestration kernel.
                    <br />
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
              </div>

              {/* SPHERE COLUMN — hidden on mobile */}
              <div className="pointer-events-none relative z-30 hidden w-1/2 items-center justify-center md:flex">
                <div className="relative flex h-[350px] w-[350px] items-center justify-center lg:h-[420px] lg:w-[420px]">
                  <div className="bg-primary/5 absolute z-0 h-[500px] w-[500px] rounded-full blur-[120px] lg:h-[600px] lg:w-[600px]" />
                  <div className="relative z-10">
                    <HeroSphere section={activeSection} scrollProgress={scrollProgress} />
                  </div>
                  <FloatingElements section={activeSection} cardRefs={cardRefs} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});