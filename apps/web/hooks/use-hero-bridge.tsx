'use client';

import type { SectionType } from '@/components/layout/hero/HeroSection';

export function useHeroBridge() {
  const scrollToSection = (section: SectionType) => {
    const el = document.getElementById(`section-${section}`);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  return { scrollToSection };
}