'use client';

import React, { memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, ListFilter, Layers } from "lucide-react";
import { ArrayFieldSchema } from "@neuron/shared";
import { getValueAtPath } from "@/lib/config/path";
import { ConfigFieldRenderer } from "../ConfigFieldRenderer";
import { cn } from "@/lib/utils";

export function ArrayField({ field, values, onChange }: {
    field: ArrayFieldSchema;
    values: Record<string, any>;
    onChange: (path: string, value: any) => void
}) {
    const items = getValueAtPath(values, field.path, []) as any[];

    const addItem = () => {
        const newItem = field.defaultItem || {};
        onChange(field.path, [...items, newItem]);
    };

    const removeItem = (index: number) => {
        const newItems = [...items];
        newItems.splice(index, 1);
        onChange(field.path, newItems);
    };

    return (
        <div className="flex flex-col w-full">
            <div className="flex items-center justify-between px-0.5 pb-3">
                <div className="flex items-center gap-2.5">
                    <div className="flex items-center justify-center w-5 h-5 rounded-md bg-white/[0.03] text-neutral-600">
                        <Layers size={10} strokeWidth={2} />
                    </div>
                    <span className="text-[10px] font-semibold uppercase tracking-widest text-neutral-500">
                        {field.label}
                    </span>
                    <span className="flex h-4 min-w-[18px] items-center justify-center rounded-full bg-white/[0.04] px-1.5 text-[9px] font-mono text-neutral-500 border border-white/[0.05]">
                        {items.length}
                    </span>
                </div>

                <button
                    onClick={addItem}
                    className="flex items-center gap-1.5 text-[10px] font-medium text-neutral-500 hover:text-white transition-colors group"
                >
                    <Plus size={11} className="text-neutral-600 group-hover:text-white transition-colors" />
                    <span>Add</span>
                </button>
            </div>

            <div className="flex flex-col gap-2">
                <AnimatePresence mode="popLayout">
                    {items.map((item, index) => (
                        <motion.div
                            key={`${field.path}-${index}`}
                            layout
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.98 }}
                            className="group relative"
                        >
                            {/* Glass card */}
                            <div className="relative rounded-xl border border-white/[0.04] bg-white/[0.02] p-4 transition-all duration-300 hover:border-white/[0.08]">
                                {/* Subtle gradient */}
                                <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] via-transparent to-transparent pointer-events-none rounded-xl" />
                                
                                <div className="flex items-center justify-between relative z-10 mb-3">
                                    <div className="flex items-center gap-2">
                                        <span className="text-[9px] font-bold text-neutral-600 uppercase tracking-widest">
                                            {field.itemLabel || `Item ${index + 1}`}
                                        </span>
                                        <span className="text-[8px] text-neutral-700 font-mono">
                                            #{index + 1}
                                        </span>
                                    </div>

                                    <button
                                        onClick={() => removeItem(index)}
                                        className={cn(
                                            "flex items-center justify-center p-1.5 rounded-lg transition-all",
                                            "text-neutral-600 hover:text-red-400 hover:bg-red-500/10",
                                            "opacity-0 group-hover:opacity-100"
                                        )}
                                    >
                                        <Trash2 size={11} />
                                    </button>
                                </div>

                                <div className="grid grid-cols-1 gap-3">
                                    {field.fields.map((subField) => (
                                        <ConfigFieldRenderer
                                            key={subField.path}
                                            field={{
                                                ...subField,
                                                path: `${field.path}.${index}.${subField.path}`
                                            }}
                                            values={values}
                                            onChange={onChange}
                                        />
                                    ))}
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>

                {items.length === 0 && (
                    <button
                        onClick={addItem}
                        className={cn(
                            "flex flex-col items-center justify-center rounded-xl border border-dashed py-8 transition-all group",
                            "border-white/[0.04] hover:border-white/[0.08] hover:bg-white/[0.02]"
                        )}
                    >
                        <ListFilter size={18} className="mb-2 text-neutral-700 group-hover:text-neutral-500 transition-colors" />
                        <p className="text-[10px] text-neutral-600 font-medium">
                            No items. Click to add.
                        </p>
                    </button>
                )}
            </div>
        </div>
    );
}