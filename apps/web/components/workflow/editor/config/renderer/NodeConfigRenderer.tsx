'use client';

import React from 'react';
import { ConfigSectionRenderer } from "./ConfigSectionRenderer";
import { Layers2 } from 'lucide-react';

export function NodeConfigRenderer({ schema, values, onChange }: any) {
    return (
        <div className="relative flex flex-col w-full min-h-full">
            {/* Background gradient mesh - Maintained Obsidian Aesthetic */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
                <div className="absolute top-0 left-1/4 w-96 h-96 bg-white/[0.02] rounded-full blur-[120px] mix-blend-screen" />
                <div className="absolute bottom-1/3 right-1/4 w-64 h-64 bg-white/[0.015] rounded-full blur-[100px] mix-blend-screen" />
            </div>

            {/* Header indicator */}
            <div className="relative flex items-center gap-2 px-3 py-4 mb-2">
                <div className="flex items-center gap-1.5">
                    <Layers2 size={12} className="text-neutral-500" />
                    <span className="text-[10px] font-bold tracking-widest text-neutral-600 uppercase">
                        Configuration
                    </span>
                </div>
                <div className="h-px flex-1 bg-white/[0.04]" />
                <span className="text-[9px] font-mono text-neutral-700">
                    {schema.sections.length} sections
                </span>
            </div>

            {/* Main content area */}
            <div className="relative flex flex-col gap-3 px-2 pb-8">
                {schema.sections.map((section: any, index: number) => (
                    <div
                        key={`${section.id}-${index}`}
                        className="relative w-full group"
                    >
                        {/* Subtle gradient border on hover - Handled via standard CSS */}
                        <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-white/[0.05] via-transparent to-white/[0.015] opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

                        <div className="relative transition-transform duration-300 active:scale-[0.995]">
                            <ConfigSectionRenderer
                                section={section}
                                values={values}
                                onChange={onChange}
                            />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}