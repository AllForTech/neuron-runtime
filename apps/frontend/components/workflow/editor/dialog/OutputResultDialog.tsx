'use client';

import React, { useState } from 'react';
import {
  X,
  Database,
  Activity,
  Globe,
  Copy,
  Check,
  Download,
  ExternalLink,
  ShieldCheck,
  Cpu,
  Zap,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogHeader,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { OutputRenderer } from './OutputRenderer';
import { cn } from '@/lib/utils';

interface OutputResultDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  nodeName: string;
  result: string;
  config: {
    format: {
      type: 'json' | 'markdown' | 'text' | 'html';
    };
    delivery: {
      statusCode: number;
      mode: string;
    };
  };
}

export function OutputResultDialog({
  isOpen,
  onOpenChange,
  nodeName,
  result,
  config,
}: OutputResultDialogProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(result);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent
        className={cn(
          'flex h-[87dvh] max-w-4xl flex-col justify-start overflow-hidden p-0',
          'rounded-lg border border-neutral-800 bg-neutral-900/80 shadow-[0_0_50px_-12px_rgba(0,0,0,0.8)] backdrop-blur-xl'
        )}
      >
        {/* 1. EDITOR-THEMED HEADER */}
        <header className="flex flex-col gap-1 border-b border-neutral-800/50 bg-neutral-900/40 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="rounded-md border border-blue-500/20 bg-blue-500/10 p-1.5">
                <Database className="h-3.5 w-3.5 text-blue-400" />
              </div>
              <div>
                <DialogTitle className="text-sm font-semibold text-neutral-100">
                  {nodeName || 'INSPECTOR_RESULT'}
                </DialogTitle>
                <p className="mt-0.5 text-[10px] text-neutral-500 uppercase">
                  Lazarus Execution Node • 0xAF42
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2"></div>
          </div>
        </header>

        {/* 3. MAIN CONTENT (Wrapped in Editor Style) */}
        <div className="group relative h-full! flex-1 overflow-hidden p-6 py-1!">
          <div className="no-scrollbar transition-200 relative h-full w-full overflow-y-auto rounded-md bg-neutral-800/60 shadow-inner hover:bg-neutral-800/80">
            {/* The Renderer */}
            <div className="p-5">
              <OutputRenderer content={result} format={config.format} />
            </div>
          </div>
        </div>

        {/* 4. INDUSTRIAL FOOTER (The "Command" Bar) */}
        <div className="flex items-center justify-between border-t border-neutral-800/50 bg-neutral-900/40 p-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 font-mono text-[10px] text-neutral-600">
              <Cpu className="h-3 w-3" />
              <span>NODE_SIG: {result.length}B_SIG</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              className="h-8 text-[10px] font-bold text-neutral-500 hover:text-white"
            >
              <Download className="mr-2 h-3.5 w-3.5" /> .JSON_EXPORT
            </Button>
            <Button
              size="sm"
              className="h-8 rounded-sm bg-blue-600 px-6 text-[10px] font-black tracking-widest text-white shadow-[0_0_15px_rgba(37,99,235,0.2)] hover:bg-blue-500"
            >
              ANALYZE_ASSET <ExternalLink className="ml-2 h-3 w-3" />
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
