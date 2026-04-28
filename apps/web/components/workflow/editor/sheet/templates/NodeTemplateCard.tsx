'use client';

import React from 'react';
import { Info, Plus, ChevronRight } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { DraggableItem } from "@neuron/ui";
import * as Icons from 'lucide-react';
import { cn } from "@/lib/utils";

export function NodeTemplateCard({ template, onSelect }: { template: any; onSelect: () => void }) {
    const IconComponent = (Icons as any)[template.icon] || Icons.Layers2;

    return (
        /* Ensure the draggable container doesn't clip its children */
        <DraggableItem className="w-full overflow-visible!" id={template.key} data={{ template }}>
            <div className="group flex flex-col gap-2 transition-transform duration-300 active:scale-95">
                {/* Elevation Layer (The Card) */}
                <div
                    onClick={onSelect}
                    className={cn(
                        "relative flex items-center gap-4 p-4 cursor-pointer rounded-[20px]",
                        "bg-[#0A0A0A] border border-white/[0.06]",
                        "hover:border-white/20 hover:bg-[#111111]",
                        "transition-all duration-300 shadow-sm hover:shadow-[0_8px_30px_rgb(0,0,0,0.5)]"
                    )}
                >
                    {/* Icon - Using the primary theme contrast */}
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/[0.03] border border-white/5 group-hover:bg-white group-hover:text-black transition-all duration-500">
                        <IconComponent size={20} strokeWidth={1.5} />
                    </div>

                    <div className="flex-1 min-w-0">
                        <h4 className="text-[14px] font-medium text-white/90 tracking-tight">
                            {template.label}
                        </h4>
                        <p className="text-[11px] text-neutral-500 line-clamp-1 mt-0.5">
                            {template.description || "Component for specialized automation."}
                        </p>
                    </div>

                    {/* Subtle Action Indicator */}
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/5 group-hover:bg-white/10 transition-colors">
                        <Plus size={14} className="text-neutral-500 group-hover:text-white" />
                    </div>

                    {/* Popover / Info */}
                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Popover>
                            <PopoverTrigger asChild>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        e.preventDefault();
                                    }}
                                    className="p-1.5 text-neutral-600 hover:text-white"
                                >
                                    <Info size={14} />
                                </button>
                            </PopoverTrigger>
                            <PopoverContent
                                side="right"
                                sideOffset={20}
                                className="w-64 p-4 bg-[#0F0F0F] border-white/10 rounded-2xl shadow-2xl backdrop-blur-xl"
                            >
                                <div className="space-y-2">
                                    <span className="text-[9px] font-bold uppercase tracking-widest text-white/40">Details</span>
                                    <p className="text-[12px] text-neutral-400 leading-relaxed">
                                        {template.description}
                                    </p>
                                </div>
                            </PopoverContent>
                        </Popover>
                    </div>
                </div>

                {/* Meta Layer (The Specs) - Modern separated feel */}
                <div className="flex items-center justify-between px-2">
                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1.5">
                            <div className={cn(
                                "h-1 w-1 rounded-full",
                                template.category === 'Trigger' ? "bg-amber-400" : "bg-white/40"
                            )} />
                            <span className="text-[9px] font-bold uppercase tracking-widest text-neutral-600">
                                {template.category}
                            </span>
                        </div>
                    </div>

                    <div className="flex items-center gap-1 opacity-40 group-hover:opacity-100 transition-opacity">
                        <span className="text-[9px] font-mono text-neutral-500">
                            {template.type}
                        </span>
                        <ChevronRight size={10} className="text-neutral-700" />
                    </div>
                </div>
            </div>
        </DraggableItem>
    );
}