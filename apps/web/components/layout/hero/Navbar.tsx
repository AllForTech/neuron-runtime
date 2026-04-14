'use client';

import {
  motion,
  useScroll,
  useMotionValueEvent,
  AnimatePresence,
} from 'framer-motion';
import { useState, useRef } from 'react';
import { AppButton } from '@/components/CustomButton';
import { Cpu, BookOpen, Layers, Zap, LogIn } from 'lucide-react';
import Link from 'next/link';
import { useHeroBridge } from '@/hooks/use-hero-bridge';
import { SectionType } from '@/components/layout/hero/HeroSection';

const NAV_LINKS = [
  { name: 'Features', href: '#features', icon: Zap },
  { name: 'Capabilities', href: '#capabilities', icon: Layers },
  { name: 'Demos', href: '#demos', icon: BookOpen },
  { name: 'Docs', href: '/docs', icon: BookOpen },
];

const sectionMapping: Record<string, SectionType> = {
  Features: 'features',
  Capabilities: 'capabilities',
  Demos: 'demos',
  Docs: 'intro',
};

export function Navbar() {
  const { scrollY } = useScroll();
  const { scrollToSection } = useHeroBridge();
  const [hidden, setHidden] = useState(false);
  const prevScrollY = useRef(0);

  useMotionValueEvent(scrollY, 'change', (latest) => {
    // Only hide after passing the initial intro section
    if (latest > 150) {
      if (latest > prevScrollY.current) {
        setHidden(true); // Scrolling Down
      } else {
        setHidden(false); // Scrolling Up
      }
    } else {
      setHidden(false); // Always show at top
    }
    prevScrollY.current = latest;
  });

  return (
    <motion.nav
      variants={{
        visible: { y: 0, opacity: 1 },
        hidden: { y: -100, opacity: 0 },
      }}
      animate={hidden ? 'hidden' : 'visible'}
      transition={{ duration: 0.35, ease: 'easeInOut' }}
      className="pointer-events-none fixed top-0 right-0 left-0 z-[100] flex justify-center px-6 py-2"
    >
      {/* GLASS CONTAINER */}
      <div className="pointer-events-auto flex w-full max-w-7xl items-center justify-between rounded-2xl bg-white/[0.03] px-6 py-2 shadow-[0_20px_50px_rgba(0,0,0,0.5)] backdrop-blur-xl">
        <div className={'flex h-full w-fit items-center justify-start gap-5'}>
          {/* LEFT: LOGO */}
          <Link href="/" className="group flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg transition-transform group-hover:rotate-12">
              <Zap size={18} className={'text-white'} strokeWidth={2.5} />
            </div>
            <span className="text-[14px] font-black tracking-[0.3em] text-white uppercase">
              Neuron
            </span>
          </Link>

          {/* CENTER: NAV LINKS */}
          <div className="hidden items-center gap-1 rounded-xl p-1 md:flex">
            {NAV_LINKS.map((link) => (
              <button
                key={link.name}
                onClick={() => {
                  const target = sectionMapping[link.name];
                  if (target) scrollToSection(target);
                }}
                className="flex items-center gap-2 rounded-lg px-4 py-2 text-[9px] font-black tracking-widest text-neutral-400 uppercase transition-all hover:bg-white/5 hover:text-white"
              >
                <link.icon size={12} className="opacity-50" />
                {link.name}
              </button>
            ))}
          </div>
        </div>

        {/* RIGHT: ACTIONS */}
        <div className="flex items-center gap-4">
          <Link
            href="/sign-in"
            className="px-4 text-[10px] font-black tracking-widest text-neutral-400 uppercase transition-colors hover:text-white"
          >
            Sign In
          </Link>
          <AppButton
            label="Start Building"
            variant="primary"
            icon={<LogIn size={14} />}
            className="rounded-xl bg-white px-7 py-4 text-[10px] font-black tracking-widest text-black uppercase shadow-[0_0_20px_rgba(255,255,255,0.1)] transition-all hover:bg-neutral-200 active:scale-95"
          />
        </div>
      </div>
    </motion.nav>
  );
}
