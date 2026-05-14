'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Settings, Sparkles, ChevronRight } from 'lucide-react';
import { ConfigFieldRenderer } from "../ConfigFieldRenderer";
import {NodeConfigSection} from "@neuron/shared";
import {nanoid} from "nanoid";

interface DialogSectionProps {
    section: NodeConfigSection
    values: Record<string, any>;
    onChange: (path: string, value: any) => void;
}

export function DialogSectionRenderer({ section, values, onChange }: DialogSectionProps) {
    const [open, setOpen] = useState(false);

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <button
                    className={cn(
                        "relative flex items-center justify-between w-full rounded-2xl border border-white/[0.04] bg-white/[0.02] backdrop-blur-sm p-4",
                        "transition-all duration-300 hover:border-white/[0.08] hover:bg-white/[0.03] active:scale-[0.99]",
                        "group"
                    )}
                >
                    <div className="flex items-center gap-3">
                        <div className={cn(
                            "flex items-center justify-center w-7 h-7 rounded-lg bg-white/[0.04] border border-white/[0.06] transition-all duration-300",
                            "text-neutral-500 group-hover:text-white group-hover:shadow-[0_0_12px_-4px_rgba(255,255,255,0.15)]"
                        )}>
                            <Settings size={13} strokeWidth={1.5} />
                        </div>
                        <div className="flex flex-col items-start text-left">
                            <h3 className="text-[11px] font-semibold tracking-wide text-neutral-300">
                                {section.title}
                            </h3>
                            {section.description && (
                                <p className="text-[10px] text-neutral-600 mt-0.5 line-clamp-1">{section.description}</p>
                            )}
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-[10px] text-neutral-600 group-hover:text-neutral-400">
                            Configure
                        </span>
                        <ChevronRight size={12} className="text-neutral-600 group-hover:text-neutral-400 transition-transform group-hover:translate-x-0.5" />
                    </div>
                </button>
            </DialogTrigger>

            <DialogContent
                className={cn(
                    "max-h-[85dvh] w-[600px] rounded-2xl border border-white/[0.08] bg-[#0A0A0A]/95 backdrop-blur-2xl",
                    "p-0 overflow-hidden shadow-2xl",
                    "[&_[data-state=open]]:animate-in [&_[data-state=open]]:fade-in-95 [&_[data-state=open]]:zoom-in-95",
                    "[&_[data-state=closed]]:animate-out [&_[data-state=closed]]:fade-out-95 [&_[data-state=closed]]:zoom-out-95"
                )}
            >
                {/* Gradient mesh background */}
                <div className="absolute inset-0 pointer-events-none overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-white/[0.03] via-transparent to-neutral-950/30" />
                </div>

                {/* Header */}
                <DialogHeader className="relative px-6 py-5 border-b border-white/[0.04]">
                    <div className="flex items-center gap-3">
                        <div className={cn(
                            "flex items-center justify-center w-7 h-7 rounded-lg bg-white/[0.04] border border-white/[0.06]",
                            "text-white shadow-[0_0_12px_-4px_rgba(255,255,255,0.15)]"
                        )}>
                            <Sparkles size={13} strokeWidth={1.5} />
                        </div>
                        <div>
                            <DialogTitle className="text-[11px] font-semibold tracking-wide text-neutral-300">
                                {section.title}
                            </DialogTitle>
                            {section.description && (
                                <DialogDescription className="text-[10px] text-neutral-600 mt-0.5">
                                    {section.description}
                                </DialogDescription>
                            )}
                        </div>
                    </div>
                </DialogHeader>

                {/* Content */}
                <div className="relative max-h-[60dvh] overflow-y-auto px-6 py-5">
                    <div className="flex flex-col gap-4">
                        {section.fields.map((field: any, idx: number) => (
                            <motion.div
                                key={`${field.id}-${idx}`}
                                initial={{ opacity: 0, x: -4 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: idx * 0.02 }}
                            >
                                <ConfigFieldRenderer
                                    field={field}
                                    values={values}
                                    onChange={onChange}
                                />
                            </motion.div>
                        ))}
                    </div>
                </div>

                {/* Footer */}
                <div className="relative flex items-center justify-end gap-3 px-6 py-4 border-t border-white/[0.04] bg-white/[0.02]">
                    <Button
                        className="h-9 rounded-lg bg-white text-neutral-950 hover:bg-neutral-200"
                        onClick={() => setOpen(false)}
                    >
                        <span className="text-[11px] font-medium">Done</span>
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}