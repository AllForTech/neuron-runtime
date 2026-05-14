'use client';

import * as React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { X, Sparkles, Settings } from 'lucide-react';

interface DialogWrapperProps {
  children?: React.ReactNode;
  triggerButton?: React.ReactNode | string;
  title?: React.ReactNode | string;
  description?: React.ReactNode | string;
  actionButton?: React.ReactNode;
  className?: string;
  contentClassName?: string;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export const DialogWrapper = ({
  children,
  triggerButton = 'Create new',
  title,
  description,
  actionButton,
  className,
  contentClassName,
  open,
  onOpenChange,
}: DialogWrapperProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        {triggerButton}
      </DialogTrigger>
      <DialogContent
        className={cn(
          "max-h-[85dvh] w-[600px] rounded-2xl border border-white/[0.08] bg-[#0A0A0A]/95 backdrop-blur-2xl p-0 overflow-hidden shadow-2xl",
          "[&_[data-state=open]]:animate-in [&_[data-state=open]]:fade-in-95 [&_[data-state=open]]:zoom-in-95",
          "[&_[data-state=closed]]:animate-out [&_[data-state=closed]]:fade-out-95 [&_[data-state=closed]]:zoom-out-95",
          className
        )}
      >
        {/* Gradient mesh */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-500/[0.03] rounded-full blur-[120px] mix-blend-screen" />
          <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-blue-500/[0.02] rounded-full blur-[100px] mix-blend-screen" />
        </div>

        {/* Header */}
        <DialogHeader className="relative px-6 py-5 border-b border-white/[0.04]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-br from-purple-500/20 to-blue-500/20 border border-white/[0.08] shadow-[0_0_20px_-8px_rgba(167,139,250,0.2)]">
                <Sparkles size={16} className="text-purple-400" />
              </div>
              <div>
                <DialogTitle className="text-[14px] font-semibold text-neutral-200">
                  {title}
                </DialogTitle>
                {description && (
                  <DialogDescription className="text-[11px] text-neutral-500 mt-0.5">
                    {description}
                  </DialogDescription>
                )}
              </div>
            </div>
            <DialogClose asChild>
              <Button
                variant="ghost"
                size="sm"
                className="relative h-8 w-8 rounded-lg text-neutral-500 hover:text-neutral-300 hover:bg-white/[0.04]"
              >
                <X size={14} />
              </Button>
            </DialogClose>
          </div>
        </DialogHeader>

        {/* Content */}
        <div className={cn(
          "relative max-h-[60dvh] overflow-y-auto px-6 py-5",
          contentClassName
        )}>
          {children}
        </div>

        {/* Footer */}
        {actionButton && (
          <DialogFooter className="relative flex items-center justify-end gap-3 px-6 py-4 border-t border-white/[0.04] bg-white/[0.02]">
            <DialogClose asChild>
              <Button variant="outline" className="h-9 rounded-lg border-white/[0.06] bg-white/[0.02] text-neutral-400 hover:bg-white/[0.04] hover:text-neutral-300">
                <span className="text-[11px]">Cancel</span>
              </Button>
            </DialogClose>
            {actionButton}
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
};