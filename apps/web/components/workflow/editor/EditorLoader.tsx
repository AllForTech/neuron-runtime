'use client';

import React from 'react';
import { Zap, Cpu, MessageSquareCode } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

export function EditorLoader() {
  return (
    <div className="fixed inset-0 z-[999] flex flex-col items-center justify-center space-y-12 bg-black/95 p-6 backdrop-blur-sm">
      {/* --- CORE VISUALIZATION: Node Assembly --- */}
      <div className="relative flex h-52 w-80 items-center justify-center">
        {/* Connecting Lines (Background) */}
        <svg
          className="absolute inset-0 h-full w-full opacity-30"
          viewBox="0 0 320 208"
        >
          {/* Path 1: Trigger to LLM */}
          <path
            d="M 160 30 C 160 70, 70 70, 70 110"
            stroke="#3b82f6"
            strokeWidth="1.5"
            fill="none"
            className="animate-pulse"
            strokeDasharray="6 6"
          />
          {/* Path 2: LLM to Slack */}
          <path
            d="M 70 110 C 70 150, 250 150, 250 110"
            stroke="#a855f7"
            strokeWidth="1.5"
            fill="none"
            strokeDasharray="6 6"
            className="animate-pulse [animation-delay:1s]"
          />
          {/* Path 3: Slack to End */}
          <path
            d="M 250 110 C 250 150, 160 150, 160 190"
            stroke="#eab308"
            strokeWidth="1.5"
            fill="none"
            strokeDasharray="6 6"
            className="animate-pulse [animation-delay:2s]"
          />
        </svg>

        {/* 1. Trigger Node (Top) */}
        <div className="animate-in fade-in slide-in-from-top-4 absolute top-0 flex flex-col items-center gap-2 duration-1000">
          <div className="rounded-full border border-blue-500/30 bg-blue-500/10 p-3">
            <Zap className="h-5 w-5 animate-pulse text-blue-500" />
          </div>
        </div>

        {/* 2. LLM Node (Mid-Left) */}
        <div className="animate-in fade-in slide-in-from-left-4 absolute left-0 flex flex-col items-center gap-2 duration-1000 [animation-delay:0.8s]">
          <div className="relative rounded-xl border border-purple-500/30 bg-purple-500/10 p-3">
            <Cpu className="h-5 w-5 text-purple-500" />
            {/* Blinking status dot */}
            <div className="absolute -top-1 -right-1 h-2.5 w-2.5 animate-ping rounded-full border border-purple-500 bg-purple-500/20" />
          </div>
        </div>

        {/* 3. Slack Node (Mid-Right) */}
        <div className="animate-in fade-in slide-in-from-right-4 absolute right-0 flex flex-col items-center gap-2 duration-1000 [animation-delay:1.5s]">
          <div className="relative rounded-xl border border-amber-500/30 bg-amber-500/10 p-3">
            <MessageSquareCode className="h-5 w-5 text-amber-500" />
            <div className="absolute -top-1 -right-1 h-2.5 w-2.5 animate-ping rounded-full border border-amber-500 bg-amber-500/20 [animation-delay:0.3s]" />
          </div>
        </div>

        {/* 4. End Node (Bottom) */}
        <div className="animate-in fade-in slide-in-from-bottom-4 absolute bottom-0 flex flex-col items-center gap-2 duration-1000 [animation-delay:2.2s]">
          <div className="flex h-10 w-10 items-center justify-center rounded-full border border-neutral-800 bg-neutral-900">
            <div className="h-3.5 w-3.5 animate-pulse rounded-full bg-neutral-700" />
          </div>
        </div>
      </div>

      {/* --- TEXT & BRANDING --- */}
      <div className="max-w-sm space-y-4 text-center">
        <div className="flex items-center justify-center gap-3">
          <span className="text-4xl font-extrabold tracking-tighter text-white">
            Neuron
          </span>
          <Badge
            variant="outline"
            className="h-6 border-neutral-800 px-2 font-mono text-[10px] tracking-widest text-neutral-500 uppercase"
          >
            Workflow IDE
          </Badge>
        </div>

        <div className="relative pt-4">
          {/* Subtle status text that cycles through phases */}
          <p className="h-4 animate-pulse font-mono text-[11px] tracking-widest text-neutral-500 uppercase">
            <StatusCycle />
          </p>
          {/* Micro-loader bar below the text */}
          <div className="relative mx-auto mt-3 h-0.5 w-16 overflow-hidden rounded-full bg-neutral-900">
            <div className="animate-indeterminate-progress absolute inset-y-0 left-0 w-full -translate-x-full rounded-full bg-blue-500/40" />
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Helper component to cycle through loading messages (optional polish)
 */
function StatusCycle() {
  const [index, setIndex] = React.useState(0);
  const messages = [
    'Initializing Runtime...',
    'Assembling Graph Structure...',
    'Resolving Dependencies...',
    'Connecting System APIs...',
    'Finalizing Editor Interface...',
  ];

  React.useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % messages.length);
    }, 2200); // Align with node assembly speed
    return () => clearInterval(interval);
  }, []);

  return messages[index];
}

/**
 * A simple Badge component if you don't have it extracted
 */
function Badge({ children, className, variant }: any) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2 py-0.5 font-medium',
        className
      )}
    >
      {children}
    </span>
  );
}
