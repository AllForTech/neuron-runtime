'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Binary, ChevronUp, ChevronDown } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { FieldWrapper } from '../FieldWrapper';
import { NumberFieldSchema } from "@neuron/shared";
import { getValueAtPath } from "@/lib/config/path";

interface NumberFieldProps {
    field: NumberFieldSchema;
    values: Record<string, any>;
    onChange: (path: string, value: number | undefined) => void;
}

export function NumberField({
                                field,
                                values,
                                onChange,
                            }: NumberFieldProps) {
    const value = getValueAtPath(values, field.path, field.defaultValue);

    const increment = () => {
        const current = value ?? 0;
        const next = current + (field.step || 1);
        if (field.max !== undefined && next > field.max) return;
        onChange(field.path, next);
    };

    const decrement = () => {
        const current = value ?? 0;
        const next = current - (field.step || 1);
        if (field.min !== undefined && next < field.min) return;
        onChange(field.path, next);
    };

    return (
        <FieldWrapper
            label={field.label}
            description={field.description}
            required={field.required}
        >
            <div className="group relative flex items-center">
                {/* Visual Anchor Icon */}
                <div className="absolute left-3 flex items-center justify-center text-neutral-500 transition-colors group-focus-within:text-white">
                    <Binary size={12} strokeWidth={2.5} />
                </div>

                <Input
                    type="number"
                    value={value ?? ''}
                    placeholder={field.placeholder}
                    disabled={field.disabled}
                    min={field.min}
                    max={field.max}
                    step={field.step}
                    className="h-10 w-full rounded-xl border-white/[0.05] bg-white/[0.02] pl-9 pr-12 text-[13px] font-medium tracking-tight text-white/90 ring-offset-transparent transition-all placeholder:text-neutral-600 focus-visible:border-white/20 focus-visible:bg-white/[0.04] focus-visible:ring-0 focus-visible:ring-offset-0 disabled:opacity-30"
                    onChange={(e) => {
                        const val = e.target.value === '' ? undefined : Number(e.target.value);
                        onChange(field.path, val);
                    }}
                />

                {/* Custom Tactile Steppers */}
                {!field.disabled && (
                    <div className="absolute right-1.5 flex h-[calc(100%-12px)] flex-col gap-0.5 border-l border-white/5 pl-1.5">
                        <motion.button
                            whileTap={{ scale: 0.9 }}
                            onClick={increment}
                            className="flex flex-1 items-center justify-center rounded-md px-1 text-neutral-500 hover:bg-white/5 hover:text-white transition-colors"
                        >
                            <ChevronUp size={10} strokeWidth={3} />
                        </motion.button>
                        <motion.button
                            whileTap={{ scale: 0.9 }}
                            onClick={decrement}
                            className="flex flex-1 items-center justify-center rounded-md px-1 text-neutral-500 hover:bg-white/5 hover:text-white transition-colors"
                        >
                            <ChevronDown size={10} strokeWidth={3} />
                        </motion.button>
                    </div>
                )}

                {/* Focus Glow Background */}
                <div className="absolute inset-0 -z-10 rounded-xl bg-white/5 opacity-0 blur-xl transition-opacity group-focus-within:opacity-20" />
            </div>
        </FieldWrapper>
    );
}