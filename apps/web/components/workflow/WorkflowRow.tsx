'use client';

import React from 'react';
import {
  Play,
  MoreVertical,
  Trash2,
  ExternalLink,
  Activity,
  Clock,
  Zap,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export const WorkflowRow = ({ workflow, onOpen, onDelete }: any) => {
  return (
    <div
      onClick={onOpen}
      className="group relative flex cursor-pointer items-center justify-between border-b border-neutral-800/40 px-6 py-4 transition-all duration-200 hover:bg-white/[0.03]"
    >
      {/* 1. HOVER INDICATOR (The White Bar) */}
      <div className="absolute top-0 left-0 h-full w-[2px] origin-center scale-y-0 bg-white transition-transform duration-300 group-hover:scale-y-100" />

      {/* 2. PRIMARY INFO: NAME & STATUS */}
      <div className="flex min-w-[300px] items-center gap-6">
        <div className="flex items-center gap-3">
          <div className="rounded-md border border-neutral-800 bg-neutral-900 p-2 transition-colors group-hover:border-neutral-700">
            <Zap className="h-3.5 w-3.5 text-neutral-500 transition-colors group-hover:text-white" />
          </div>
          <div>
            <h3 className="text-[13px] font-semibold text-neutral-200 transition-colors group-hover:text-white">
              {workflow.name}
            </h3>
            <p className="mt-0.5 font-mono text-[10px] tracking-tighter text-neutral-500 uppercase">
              ID: {workflow.id?.slice(0, 8) || '0x_internal'}
            </p>
          </div>
        </div>
      </div>

      {/* 3. TECHNICAL METRICS (Scannable Data) */}
      <div className="hidden flex-1 items-center gap-12 px-12 lg:flex">
        <div className="flex flex-col gap-1">
          <span className="text-[9px] font-bold tracking-widest text-neutral-600 uppercase">
            Last Run
          </span>
          <div className="flex items-center gap-2">
            <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]" />
            <span className="font-mono text-[11px] text-neutral-400">
              Success
            </span>
          </div>
        </div>

        <div className="flex flex-col gap-1">
          <span className="text-[9px] font-bold tracking-widest text-neutral-600 uppercase">
            Created
          </span>
          <div className="flex items-center gap-2 text-neutral-500">
            <Clock className="h-3 w-3" />
            <span className="font-mono text-[11px]">
              {new Date(workflow.createdAt).toLocaleDateString()}
            </span>
          </div>
        </div>
      </div>

      {/* 4. CONTEXTUAL ACTIONS (Hidden until hover) */}
      <div className="flex translate-x-2 items-center gap-3 opacity-0 transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100">
        <Button
          variant="ghost"
          size="sm"
          className="h-8 gap-2 rounded-none text-[11px] font-bold text-white transition-all hover:bg-white hover:text-black"
        >
          <Play className="h-3 w-3 fill-current" /> RUN_ENGINE
        </Button>

        <div className="mx-1 h-4 w-[1px] bg-neutral-800" />

        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          className="p-2 text-neutral-500 transition-colors hover:text-red-500"
        >
          <Trash2 className="h-4 w-4" />
        </button>
        <button className="p-2 text-neutral-500 transition-colors hover:text-white">
          <MoreVertical className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};
