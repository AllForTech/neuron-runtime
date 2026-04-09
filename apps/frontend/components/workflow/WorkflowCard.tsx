'use client';

import React from 'react';
import {
  Calendar,
  ChevronRight,
  Trash2,
  Layers,
  Zap,
  Clock,
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useWorkflow } from '@/hooks/workflow/useWorkflow';
import { WorkflowType } from '../../../shared/src/types/workflow.types';
import { cn } from '@/lib/utils';

export const WorkflowCard = ({
  workflow,
  clickAction,
  deleteAction,
}: {
  workflow: WorkflowType;
  clickAction: (id: string) => Promise<void>;
  deleteAction: (id: string) => Promise<void>;
}) => {
  const { handleClick, handleDelete, isDeleting } = useWorkflow({
    workflow,
    clickAction,
    deleteAction,
  });

  return (
    <Card
      onClick={handleClick}
      className={cn(
        'group relative h-50 w-full cursor-pointer overflow-hidden',
        'rounded-2xl border-[0.5px] border-white/5 bg-neutral-900/50 backdrop-blur-sm transition-all duration-500',
        'hover:border-primary hover:shadow-[0_0_30px_-10px_rgba(59,130,246,0.2)]'
      )}
    >
      <div className="relative z-10 flex h-full flex-col justify-between p-3 py-1!">
        {/* 2. TOP SECTION: ICON & NAME */}
        <div className="flex items-start justify-between">
          <div className="flex gap-4">
            <div className="rounded-xl border border-white/5 bg-neutral-800/50 p-3 transition-all duration-500">
              <Zap className="group-hover:text-primary h-5 w-5 text-neutral-500 transition-all group-hover:drop-shadow-[0_0_8px_rgba(59,130,246,0.5)]" />
            </div>
            <div className="flex flex-col">
              <h3 className="text-sm font-bold tracking-tight text-neutral-200 transition-colors group-hover:text-white">
                {workflow.name || 'Untitled_Process'}
              </h3>
              <div className="mt-1 flex items-center gap-1.5 text-[10px] tracking-widest text-neutral-500">
                <Layers className="h-3 w-3" />
                <span>{workflow.description}</span>
              </div>
            </div>
          </div>
        </div>

        {/* 3. CENTER METRICS (Subtle) */}
        <div className="flex items-center gap-4 py-2">
          <div className="flex items-center gap-1.5">
            <Calendar className="group-hover:text-primary h-3 w-3 text-neutral-600 transition-colors" />
            <span className="text-[10px] text-neutral-500">
              {new Date(workflow.createdAt).toLocaleDateString()}
            </span>
          </div>
          <div className="flex items-center gap-1.5 border-l border-white/5 pl-4">
            <Clock className="h-3 w-3 text-neutral-600" />
            <span className="text-[10px] text-neutral-500">Status: Active</span>
          </div>
        </div>

        {/* 4. FOOTER ACTIONS */}
        <div className="flex items-center justify-between border-t border-white/5 pt-2 transition-colors group-hover:border-blue-500/10">
          <div className="group-hover:text-primary flex items-center gap-1 text-[10px] font-black tracking-tighter text-neutral-600 uppercase">
            Secure_Engine
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              onClick={handleDelete}
              disabled={isDeleting}
              className="h-8 w-8 rounded-lg p-0 text-neutral-600 transition-all hover:bg-red-500/10 hover:text-red-500"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
            <Button
              onClick={handleClick}
              className="hover:bg-primary hover:border-primary group/btn h-8 rounded-lg border border-white/10 bg-white/5 px-4 text-[11px] font-bold text-neutral-300 transition-all duration-300 hover:text-black"
            >
              open{' '}
              <ChevronRight className="ml-1.5 h-3 w-3 transition-transform group-hover/btn:translate-x-0.5" />
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
};
