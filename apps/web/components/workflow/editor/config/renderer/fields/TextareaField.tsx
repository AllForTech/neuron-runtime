'use client';

import React, { memo } from 'react';
import { AlignLeft } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { FieldWrapper } from '../FieldWrapper';
import { TextFieldSchema } from "@neuron/shared";
import { getValueAtPath } from "@/lib/config/path";
import { cn } from "@/lib/utils";

export function TextareaField({ field, values, onChange }: {
    field: TextFieldSchema;
    values: Record<string, any>;
    onChange: (path: string, value: string) => void;
}) {
    const value = getValueAtPath(values, field.path, field.defaultValue) ?? '';

    return (
        <FieldWrapper
            label={field.label}
            description={field.description}
            required={field.required}
        >
            <div className={cn(
                "group relative w-full flex flex-col transition-opacity",
                field.disabled && "opacity-50 cursor-not-allowed"
            )}>
                {/* 1. THE RAIL ICON */}
                <div className="absolute top-2.5 left-3 flex items-center justify-center text-neutral-600 transition-colors duration-200 group-focus-within:text-neutral-200 pointer-events-none">
                    <AlignLeft size={12} strokeWidth={2} />
                </div>

                {/* 2. THE INPUT SURFACE */}
                <Textarea
                    value={value}
                    placeholder={field.placeholder as string || "Enter content..."}
                    disabled={field.disabled}
                    spellCheck={false}
                    className={cn(
                        "min-h-[80px] w-full resize-none rounded-md border-white/[0.04] bg-neutral-900/50 pl-9 pr-3 py-2",
                        "text-[12px] font-mono leading-relaxed text-neutral-200 transition-all",
                        "placeholder:text-neutral-700 focus-visible:border-white/10 focus-visible:bg-neutral-900 focus-visible:ring-0",
                        "scrollbar-none shadow-inner"
                    )}
                    onChange={(e) => onChange(field.path, e.target.value)}
                />

                {/* 3. METADATA RAIL */}
                <div className="flex items-center justify-between mt-1.5 px-0.5">
                    <div className="text-[9px] font-mono text-neutral-800 uppercase tracking-widest">
                        Plaintext
                    </div>
                    <span className="text-[9px] font-mono text-neutral-700 tabular-nums tracking-tight">
                        {value.length.toLocaleString()} chars
                    </span>
                </div>

                {/* 4. FOCUS INDICATOR BAR */}
                {!field.disabled && (
                    <div className="absolute left-0 top-3 h-0 w-[1.5px] bg-white/40 transition-all duration-300 group-focus-within:h-4" />
                )}
            </div>
        </FieldWrapper>
    );
}