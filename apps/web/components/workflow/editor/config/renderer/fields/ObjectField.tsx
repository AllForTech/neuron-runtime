'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Box, CornerDownRight } from 'lucide-react';
import { ObjectFieldSchema } from "@neuron/shared";
import { ConfigFieldRenderer } from "../ConfigFieldRenderer";
import { getLayoutClass } from "../Layout";
import { cn } from "@/lib/utils";


export function ObjectField({ field, values, onChange }: {
    field: ObjectFieldSchema;
    values: Record<string, any>;
    onChange: (path: string, value: any) => void
}) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            className="group/object relative flex flex-col gap-4 rounded-2xl border border-white/[0.03] bg-white/[0.01] p-4 transition-all duration-300 hover:border-white/[0.08] hover:bg-white/[0.02]"
        >
            {/* Object Header */}
            {field.label && (
                <div className="flex items-center gap-2 px-1">
                    <div className="flex h-5 w-5 items-center justify-center rounded-md bg-white/5 border border-white/10 text-neutral-400 group-hover/object:text-white transition-colors shadow-sm">
                        <Box size={10} strokeWidth={2.5} />
                    </div>
                    <span className="text-[11px] font-bold uppercase tracking-[0.1em] text-neutral-500 group-hover/object:text-neutral-300 transition-colors">
                        {field.label}
                    </span>
                    <div className="h-[1px] flex-1 bg-gradient-to-r from-white/10 to-transparent" />
                </div>
            )}

            {/* Nested Content Area */}
            <div className="relative">
                {/* Tree-style Indentation Guide */}
                <div className="absolute -left-1 top-0 bottom-2 w-[1px] bg-gradient-to-b from-white/10 via-white/[0.05] to-transparent" />

                <div className={cn(
                    "relative z-10 flex flex-col gap-5 pl-4",
                    getLayoutClass(field.layout)
                )}>
                    {field.fields.map((subField) => (
                        <div key={subField.path} className="relative">
                            {/* Visual Branch Connector */}
                            <CornerDownRight
                                size={10}
                                className="absolute -left-[14px] top-3 text-white/[0.03] group-hover/object:text-white/10 transition-colors"
                            />

                            <ConfigFieldRenderer
                                field={subField}
                                values={values}
                                onChange={onChange}
                            />
                        </div>
                    ))}
                </div>
            </div>

            {/* Edge Accent Detail */}
            <div className="absolute left-0 top-1/4 h-1/2 w-[1px] bg-gradient-to-b from-transparent via-white/20 to-transparent opacity-0 transition-opacity group-hover/object:opacity-100" />
        </motion.div>
    );
}