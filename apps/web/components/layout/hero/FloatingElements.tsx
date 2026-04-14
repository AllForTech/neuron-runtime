'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { SectionType } from './HeroSection';
import { cn } from '@/lib/utils';
import { memo } from 'react';
import { DATA } from '@/constants';

export const FloatingElements = memo(function FloatingElements({
  section,
  cardRefs,
}: {
  section: SectionType;
  cardRefs: React.MutableRefObject<(HTMLDivElement | null)[]>;
}) {
  const items = DATA[section] || [];
  const leftItems = items.filter((i) => i.side === 'left');
  const rightItems = items.filter((i) => i.side === 'right');

  const renderColumn = (columnItems: typeof items, side: 'left' | 'right') => (
    <div
      className={cn(
        'absolute top-1/2 z-50 flex w-[380px] -translate-y-1/2 flex-col gap-15 pt-10',
        side === 'left' ? 'right-[120%] items-end' : 'left-[120%] items-start'
      )}
    >
      <AnimatePresence mode="wait">
        {columnItems.map((item, i) => {
          const Icon = item.icon;
          const refIndex = side === 'left' ? i : i + leftItems.length;

          const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
            const { currentTarget, clientX, clientY } = e;
            const { left, top } = currentTarget.getBoundingClientRect();
            const x = clientX - left;
            const y = clientY - top;
            currentTarget.style.setProperty('--mouse-x', `${x}px`);
            currentTarget.style.setProperty('--mouse-y', `${y}px`);
          };

          return (
            <motion.div
              key={item.title}
              onMouseMove={handleMouseMove}
              ref={(el) => {
                cardRefs.current[refIndex] = el;
              }}
              initial={{
                opacity: 0,
                x: side === 'left' ? -60 : 60,
                scale: 0.95,
                filter: 'blur(20px)',
              }}
              animate={{ opacity: 1, x: 0, scale: 1, filter: 'blur(0px)' }}
              exit={{
                opacity: 0,
                x: side === 'left' ? -60 : 60,
                scale: 0.95,
                filter: 'blur(20px)',
              }}
              transition={{
                type: 'spring',
                stiffness: 100,
                damping: 20,
                delay: i * 0.1,
              }}
              whileHover={{
                scale: 1.05,
              }}
              className="group relative w-[330px] overflow-hidden rounded-xl p-6 transition-all duration-700"
            >
              {/* --- GLASS BASE --- */}
              <div className="absolute inset-0 bg-neutral-950/90 backdrop-blur-3xl" />

              {/* --- BORDER / GLOW SYSTEM --- */}
              <div className="absolute inset-0 rounded-lg border border-white/[0.05] transition-colors duration-500 group-hover:border-white/[0.15]" />
              {/*<div className="absolute inset-px rounded-lg bg-gradient-to-b from-white/[0.08] to-transparent opacity-50" />*/}

              {/* --- INTERACTIVE LIGHT SWEEP --- */}
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_var(--mouse-x,50%)_var(--mouse-y,50%),rgba(255,255,255,0.06),transparent_80%)] opacity-0 transition-opacity duration-1000 group-hover:opacity-100" />

              {/* --- CONTENT --- */}
              <div className="relative z-10 flex flex-col gap-4">
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <div className="absolute inset-0 bg-white/20 opacity-0 blur-xl transition-opacity group-hover:opacity-30" />
                    <div className="relative rounded-xl border border-white/10 bg-white/[0.03] p-3 text-white">
                      <Icon size={18} strokeWidth={1.5} />
                    </div>
                  </div>

                  <div className="flex flex-col">
                    <span className="text-[10px] font-black tracking-[0.3em] text-white/30 uppercase transition-colors group-hover:text-white/50">
                      Module.0{i + 1}
                    </span>
                    <h3 className="text-sm font-semibold tracking-tight text-white">
                      {item.title}
                    </h3>
                  </div>
                </div>

                <p className="text-[12px] leading-relaxed font-medium text-neutral-400 transition-colors group-hover:text-neutral-300">
                  {item.desc}
                </p>

                {/* --- DECORATIVE TECHNICAL FOOTER --- */}
                <div className="flex items-center justify-between border-t border-white/[0.05] pt-2">
                  <span className="font-mono text-[8px] tracking-tighter text-neutral-600 uppercase">
                    Status: Ready_Active
                  </span>
                  <div className="flex gap-1">
                    <div className="h-1 w-1 rounded-full bg-white/20" />
                    <div className="h-1 w-1 rounded-full bg-white/20 transition-colors group-hover:bg-white" />
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );

  return (
    <>
      {renderColumn(leftItems, 'left')}
      {renderColumn(rightItems, 'right')}
    </>
  );
});
