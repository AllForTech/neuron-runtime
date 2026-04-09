'use client';

import React, { useState } from 'react';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { ChevronDown, Info, Tag, Layout } from 'lucide-react';
import { cn } from '@/lib/utils';

interface NodeMetaCollapsibleProps {
  label: string;
  description?: string;
  onUpdate: (key: string, data: any) => void;
}

export function NodeMeta({
  label,
  description = '',
  onUpdate,
}: NodeMetaCollapsibleProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Collapsible
      open={isOpen}
      onOpenChange={setIsOpen}
      className="w-full overflow-hidden rounded-xl border border-neutral-800/50 bg-neutral-900/40 transition-all duration-200"
    >
      {/* Header / Trigger */}
      <CollapsibleTrigger className="group flex w-full items-center justify-between p-4 transition-colors hover:bg-neutral-800/30">
        <div className="flex items-center gap-3">
          <div className="rounded-md border border-white/10 bg-white/5 p-2 transition-colors group-hover:border-white/20">
            <Layout className="h-4 w-4 text-white" />
          </div>
          <div className="text-left">
            <p className="mb-2 text-[10px] leading-none font-bold tracking-widest text-neutral-500 uppercase">
              Node Identity
            </p>
            <h4 className="max-w-[280px] truncate text-sm font-medium text-neutral-200">
              {label || 'Untitled Node'}
            </h4>
          </div>
        </div>
        <ChevronDown
          className={cn(
            'h-4 w-4 text-neutral-500 transition-transform duration-200',
            isOpen && 'rotate-180 text-white'
          )}
        />
      </CollapsibleTrigger>

      {/* Form Content */}
      <CollapsibleContent className="space-y-4 border-t border-neutral-800/50 bg-neutral-950/20 px-4 pt-4 pb-5">
        <div className="space-y-2">
          <Label className="ml-0.5 flex items-center gap-1.5 text-[11px] text-neutral-400">
            <Tag className="h-3 w-3" /> Display Name
          </Label>
          <Input
            value={label}
            onChange={(e) =>
              onUpdate('meta', { label: e.target.value, description })
            }
            placeholder="e.g., Process User Data"
            className="h-9 border-neutral-800 bg-neutral-900 text-white focus:border-white/20 focus:ring-0"
          />
        </div>

        <div className="space-y-2">
          <Label className="ml-0.5 flex items-center gap-1.5 text-[11px] text-neutral-400">
            <Info className="h-3 w-3" /> Description
          </Label>
          <Textarea
            value={description}
            onChange={(e) =>
              onUpdate('meta', { label, description: e.target.value })
            }
            placeholder="Describe what this node does..."
            className="min-h-[80px] resize-none border-neutral-800 bg-neutral-900 text-sm leading-relaxed text-white focus:border-white/20 focus:ring-0"
          />
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}
