'use client';

import React, { useMemo } from 'react';
import { Plus, Trash2, Key, Braces } from "lucide-react";
import { FieldWrapper } from '../FieldWrapper';
import { TemplateTextarea } from '@/components/workflow/editor/TemplateTextarea';
import { cn, getAvailableUpstreamNodes } from "@/lib/utils";
import { getValueAtPath } from "@/lib/config/path";
import { useWorkflowEditor } from "@/hooks/workflow/useWorkflowEditor";
import { KeyValueFieldSchema } from "@neuron/shared";

interface KeyValueFieldProps {
    field: KeyValueFieldSchema;
    values: Record<string, any>;
    onChange: (path: string, value: any) => void;
}

export function KeyValueField({ field, values, onChange }: KeyValueFieldProps) {
    const { editorState: { graph: { nodes, edges } }, selectedNode } = useWorkflowEditor();
    const valueType = field.valueType || 'text';

    const rawValue = useMemo(() => {
        return getValueAtPath(values, field.path, {}) ?? {};
    }, [field.path, values]);

    const items = useMemo(() => {
        if (Array.isArray(rawValue)) return rawValue;
        return Object.entries(rawValue).map(([key, value]) => ({ key, value }));
    }, [rawValue]);

    const availableVariables = useMemo(() => {
        if (!selectedNode || !nodes[selectedNode.id]) return [];
        return getAvailableUpstreamNodes(selectedNode.id, { nodes, edges });
    }, [selectedNode, nodes, edges]);

    const handleSync = (newItems: { key: string; value: any }[]) => {
        const jsonObject = newItems.reduce((acc, item) => {
            if (item.key.trim() !== "") {
                acc[item.key] = item.value;
            }
            return acc;
        }, {} as Record<string, any>);

        onChange(field.path, jsonObject);
    };

    const addItem = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        handleSync([...items, { key: '', value: '' }]);
    };

    const updateItem = (index: number, newKey: string, newValue: any) => {
        const newItems = [...items];
        newItems[index] = { key: newKey, value: newValue };
        handleSync(newItems);
    };

    const removeItem = (index: number) => {
        const newItems = [...items];
        newItems.splice(index, 1);
        handleSync(newItems);
    };

    return (
        <FieldWrapper label={field.label} description={field.description} required={field.required}>
            <div className="flex flex-col w-full gap-2">
                {/* Header Section */}
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
                    </div>

                    <button
                        type="button"
                        onClick={addItem}
                        className="flex items-center gap-1.5 text-[10px] font-medium text-neutral-500 hover:text-white transition-colors group"
                    >
                        <Plus size={11} className="text-neutral-600 group-hover:text-white" />
                        <span>Add</span>
                    </button>
                </div>

                {/* List Section */}
                <div className="flex-1 flex-col no-scrollbar overflow-x-hidden gap-2">
                    {items.map((item, index) => (
                        <div
                            key={`${field.path}-${index}`}
                            className="group gap-1.5 relative  p-2 border-white/[0.04] bg-white/[0.02] hover:border-white/[0.08] rounded-xl border transition-all duration-300"
                        >
                            <div className={'w-full flex items-center justify-end'}>
                                {/* Actions */}
                                <button
                                    type="button"
                                    onClick={() => removeItem(index)}
                                    className="text-neutral-600 hover:text-red-400 p-1.5 opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                    <Trash2 size={11} />
                                </button>
                            </div>
                            <div className={cn(
                                "relative w-full flex items-center gap-2")}>
                                {/* Key Input */}
                                <input
                                    type="text"
                                    value={item.key}
                                    placeholder="Key"
                                    onChange={(e) => updateItem(index, e.target.value, item.value)}
                                    className="flex-1 w-full! bg-transparent border-none text-[12px] text-neutral-200 font-medium placeholder:text-neutral-700 focus:outline-none"
                                />

                                <div className="text-neutral-700 text-[10px]">:</div>

                                {/* Value Input / Template Area */}
                                <div className="flex-[2]">
                                    {valueType === 'template' ? (
                                        <TemplateTextarea
                                            value={item.value}
                                            variables={availableVariables as any}
                                            onChange={(val) => updateItem(index, item.key, val)}
                                            className="!min-h-[32px] w-full! text-[11px]"
                                        />
                                    ) : (
                                        <input
                                            type="text"
                                            value={item.value}
                                            placeholder="Value"
                                            onChange={(e) => updateItem(index, item.key, e.target.value)}
                                            className="w-full! bg-transparent border-none text-[12px] text-neutral-300 placeholder:text-neutral-700 focus:outline-none"
                                        />
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}

                    {/* Empty State */}
                    {items.length === 0 && (
                        <button
                            type="button"
                            onClick={addItem}
                            className="flex flex-col items-center justify-center rounded-xl border border-dashed py-6 border-white/[0.04] hover:border-white/[0.08] hover:bg-white/[0.02] group/empty"
                        >
                            <Key size={16} className="mb-2 text-neutral-700 group-hover/empty:text-neutral-500 transition-colors" />
                            <p className="text-[10px] text-neutral-600 font-medium">No entries. Click to add.</p>
                        </button>
                    )}
                </div>
            </div>
        </FieldWrapper>
    );
}