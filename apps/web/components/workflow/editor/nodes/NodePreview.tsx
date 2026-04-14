'use client';

import React, { useState } from 'react';
import { Eye, Maximize2, Terminal } from 'lucide-react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { JsonRenderer } from '@/components/JsonRenederer';
import { cn } from '@/lib/utils';
import { OutputResultDialog } from '@/components/workflow/editor/dialog/OutputResultDialog';

interface NodePreviewProps {
  nodeId: string;
  output: any;
  className?: string;
  status: 'idle' | 'running' | 'success' | 'error';
  nodeType?: string;
  nodeData?: any;
  config: any;
}

export function NodePreview({
  nodeId,
  output,
  config,
  status,
  className,
  nodeType,
  nodeData,
}: NodePreviewProps) {
  const [isFullViewOpen, setIsFullViewOpen] = useState(false);

  if (!output) return null;

  const isOutputNode = nodeType === 'outputNode';

  return (
    <div className={cn('container-fit z-50', className)}>
      <div className="flex items-center gap-1 rounded-md border border-neutral-800 bg-neutral-900/80 p-1 shadow-2xl backdrop-blur-md">
        {/* 1. QUICK PREVIEW (Existing) */}
        <Popover>
          <PopoverTrigger asChild>
            <Button
              size="xs"
              variant="ghost"
              className="group h-6 w-6 rounded-full p-0 hover:bg-blue-500/20 hover:text-blue-400"
            >
              <Eye className="h-3 w-3 transition-transform group-hover:scale-110" />
            </Button>
          </PopoverTrigger>
          <PopoverContent
            side="top"
            align="start"
            className="no-scrollbar transition-200 mb-[20px] min-w-[500px] overflow-hidden rounded-xl border-neutral-800 bg-neutral-950 p-0 shadow-2xl hover:scale-105"
          >
            <div className="m-2 flex items-center justify-between rounded-md border-b border-neutral-800 bg-neutral-900 px-3 py-2">
              <span className="flex items-center gap-2 text-[10px] font-bold text-neutral-500">
                <Terminal className="h-3 w-3" /> Quick Preview
              </span>
              <p className="font-mono text-[9px] text-neutral-600">
                ID: {nodeId.split('-')[0]}
              </p>
            </div>
            <div className="no-scrollbar w-full! p-2">
              <JsonRenderer
                data={output}
                maxHeight="max-h-[320px]"
                className="w-full! border-none bg-transparent"
              />
            </div>
          </PopoverContent>
        </Popover>

        {/* 2. FULL DIALOG TRIGGER (Output Node Only) */}
        {isOutputNode && (
          <>
            <Button
              onClick={() => setIsFullViewOpen(true)}
              size="xs"
              variant="ghost"
              className="group h-6 w-6 rounded-full p-0 hover:bg-emerald-500/20 hover:text-emerald-400"
            >
              <Maximize2 className="h-3 w-3 transition-transform group-hover:scale-110" />
            </Button>

            <OutputResultDialog
              isOpen={isFullViewOpen}
              onOpenChange={setIsFullViewOpen}
              nodeName={nodeData?.label || 'Final Data Output'}
              result={
                typeof output === 'object' ? JSON.stringify(output) : output
              }
              config={config}
            />
          </>
        )}

        {/* Status Divider & Text */}
        <div className="mx-1 h-4 w-[1px] bg-neutral-800" />
        <span className="max-w-[120px] truncate pr-2 pl-1 font-mono text-[9px] text-neutral-400">
          {typeof output === 'string'
            ? output.substring(0, 15)
            : isOutputNode
              ? 'Formatted Output'
              : 'Object Resolved'}
        </span>
      </div>
    </div>
  );
}
