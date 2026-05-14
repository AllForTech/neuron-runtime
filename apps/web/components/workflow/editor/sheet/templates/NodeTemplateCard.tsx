'use client';

import React from 'react';
import { Info, Plus } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { DraggableItem } from "@neuron/ui";
import * as Icons from 'lucide-react';
import { cn } from "@/lib/utils";

export function NodeTemplateCard({ template, onSelect }: { template: any; onSelect: () => void }) {
    const IconComponent = (Icons as any)[template.icon] || Icons.Layers2;

    return (
        <DraggableItem className="w-full" id={template.key} data={{ template }}>
            <div
                onClick={onSelect}
                className={cn(
                    "group relative flex flex-col gap-1.5 p-2.5 cursor-pointer rounded-xl",
                    "bg-white/[0.02] border border-white/[0.04]",
                    "hover:border-white/10 hover:bg-white/[0.05]",
                    "transition-all duration-200 active:scale-[0.98]"
                )}
            >
                <div className="flex items-center gap-3">
                    {/* Icon - Smaller and sharper */}
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/[0.03] border border-white/5 group-hover:bg-white group-hover:text-black transition-all duration-300">
                        <IconComponent size={14} strokeWidth={2} />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                            <h4 className="text-[12px] font-semibold text-white/90 tracking-tight truncate">
                                {template.label}
                            </h4>
                            <div className="flex items-center gap-1 shrink-0">
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                e.preventDefault();
                                            }}
                                            className="p-1 text-neutral-600 hover:text-neutral-400 opacity-0 group-hover:opacity-100 transition-opacity"
                                        >
                                            <Info size={11} />
                                        </button>
                                    </PopoverTrigger>
                                    <PopoverContent
                                        side="right"
                                        sideOffset={10}
                                        className="w-56 p-3 bg-neutral-900 border-white/10 rounded-xl shadow-2xl backdrop-blur-xl"
                                    >
                                        <p className="text-[11px] text-neutral-400 leading-relaxed">
                                            {template.description || "Specialized automation component."}
                                        </p>
                                    </PopoverContent>
                                </Popover>
                                <Plus size={12} className="text-neutral-600 group-hover:text-white transition-colors" />
                            </div>
                        </div>

                        {/* Meta Info - Integrated inside for vertical savings */}
                        <div className="flex items-center gap-2 mt-0.5">
                            <div className={cn(
                                "h-1 w-1 rounded-full",
                                template.category === 'Trigger' ? "bg-amber-400" : "bg-white/20"
                            )} />
                            <span className="text-[8px] font-bold uppercase tracking-[0.1em] text-neutral-600">
                                {template.category}
                            </span>
                            <span className="text-[8px] font-mono text-neutral-700 ml-auto truncate opacity-0 group-hover:opacity-100 transition-opacity">
                                {template.type}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </DraggableItem>
    );
}