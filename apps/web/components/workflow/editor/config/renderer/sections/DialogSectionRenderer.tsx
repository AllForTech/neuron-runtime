'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { X, Settings, Sparkles, ChevronRight } from 'lucide-react';
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
                        <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500/10 to-blue-500/10 border border-white/[0.06]">
                            <Settings size={14} className="text-purple-400" />
                        </div>
                        <div className="flex flex-col items-start text-left">
                            <span className="text-[12px] font-medium text-neutral-300">
                                {section.title}
                            </span>
                            {section.description && (
                                <span className="text-[10px] text-neutral-600">
                                    {section.description}
                                </span>
                            )}
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-[10px] text-neutral-600 group-hover:text-neutral-400">
                            {section?.title || "Configure"}
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
                    "[&_[data-state=closed]]:animate-out [&_[data_state=closed]]:fade-out-95 [&_[data_state=closed]]:zoom-out-95"
                )}
            >
                {/* Gradient mesh background */}
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
                                    {section.title}
                                </DialogTitle>
                                <DialogDescription className="text-[11px] text-neutral-500 mt-0.5">
                                    {section.description}
                                </DialogDescription>
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
                <div className="relative max-h-[60dvh] overflow-y-auto px-6 py-5">
                    <div className="flex flex-col gap-4">
                        {section.fields.map((field: any, idx: number) => (
                            <motion.div
                                key={`${field.id}-${nanoid()}`}
                                initial={{ opacity: 0, y: 8 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.03 }}
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
                    <DialogClose asChild>
                        <Button
                            variant="outline"
                            className="h-9 rounded-lg border-white/[0.06] bg-white/[0.02] text-neutral-400 hover:bg-white/[0.04] hover:text-neutral-300"
                        >
                            <span className="text-[11px]">Cancel</span>
                        </Button>
                    </DialogClose>
                    <Button
                        className="h-9 rounded-lg bg-white text-neutral-950 hover:bg-neutral-200"
                        onClick={() => setOpen(false)}
                    >
                        <span className="text-[11px] font-medium">Save Changes</span>
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}