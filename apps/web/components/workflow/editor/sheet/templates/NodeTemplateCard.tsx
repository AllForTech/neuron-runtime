'use client';

import { Info, Plus } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { DraggableItem } from "@neuron/ui";
import { cn } from '@/lib/utils';

export function NodeTemplateCard({ template, onSelect }: { template: any; onSelect: () => void }) {
    const Icon = template.icon;

    return (
        <DraggableItem id={template.key} data={{ template }}>
            <div className="group relative">
                <button
                    onClick={onSelect}
                    className="w-full flex items-center gap-4 p-4 rounded-2xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.05] hover:border-white/10 transition-all duration-300 text-left"
                >
                    {/* Icon Container */}
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/5 border border-white/5 group-hover:bg-white group-hover:text-black transition-all duration-500">
                        {Icon ? <Icon size={20} strokeWidth={1.5} /> : <Layers2 size={20} />}
                    </div>

                    {/* Text Content */}
                    <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-semibold text-white/90 group-hover:text-white transition-colors">
                            {template.label}
                        </h4>
                        <p className="text-[11px] text-neutral-500 line-clamp-1">
                            {template.type}
                        </p>
                    </div>

                    <Plus className="h-4 w-4 text-neutral-700 opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0" />
                </button>

                {/* Info Popover - Positioned absolutely so it doesn't break the layout */}
                <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center h-full pr-10">
                    <Popover>
                        <PopoverTrigger asChild>
                            <button
                                onClick={(e) => e.stopPropagation()}
                                className="p-2 text-neutral-600 hover:text-white transition-colors"
                            >
                                <Info size={14} />
                            </button>
                        </PopoverTrigger>
                        <PopoverContent
                            side="left"
                            className="w-72 p-5 bg-[#0C0C0C] border-white/10 rounded-2xl backdrop-blur-xl shadow-2xl"
                        >
                            <div className="space-y-3">
                                <div className="flex items-center gap-2">
                                    <div className="h-1 w-1 rounded-full bg-white" />
                                    <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-400">Documentation</span>
                                </div>
                                <p className="text-xs leading-relaxed text-neutral-400">
                                    {template.description}
                                </p>
                            </div>
                        </PopoverContent>
                    </Popover>
                </div>
            </div>
        </DraggableItem>
    );
}