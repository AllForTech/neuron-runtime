'use client';

import { ReactNode } from 'react';
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuTrigger,
} from '@radix-ui/react-context-menu';
import { cn } from '@/lib/utils';

interface ContextMenuWrapperProps {
  trigger: ReactNode;
  children: ReactNode;
  className?: string;
  open?: boolean;
}

export const ContextMenuWrapper = ({
  trigger,
  children,
  className,
}: ContextMenuWrapperProps) => {
  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>{trigger}</ContextMenuTrigger>
      <ContextMenuContent
        className={cn(
          'nopan nodrag rounded-md border border-neutral-700 bg-neutral-900 p-1 text-xs text-neutral-100 shadow-md',
          className
        )}
      >
        {children}
      </ContextMenuContent>
    </ContextMenu>
  );
};
