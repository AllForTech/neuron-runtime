'use client';

import React, { memo } from 'react';
import { Box } from 'lucide-react';
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
        <div className="w-full flex flex-col gap-4">
            {/* Header Section with Divider */}
            {field.label && (
                <div className="flex items-center gap-2.5 pt-1">
                    <div className="flex items-center justify-center w-5 h-5 rounded-md bg-white/[0.03] text-neutral-600">
                        <Box size={10} strokeWidth={2} />
                    </div>
                    <span className="text-[10px] font-semibold uppercase tracking-widest text-neutral-500">
                        {field.label}
                    </span>
                    {/* Horizontal Rail */}
                    <div className="h-px flex-1 bg-white/[0.04]" />
                </div>
            )}

            {/* Container Surface */}
            <div className={cn(
                "relative w-full rounded-xl border border-white/[0.03] bg-white/[0.01] p-4 transition-all duration-300",
                "hover:border-white/[0.06] hover:bg-white/[0.02]"
            )}>
                {/* Visual Depth Layer */}
                <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] via-transparent to-neutral-950/20 pointer-events-none rounded-xl" />

                {/* Dynamic Grid Layout */}
                <div className={cn("relative grid gap-y-3", getLayoutClass(field.layout))}>
                    {field.fields.map((subField, index) => (
                        <ConfigFieldRenderer
                            key={`${subField.path}-${index}`}
                            field={subField}
                            values={values}
                            onChange={onChange}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
}