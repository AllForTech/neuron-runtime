'use client';

import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TooltipButtonProps {
  icon: LucideIcon;
  label: string;
  onClick: () => void;
  className?: string;
  side?: 'left' | 'right';
}

export function TooltipButton({
  icon: Icon,
  label,
  onClick,
  className,
  side = 'right',
}: TooltipButtonProps) {
  return (
    <div className="group relative flex items-center justify-center">
      <button
        onClick={onClick}
        className={cn(
          'flex h-8 w-full items-center justify-center rounded-xl p-1 transition-all duration-200',
          'text-neutral-400 hover:bg-white/10 hover:text-white active:scale-90',
          'border border-transparent hover:border-white/10',
          className
        )}
      >
        <Icon size={18} strokeWidth={1.5} />
      </button>

      {/* Premium Tooltip Label */}
      <div
        className={cn(
          'pointer-events-none absolute z-50 hidden transition-all duration-300 group-hover:block',
          'rounded-lg border border-white/10 bg-neutral-900/90 px-3 py-1.5 shadow-2xl backdrop-blur-md',
          'text-[10px] font-bold tracking-[0.15em] whitespace-nowrap text-white uppercase',
          side === 'right' ? 'left-14' : 'right-14'
        )}
      >
        {label}
      </div>
    </div>
  );
}
