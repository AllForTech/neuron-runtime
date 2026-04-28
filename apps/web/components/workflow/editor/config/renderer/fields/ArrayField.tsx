'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, Hash, Layers } from "lucide-react";
import { ArrayFieldSchema } from "@neuron/shared";
import { getValueAtPath } from "@/lib/config/path";
import { ConfigFieldRenderer } from "../ConfigFieldRenderer";
import { Button } from "@/components/ui/button";

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
        <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between px-1">
                <div className="flex items-center gap-2">
                    <div className="flex h-5 w-5 items-center justify-center rounded bg-white/5 border border-white/10">
                        <Layers size={10} className="text-neutral-400" />
                    </div>
                    <label className="text-[12px] font-bold tracking-tight text-white/80">
                        {field.label}
                    </label>
                    <span className="rounded-full bg-white/5 px-1.5 py-0.5 text-[9px] font-mono text-neutral-500 border border-white/5">
                        {items.length}
                    </span>
                </div>

                <Button
                    variant="ghost"
                    size="sm"
                    onClick={addItem}
                    className="h-7 gap-1.5 rounded-lg border border-white/5 bg-white/[0.02] px-2.5 text-[10px] font-medium text-white/70 hover:bg-white/10 hover:text-white transition-all"
                >
                    <Plus size={12} />
                    Add Entry
                </Button>
            </div>

            <div className="flex flex-col gap-2">
                <AnimatePresence mode="popLayout">
                    {items.map((item, index) => (
                        <motion.div
                            key={`${field.path}-${index}`}
                            layout
                            initial={{ opacity: 0, scale: 0.98, y: 10 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, x: 20 }}
                            transition={{ type: "spring", stiffness: 500, damping: 40 }}
                            className="group relative flex flex-col gap-4 rounded-xl border border-white/[0.04] bg-gradient-to-b from-white/[0.03] to-transparent p-4 shadow-sm transition-colors hover:border-white/10"
                        >
                            <div className="flex items-center justify-between border-b border-white/5 pb-2 mb-1">
                                <div className="flex items-center gap-1.5 opacity-40">
                                    <Hash size={10} />
                                    <span className="text-[10px] font-mono tracking-tighter">
                                        ITEM_{index.toString().padStart(2, '0')}
                                    </span>
                                </div>

                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => removeItem(index)}
                                    className="h-6 w-6 rounded-md text-neutral-500 hover:bg-red-500/10 hover:text-red-400 transition-all opacity-0 group-hover:opacity-100"
                                >
                                    <Trash2 size={12} />
                                </Button>
                            </div>

                            <div className="grid grid-cols-1 gap-4">
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
                        </motion.div>
                    ))}
                </AnimatePresence>

                {items.length === 0 && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex flex-col items-center justify-center rounded-xl border border-dashed border-white/5 py-8 transition-colors hover:bg-white/[0.01]"
                    >
                        <p className="text-[11px] text-neutral-600 font-medium italic">
                            No entries defined.
                        </p>
                    </motion.div>
                )}
            </div>
        </div>
    );
}