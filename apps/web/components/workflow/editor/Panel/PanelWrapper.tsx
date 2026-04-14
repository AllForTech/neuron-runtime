'use client';

import React from 'react';
import { Panel, PanelPosition } from 'reactflow';
import { cn } from '@/lib/utils';

interface PanelWrapperProps {
  children: React.ReactNode;
  position?: PanelPosition;
  className?: string;
  /** Optional title for the panel header */
  title?: string;
  /** Adds a specific width to the panel */
  width?: string;
}

export function PanelWrapper({
  children,
  position = 'top-right',
  className,
  title,
  width = 'w-64',
}: PanelWrapperProps) {
  return (
    <Panel position={position} className={cn('m-2 p-0!', className)}>
      <div
        className={cn(
          'flex flex-col rounded-xl border border-neutral-800/50',
          'bg-neutral-900/50 shadow-2xl backdrop-blur-md',
          'transition-all duration-200',
          width
        )}
      >
        {/* Optional Header Section */}
        {title && (
          <div className="flex items-center justify-between border-b border-neutral-800/50 px-4 py-2">
            <span className="text-[10px] font-bold tracking-widest text-neutral-500 uppercase">
              {title}
            </span>
            <div className="bg-primary/40 h-1.5 w-1.5 rounded-full" />
          </div>
        )}

        {/* Content Area */}
        <div className="p-1 text-xs text-neutral-200">{children}</div>
      </div>
    </Panel>
  );
}
