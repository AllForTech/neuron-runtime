'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, LayoutGrid, List } from 'lucide-react';
import { NodeConfigSection } from "@neuron/shared";
import { cn } from "@/lib/utils";
import { getLayoutClass } from "./Layout";
import { ConfigFieldRenderer } from "./ConfigFieldRenderer";

interface ConfigSectionRendererProps {
    section: NodeConfigSection;
    values: Record<string, any>;
    onChange: (path: string, value: any) => void;
}

export function ConfigSectionRenderer({
                                          section,
                                          values,
                                          onChange
                                      }: ConfigSectionRendererProps) {
    const [isCollapsed, setIsCollapsed] = useState(section.defaultCollapsed ?? false);

    const isCollapsible = section.collapsible !== false;
    const Icon = section.layout === 'grid' ? LayoutGrid : List;

    return (
        <section className="group/section flex flex-col gap-4">
            <div
                className={cn(
                    "flex items-center justify-between transition-opacity duration-300",
                    isCollapsible ? "cursor-pointer" : "pointer-events-none"
                )}
                onClick={() => isCollapsible && setIsCollapsed(!isCollapsed)}
            >
                <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                        <div className="flex h-5 w-5 items-center justify-center rounded-md bg-white/[0.03] border border-white/5 shadow-inner">
                            <Icon size={10} className="text-neutral-500" />
                        </div>
                        {section.title && (
                            <h3 className="text-[13px] font-bold tracking-tight text-white/90">
                                {section.title}
                            </h3>
                        )}
                    </div>
                    {section.description && (
                        <p className="text-[11px] leading-relaxed text-neutral-500 max-w-[90%]">
                            {section.description}
                        </p>
                    )}
                </div>

                {isCollapsible && (
                    <motion.div
                        animate={{ rotate: isCollapsed ? -90 : 0 }}
                        transition={{ type: "spring", stiffness: 300, damping: 20 }}
                        className="flex h-6 w-6 items-center justify-center rounded-full bg-white/[0.02] border border-white/5 opacity-0 group-hover/section:opacity-100 transition-opacity"
                    >
                        <ChevronDown size={14} className="text-neutral-500" />
                    </motion.div>
                )}
            </div>

            <AnimatePresence initial={false}>
                {!isCollapsed && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
                        className="overflow-hidden"
                    >
                        <div className={cn(
                            "relative rounded-2xl border border-white/[0.04] bg-white/[0.01] p-5 shadow-2xl",
                            getLayoutClass(section.layout)
                        )}>
                            <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] to-transparent pointer-events-none rounded-2xl" />

                            <div className="relative z-10 flex flex-col gap-6">
                                {section.fields.map((field) => (
                                    <ConfigFieldRenderer
                                        key={field.path}
                                        field={field}
                                        values={values}
                                        onChange={onChange}
                                    />
                                ))}
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </section>
    );
}