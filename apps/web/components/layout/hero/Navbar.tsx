'use client';

import { motion, useScroll, useMotionValueEvent } from 'motion/react';
import { useState, useRef, useEffect } from 'react';
import { AppButton } from '@/components/CustomButton';
import { LogIn } from 'lucide-react';
import Link from 'next/link';
import { AppBrand } from '@/components/brand/AppBrand';
import { cn } from '@/lib/utils';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Menu, X } from 'lucide-react';
import type { SectionType } from '@/components/layout/hero/HeroSection';

const SECTIONS: { name: string; id: SectionType }[] = [
  { name: 'Features', id: 'features' },
  { name: 'Capabilities', id: 'capabilities' },
  { name: 'Demos', id: 'demos' },
];

function scrollToSection(id: SectionType) {
  const el = document.getElementById(`section-${id}`);
  if (el) {
    el.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }
}

function scrollToTop() {
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function DesktopNav() {
  return (
    <div className="hidden items-center gap-1 rounded-xl p-1 md:flex">
      {SECTIONS.map((section) => (
        <button
          key={section.id}
          onClick={() => scrollToSection(section.id)}
          className="rounded-lg px-4 py-2 text-[9px] font-black tracking-widest text-neutral-400 uppercase transition-all hover:bg-white/5 hover:text-white"
        >
          {section.name}
        </button>
      ))}
      <a
        href="/docs"
        className="rounded-lg px-4 py-2 text-[9px] font-black tracking-widest text-neutral-400 uppercase transition-all hover:bg-white/5 hover:text-white"
      >
        Docs
      </a>
    </div>
  );
}

function MobileNav() {
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="flex h-8 w-8 items-center justify-center rounded-full text-neutral-400 hover:text-white md:hidden"
        >
          <Menu className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent
        side="right"
        className="flex w-full flex-col bg-neutral-950/95 border-white/10 p-8 backdrop-blur-xl sm:max-w-sm"
      >
        <div className="flex items-center justify-between">
          <AppBrand name="NEURON" size="sm" variant="compact" />
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setOpen(false)}
            className="h-8 w-8 rounded-full text-neutral-400 hover:text-white"
          >
            <X className="h-6 w-6" />
          </Button>
        </div>

        <nav className="mt-16 flex flex-col gap-8">
          {SECTIONS.map((section) => (
            <button
              key={section.id}
              onClick={() => {
                scrollToSection(section.id);
                setOpen(false);
              }}
              className="text-left text-2xl font-bold tracking-tighter text-neutral-400 transition-colors hover:text-white"
            >
              {section.name}
            </button>
          ))}
          <a
            href="/docs"
            className="text-left text-2xl font-bold tracking-tighter text-neutral-400 transition-colors hover:text-white"
          >
            Docs
          </a>
        </nav>

        <div className="mt-auto">
          <Link
            href="/sign-in"
            className="flex w-full items-center justify-center gap-2 rounded-full border border-white/10 bg-white/5 px-8 py-4 text-[11px] font-bold tracking-widest text-white uppercase backdrop-blur-md transition-all hover:bg-white/10 active:scale-95"
            onClick={() => setOpen(false)}
          >
            Sign In
          </Link>
        </div>
      </SheetContent>
    </Sheet>
  );
}

export function Navbar() {
  const { scrollY } = useScroll();
  const [hidden, setHidden] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const prevScrollY = useRef(0);

  useMotionValueEvent(scrollY, 'change', (latest) => {
    setScrolled(latest > 20);

    if (latest > 100) {
      if (latest > prevScrollY.current) {
        setHidden(true);
      } else {
        setHidden(false);
      }
    } else {
      setHidden(false);
    }

    prevScrollY.current = latest;
  });

  return (
    <motion.nav
      variants={{
        visible: { y: 0, opacity: 1 },
        hidden: { y: -80, opacity: 0 },
      }}
      animate={hidden ? 'hidden' : 'visible'}
      transition={{ duration: 0.35, ease: 'easeInOut' }}
      className={cn(
        'pointer-events-none fixed top-0 right-0 left-0 z-[100] flex justify-center px-4 py-3 transition-colors duration-500',
        scrolled ? 'px-4 md:px-6' : 'px-4'
      )}
    >
      <div
        className={cn(
          'pointer-events-auto flex w-full max-w-6xl items-center justify-between rounded-2xl px-5 py-2.5 shadow-2xl backdrop-blur-xl transition-all duration-500',
          scrolled
            ? 'border border-white/[0.06] bg-neutral-950/80'
            : 'bg-white/[0.03]'
        )}
      >
        <button onClick={scrollToTop} className="group flex items-center gap-2">
          <AppBrand name="NEURON" size="sm" variant="compact" className="[&_span]:!text-white" />
        </button>

        <DesktopNav />

        <div className="flex items-center gap-4">
          <Link
            href="/sign-in"
            className="hidden px-4 text-[10px] font-black tracking-widest text-neutral-400 uppercase transition-colors hover:text-white sm:block"
          >
            Sign In
          </Link>
          <AppButton
            label="Start Building"
            variant="primary"
            icon={<LogIn size={14} />}
            onClick={() => window.location.href = '/sign-in'}
            className="rounded-xl bg-white px-7 py-4 text-[10px] font-black tracking-widest text-black uppercase shadow-[0_0_20px_rgba(255,255,255,0.1)] transition-all hover:bg-neutral-200 active:scale-95"
          />
          <MobileNav />
        </div>
      </div>
    </motion.nav>
  );
}