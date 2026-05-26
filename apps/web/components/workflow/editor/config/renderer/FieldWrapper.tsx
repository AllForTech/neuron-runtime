'use client';

import React from 'react';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger
} from "@/components/ui/tooltip";
import { Info } from "lucide-react";
import { cn } from "@/lib/utils";

export function FieldWrapper({ label, description, required, children, className }: any) {
    return (
        <TooltipProvider delayDuration={200}>
            <div className={cn("flex flex-col gap-2 w-full group", className)}>
                {label && (
                    <div className="flex items-center justify-between px-0.5">
                        <div className="flex items-center gap-1.5">
                            <label className="text-[11px] font-semibold tracking-tight text-neutral-400 group-hover:text-neutral-200 transition-colors">
                                {label}
                            </label>

                            {required && (
                                <span className="text-[7px] font-bold text-red-500/50 animate-pulse">
                                    ●
                                </span>
                            )}

                            {/* Description Tooltip */}
                            {description && (
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <button
                                            type="button"
                                            className="p-0.5 rounded-full text-neutral-600 hover:text-neutral-300 hover:bg-white/[0.05] transition-all"
                                        >
                                            <Info size={10} strokeWidth={2.5} />
                                        </button>
                                    </TooltipTrigger>
                                    <TooltipContent
                                        side="right"
                                        align="center"
                                        className={cn(
                                            "max-w-[240px] px-3 py-2 rounded-lg border border-white/[0.08]",
                                            "bg-[#0D0D0D]/95 backdrop-blur-xl shadow-2xl",
                                            "text-[10px] leading-relaxed text-neutral-400 font-medium",
                                            "animate-in fade-in zoom-in-95 duration-200"
                                        )}
                                    >
                                        <div className="relative z-10">
                                            {description}
                                        </div>
                                        {/* Subtle background glow inside tooltip */}
                                        <div className="absolute inset-0 bg-gradient-to-br from-white/[0.03] to-transparent pointer-events-none rounded-lg" />
                                    </TooltipContent>
                                </Tooltip>
                            )}
                        </div>
                    </div>
                )}

                <div className="w-full relative">
                    {children}
                </div>
            </div>
        </TooltipProvider>
    );
}