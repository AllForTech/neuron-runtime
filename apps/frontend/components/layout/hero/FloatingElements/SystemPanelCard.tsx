'use client';

import { motion } from 'framer-motion';
import { FloatingItem } from '@/constants';
import { Zap } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

export function SystemPanelCard({ item }: { item: FloatingItem }) {
  const Icon = item.icon;

  // Define core PCB theme colors for specific interactions
  const powerColor = 'rgba(255, 255, 255, 0.9)'; // Primary White
  const traceColor = 'rgba(255, 255, 255, 0.1)'; // Faint White
  const copperColor = 'rgba(251, 191, 36, 0.5)'; // Amber for mounting rings

  return (
    <motion.div
      whileHover="hover"
      initial="rest"
      animate="rest"
      className="group relative h-[180px] w-[360px] select-none"
    >
      {/* The actual PCB Substrate (angular shape) */}
      <div
        className="absolute inset-0 border border-white/10 bg-neutral-950"
        style={{
          clipPath: item.shape.clipPath,
          filter: 'drop-shadow(0 25px 50px rgba(0,0,0,0.6))',
        }}
      />

      {/* ENGINEERING LAYER (SVG) */}
      <svg className="pointer-events-none absolute inset-0 z-10 h-full w-full">
        <defs>
          {/* Unique filter IDs to prevent collisions */}
          <filter
            id={`power-glow-${item.title}`}
            x="-20%"
            y="-20%"
            width="140%"
            height="140%"
          >
            <feGaussianBlur stdDeviation="3.5" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* 1. Structural Details (Mounting Holes) */}
        <g stroke={copperColor} strokeWidth="0.5" fill="none">
          <circle cx="15" cy="15" r="4.5" />
          <circle cx="15" cy="165" r="4.5" />
          <circle cx="345" cy="15" r="4.5" />
          <circle cx="345" cy="165" r="4.5" />
        </g>

        {/* 2. Hardware Metadata Text (Fake technical docs) */}
        <g
          fill="rgba(255,255,255,0.2)"
          textAnchor="end"
          className="font-mono text-[7px] tracking-wider"
        >
          <text x="330" y="25">
            MODEL: LAZARUS_v1
          </text>
          <text x="330" y="35">
            LAYER: {item.side === 'left' ? 'TOP_SI' : 'BOT_SI'}
          </text>
          <text x="330" y="155">
            PROTO_UNIT
          </text>
        </g>

        {/* 3. Base PCB Traces (Dormant State) */}
        <path
          d={item.shape.path}
          stroke={traceColor}
          strokeWidth="0.75"
          fill="none"
          className="opacity-80 transition-opacity group-hover:opacity-100"
        />

        {/* 4. Active Power-On Trace (Animated) */}
        <motion.path
          d={item.shape.path}
          stroke={powerColor}
          strokeWidth="1.25"
          fill="none"
          pathLength={1}
          variants={{
            rest: { strokeDashoffset: 1, opacity: 0 },
            hover: { strokeDashoffset: 0, opacity: 1 },
          }}
          transition={{ duration: 0.6, ease: 'easeInOut' }}
          style={{
            strokeDasharray: 1,
            filter: `url(#power-glow-${item.title})`,
          }}
        />
      </svg>

      {/* CONTENT LAYER */}
      <div className="relative z-20 flex h-full flex-col justify-between p-6 pl-10">
        {/* Visual Connector Pins Indicator */}
        <div
          className={cn(
            'absolute top-0 bottom-0 flex w-1 flex-col justify-center gap-1.5 opacity-50',
            item.side === 'left' ? '-right-px' : '-left-px'
          )}
        >
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="h-px w-1 bg-amber-600/60" />
          ))}
        </div>

        {/* TOP BLOCK (Module Info) */}
        <div className="flex items-start gap-4">
          {/* Port Box */}
          <div className="mt-1 flex flex-col items-center gap-1 rounded-md border border-white/10 bg-white/5 p-2">
            <span className="font-mono text-[7px] text-neutral-600 uppercase">
              Input
            </span>
            <Icon
              size={14}
              className="text-white/70 transition-colors group-hover:text-white"
            />
          </div>

          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-bold tracking-[0.2em] text-white uppercase">
                {item.title}
              </span>
              <Zap className="h-3 w-3 text-amber-500 opacity-40 transition-opacity group-hover:opacity-100" />
            </div>
            <span className="max-w-[280px] text-[9px] leading-normal text-neutral-500">
              {item.desc}
            </span>
          </div>
        </div>

        {/* BOTTOM BLOCK (Module ID) */}
        <div className="flex items-center gap-2">
          <Badge className="rounded border border-zinc-800 bg-zinc-900 font-mono text-[8px] tracking-widest text-neutral-500 uppercase">
            MOD::LAZ_{item.title.replace(/\s+/g, '_').toUpperCase()}
          </Badge>
          {item.shape.clipPath.includes('polygon') && (
            <div className="h-1.5 w-1.5 rounded-full bg-emerald-600 shadow-[0_0_5px_1px_rgba(16,185,129,0.3)] group-hover:animate-pulse" />
          )}
        </div>
      </div>
    </motion.div>
  );
}
