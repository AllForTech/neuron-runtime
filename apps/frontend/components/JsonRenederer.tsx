'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import JsonViewer from '@/components/ui/json-viewer';

interface JsonOutputProps {
  data: Record<string, any> | any[];
  title?: string;
  className?: string;
  maxHeight?: string;
}

export function JsonRenderer({
  data,
  title = 'Response Data',
  className,
  maxHeight = 'h-[500px]',
}: JsonOutputProps) {
  return (
    <div
      id={'hide-scrollbar'}
      className={cn(
        'no-scrollbar overflow-hidden rounded-md border border-neutral-800 bg-neutral-900/30 backdrop-blur-sm',
        className
      )}
    >
      <JsonViewer
        data={data}
        title={title}
        className={cn('no-scrollbar m-0! bg-transparent text-xs', maxHeight)}
      />
    </div>
  );
}
