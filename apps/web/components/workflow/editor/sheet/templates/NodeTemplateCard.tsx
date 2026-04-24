'use client';

import React from 'react';
import { Info, Plus } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { DraggableItem } from "@neuron/ui";
import * as Icons from 'lucide-react';

const getIcon = (iconName: string) => {
    const IconComponent = (Icons as any)[iconName];
    return IconComponent || Icons.Layers2;
};

export function NodeTemplateCard({
                                     template,
                                     onSelect
                                 }: {
    template: any;
    onSelect: () => void
}) {
    // Resolve string icon name to Component
    const IconComponent = (Icons as any)[template.icon] || Icons.Layers2;

    return (
        <DraggableItem id={template.key} data={{ template }}>
            <div className="group relative">
                <button
                    onClick={onSelect}
                    className="w-full flex items-center gap-4 p-4 rounded-2xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.05] hover:border-white/10 transition-all duration-300 text-left"
                >
                    {/* Icon Container: Flips colors on group hover */}
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/5 border border-white/5 group-hover:bg-white group-hover:text-black transition-all duration-500">
                        <IconComponent size={18} strokeWidth={1.5} />
                    </div>

                    {/* Text Content */}
                    <div className="flex-1 min-w-0 pr-6">
                        <h4 className="text-sm font-semibold text-white/90 group-hover:text-white transition-colors truncate">
                            {template.label}
                        </h4>
                        <div className="flex items-center gap-2">
               <span className="text-[10px] font-medium text-neutral-600 uppercase tracking-tight">
                 {template.category}
               </span>
                            <span className="h-1 w-1 rounded-full bg-neutral-800" />
                            <p className="text-[10px] text-neutral-500 truncate font-mono">
                                {template.type}
                            </p>
                        </div>
                    </div>

                    <Plus className="h-4 w-4 text-neutral-700 opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0" />
                </button>

                {/* Info Popover: Floating UI */}
                <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center">
                    <Popover>
                        <PopoverTrigger asChild>
                            <button
                                onClick={(e) => {
                                    e.stopPropagation(); // Prevents triggering node selection
                                    e.preventDefault();  // Prevents drag start
                                }}
                                className="p-2 text-neutral-600 hover:text-white transition-colors rounded-full hover:bg-white/5"
                            >
                                <Info size={14} />
                            </button>
                        </PopoverTrigger>
                        <PopoverContent
                            side="left"
                            align="center"
                            sideOffset={15}
                            className="w-72 p-5 bg-[#0A0A0A] border-white/10 rounded-2xl backdrop-blur-2xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] animate-in fade-in zoom-in-95 duration-200"
                        >
                            <div className="space-y-3">
                                <div className="flex items-center gap-2">
                                    <div className="h-1 w-1 rounded-full bg-white" />
                                    <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-400">
                     Documentation
                   </span>
                                </div>
                                <p className="text-xs leading-relaxed text-neutral-400 font-medium">
                                    {template.description}
                                </p>
                                {/* Visual Indicator of Output Type */}
                                <div className="pt-2 border-t border-white/5">
                                    <span className="text-[9px] text-neutral-600 uppercase font-bold">Returns: Object</span>
                                </div>
                            </div>
                        </PopoverContent>
                    </Popover>
                </div>
            </div>
        </DraggableItem>
    );
}