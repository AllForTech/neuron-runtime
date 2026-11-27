'use client';

export type SectionType = 'intro' | 'features' | 'capabilities' | 'demos';

export function useHeroBridge() {
  const scrollToSection = (section: SectionType) => {
    const el = document.getElementById(`section-${section}`);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  return { scrollToSection };
}