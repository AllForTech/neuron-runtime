'use client';

import React, { useState, memo } from 'react';
import { motion } from 'framer-motion';
import { Hash, ChevronUp, ChevronDown } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { FieldWrapper } from '../FieldWrapper';
import { NumberFieldSchema } from "@neuron/shared";
import { getValueAtPath } from "@/lib/config/path";
import { cn } from "@/lib/utils";

export function NumberField({ field, values, onChange }: {
    field: NumberFieldSchema;
    values: Record<string, any>;
    onChange: (path: string, value: number | undefined) => void;
}) {
    const [isFocused, setIsFocused] = useState(false);
    const value = getValueAtPath(values, field.path, field.defaultValue);

    const handleStep = (direction: number) => {
        const current = value ?? 0;
        const next = current + (direction * (field.step || 1));
        if (field.max !== undefined && next > field.max) return;
        if (field.min !== undefined && next < field.min) return;
        onChange(field.path, next);
    };

    return (
        <FieldWrapper
            label={field.label}
            description={field.description}
            required={field.required}
        >
            <div className="relative w-full">
                {/* Glass container */}
                <motion.div 
                    animate={{
                        boxShadow: isFocused 
                            ? "0 0 0 1px rgba(255,255,255,0.08), 0 0 20px -8px rgba(255,255,255,0.1)" 
                            : "0 0 0 1px rgba(255,255,255,0.03)"
                    }}
                    className={cn(
                        "relative flex items-center rounded-xl border transition-all duration-300 overflow-hidden",
                        isFocused 
                            ? "bg-white/[0.04] border-white/[0.1]" 
                            : "bg-white/[0.015] border-white/[0.04] hover:bg-white/[0.02] hover:border-white/[0.06]"
                    )}
                >
                    {/* Icon */}
                    <div className={cn(
                        "relative z-10 flex items-center justify-center ml-3 transition-all duration-200",
                        isFocused ? "text-white" : "text-neutral-600"
                    )}>
                        <Hash size={12} strokeWidth={1.5} />
                    </div>

                    <Input
                        type="number"
                        value={value ?? ''}
                        placeholder={field.placeholder as string || "0"}
                        disabled={field.disabled}
                        onFocus={() => setIsFocused(true)}
                        onBlur={() => setIsFocused(false)}
                        className={cn(
                            "relative z-10 w-full bg-transparent border-none pl-3 pr-16 py-2.5 text-[12px] transition-all",
                            "text-neutral-200 placeholder:text-neutral-700",
                            "focus-visible:ring-0 focus-visible:ring-offset-0",
                            "[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                        )}
                        onChange={(e) => {
                            const val = e.target.value === '' ? undefined : Number(e.target.value);
                            onChange(field.path, val);
                        }}
                    />

                    {/* Integrated steppers */}
                    {!field.disabled && (
                        <div className="relative z-10 flex items-center mr-1">
                            <button
                                type="button"
                                onClick={() => handleStep(1)}
                                className={cn(
                                    "flex items-center justify-center w-6 h-6 rounded-md transition-all",
                                    "text-neutral-600 hover:text-white hover:bg-white/[0.08]"
                                )}
                            >
                                <ChevronUp size={11} />
                            </button>
                            <button
                                type="button"
                                onClick={() => handleStep(-1)}
                                className={cn(
                                    "flex items-center justify-center w-6 h-6 rounded-md transition-all",
                                    "text-neutral-600 hover:text-white hover:bg-white/[0.08]"
                                )}
                            >
                                <ChevronDown size={11} />
                            </button>
                        </div>
                    )}
                </motion.div>
            </div>
        </FieldWrapper>
    );
}