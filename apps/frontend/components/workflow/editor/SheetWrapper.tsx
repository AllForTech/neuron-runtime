'use client';

import React, { useState } from 'react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Settings2, ArrowLeft } from 'lucide-react';
import { ContextRegistrationSheet } from '../editor/sheet/ContextRegistrationSheet';
import { NodeMeta } from '@/components/workflow/editor/nodes/NodeMeta';
import { ExecutionConfigSettings } from './sheet/ExecutionConfigSettings';
import { NodeExecutionConfig } from '@neuron/shared';

interface ReusableSheetProps {
  children: React.ReactNode;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  side?: 'top' | 'bottom' | 'left' | 'right';
  className?: string;
  nodeId?: string;
  showContextSettings?: boolean;
  nodeMeta?: { label: string; description?: string };
  onMetaUpdate?: (key: string, value: any) => void;
  // New Props for Execution Config
  executionConfig?: NodeExecutionConfig;
  onExecutionConfigUpdate?: (config: NodeExecutionConfig) => void;
}

export function SheetWrapper({
  children,
  open,
  onOpenChange,
  title = '',
  side = 'right',
  className,
  nodeId,
  showContextSettings = true,
  nodeMeta,
  onMetaUpdate,
  executionConfig,
  onExecutionConfigUpdate,
}: ReusableSheetProps) {
  const [view, setView] = useState<'config' | 'execution'>('config');

  // Reset view when sheet closes
  const handleOpenChange = (open: boolean) => {
    onOpenChange(open);
    if (!open) setTimeout(() => setView('config'), 300);
  };

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetContent
        side={side}
        className={cn(
          'm-2.5 mb-3.5 flex h-full! max-h-[97dvh] w-[550px]! flex-col overflow-hidden rounded-xl border! border-neutral-800/50 bg-neutral-950/95 p-0! shadow-2xl backdrop-blur-xl',
          className
        )}
      >
        {/* DYNAMIC HEADER */}
        <SheetHeader className="flex flex-row items-center justify-between space-y-0 border-b border-neutral-800/50 bg-neutral-900/20 px-6 py-4">
          <div className="flex flex-col">
            <SheetTitle className="text-sm text-neutral-100">
              {view === 'config' ? title : 'Execution Settings'}
            </SheetTitle>
            <p className="text-[10px] font-bold tracking-widest text-neutral-500 uppercase">
              {view === 'config' ? 'Node Configuration' : 'Runtime Policy'}
            </p>
          </div>

          {/* VIEW TOGGLE BUTTON */}
            {nodeId && (
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setView(view === 'config' ? 'execution' : 'config')}
                    className="mr-6 h-8 gap-2 border-neutral-800 bg-neutral-900/50 text-neutral-300 hover:bg-neutral-800"
                >
                    {view === 'config' ? (
                        <>
                            <Settings2 className="h-3.5 w-3.5" />
                            <span className="text-[11px]">Execution Settings</span>
                        </>
                    ) : (
                        <>
                            <ArrowLeft className="h-3.5 w-3.5" />
                            <span className="text-[11px]">Back to Config</span>
                        </>
                    )}
                </Button>
            )}
        </SheetHeader>

        <ScrollArea className="h-[80dvh] flex-1">
          <div className="space-y-6 py-6 px-6">
            {view === 'config' ? (
              <>
                {onMetaUpdate && (
                  <NodeMeta
                    label={nodeMeta?.label ?? ''}
                    description={nodeMeta?.description ?? ''}
                    onUpdate={onMetaUpdate}
                  />
                )}
                <div className="space-y-5">{children}</div>
                {showContextSettings && nodeId && (
                  <div className="border-t border-neutral-800/50 w-full pt-6">
                    <p className="mb-4 text-[10px] font-bold tracking-[0.2em] text-neutral-600 uppercase">
                      Neuron Engine Core
                    </p>
                    <ContextRegistrationSheet nodeId={nodeId} />
                  </div>
                )}
              </>
            ) : (
              <ExecutionConfigSettings
                config={executionConfig}
                onUpdate={onExecutionConfigUpdate}
              />
            )}
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}
