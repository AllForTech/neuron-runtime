'use client';

import React, { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, Key, Braces } from "lucide-react";
import { FieldWrapper } from '../FieldWrapper';
import { TemplateTextarea } from '@/components/workflow/editor/TemplateTextarea';
import {cn, getAvailableUpstreamNodes} from "@/lib/utils";
import { getValueAtPath } from "@/lib/config/path";
import {useWorkflowEditor} from "@/hooks/workflow/useWorkflowEditor";
import {KeyValueFieldSchema} from "@neuron/shared";

interface KeyValueFieldProps {
    field: KeyValueFieldSchema;
    values: Record<string, any>;
    onChange: (path: string, value: any) => void;
}

export function KeyValueField({ field, values, onChange }: KeyValueFieldProps) {
    const { editorState: { graph: { nodes, edges }}, selectedNode } = useWorkflowEditor();
    
    const valueType = field.valueType || 'text';
    
    const availableVariables = useMemo(() => {
        if (!selectedNode || !nodes[selectedNode.id]) return [];
        return getAvailableUpstreamNodes(selectedNode.id, {
            nodes,
            edges,
        });
    }, [selectedNode, nodes, edges]);

    const rawValue = getValueAtPath(values, field.path, []) ?? [];
    const items = Array.isArray(rawValue) ? rawValue : [];

    const addItem = () => {
        onChange(field.path, [...items, { key: '', value: '' }]);
    };

    const updateItem = (index: number, key: string, value: string) => {
        const newItems = [...items];
        newItems[index] = { key, value };
        onChange(field.path, newItems);
    };

    const removeItem = (index: number) => {
        const newItems = [...items];
        newItems.splice(index, 1);
        onChange(field.path, newItems);
    };

    return (
        <FieldWrapper
            label={field.label}
            description={field.description}
            required={field.required}
        >
            <div className="flex flex-col w-full gap-2">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        {valueType === 'template' ? (
                            <Braces size={10} className="text-neutral-600" />
                        ) : (
                            <Key size={10} className="text-neutral-600" />
                        )}
                        <span className="text-[9px] font-semibold uppercase tracking-widest text-neutral-500">
                            {valueType === 'template' ? 'Variables' : 'Entries'}
                        </span>
                        <span className="flex h-4 min-w-[18px] items-center justify-center rounded-full bg-white/[0.04] px-1.5 text-[9px] font-mono text-neutral-500 border border-white/[0.05]">
                            {items.length}
                        </span>
                    </div>

                    <button
                        onClick={addItem}
                        className="flex items-center gap-1.5 text-[10px] font-medium text-neutral-500 hover:text-white transition-colors group"
                    >
                        <Plus size={11} className="text-neutral-600 group-hover:text-white" />
                        <span>Add</span>
                    </button>
                </div>

                <div className="flex flex-col gap-2">
                    <AnimatePresence mode="popLayout">
                        {items.map((item: { key: string; value: string }, index: number) => (
                            <motion.div
                                key={`${field.path}-${index}`}
                                layout
                                initial={{ opacity: 0, y: 8 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.98 }}
                                className="group relative"
                            >
                                <div className={cn(
                                    "relative flex items-start gap-2 rounded-xl border p-2 transition-all duration-300",
                                    "border-white/[0.04] bg-white/[0.02]",
                                    "hover:border-white/[0.08] hover:bg-white/[0.03]"
                                )}>
                                    <div className="flex-1 min-w-0">
                                        <input
                                            type="text"
                                            value={item.key}
                                            placeholder={typeof field.placeholder !== "string" && field.placeholder?.key || "Key"}
                                            onChange={(e) => updateItem(index, e.target.value, item.value)}
                                            className={cn(
                                                "w-full bg-transparent border-none text-[12px] text-neutral-300 font-medium",
                                                "placeholder:text-neutral-700 focus:outline-none",
                                                "focus:ring-0 focus:ring-offset-0"
                                            )}
                                        />
                                    </div>

                                    <div className="flex items-center justify-center w-4 pt-1 text-neutral-700">
                                        <span className="text-[10px]">:</span>
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        {valueType === 'template' ? (
                                            <TemplateTextarea
                                                value={item.value}
                                                variables={availableVariables as any}
                                                placeholder={typeof field.placeholder !== "string" && field.placeholder?.value || "Value or {{variable}}"}
                                                onChange={(val) => updateItem(index, item.key, val)}
                                                className="!min-h-[60px] text-[11px]"
                                            />
                                        ) : (
                                            <input
                                                type="text"
                                                value={item.value}
                                                placeholder={typeof field.placeholder !== "string" && field.placeholder?.value || "Value"}
                                                onChange={(e) => updateItem(index, item.key, e.target.value)}
                                                className={cn(
                                                    "w-full bg-transparent border-none text-[12px] text-neutral-300",
                                                    "placeholder:text-neutral-700 focus:outline-none",
                                                    "focus:ring-0 focus:ring-offset-0"
                                                )}
                                            />
                                        )}
                                    </div>

                                    <button
                                        onClick={() => removeItem(index)}
                                        className={cn(
                                            "flex items-center justify-center p-1.5 rounded-lg transition-all",
                                            "text-neutral-600 hover:text-red-400 hover:bg-red-500/10",
                                            "opacity-0 group-hover:opacity-100 shrink-0"
                                        )}
                                    >
                                        <Trash2 size={11} />
                                    </button>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>

                    {items.length === 0 && (
                        <button
                            onClick={addItem}
                            className={cn(
                                "flex flex-col items-center justify-center rounded-xl border border-dashed py-6 transition-all group",
                                "border-white/[0.04] hover:border-white/[0.08] hover:bg-white/[0.02]"
                            )}
                        >
                            <Key size={16} className="mb-2 text-neutral-700 group-hover:text-neutral-500" />
                            <p className="text-[10px] text-neutral-600 font-medium">
                                No entries. Click to add.
                            </p>
                        </button>
                    )}
                </div>
            </div>
        </FieldWrapper>
    );
}