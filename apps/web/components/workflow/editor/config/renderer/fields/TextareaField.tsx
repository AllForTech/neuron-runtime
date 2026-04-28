'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { AlignLeft, CornerDownRight } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { FieldWrapper } from '../FieldWrapper';
import { TextFieldSchema } from "@neuron/shared";
import { getValueAtPath } from "@/lib/config/path";
import { cn } from "@/lib/utils";

/**
 * TextareaField
 * A sophisticated multi-line input optimized for long-form content.
 * Features a subtle monospace font for technical data and a tactile
 * resizing handle appearance.
 */
export function TextareaField({
                                  field,
                                  values,
                                  onChange,
                              }: {
    field: TextFieldSchema;
    values: Record<string, any>;
    onChange: (path: string, value: string) => void;
}) {
    const value = getValueAtPath(values, field.path, field.defaultValue);

    return (
        <FieldWrapper
            label={field.label}
            description={field.description}
            required={field.required}
        >
            <div className="group relative flex flex-col">
                {/* Header Icon Anchor */}
                <div className="absolute top-3 left-3 flex items-center justify-center text-neutral-500 group-focus-within:text-white transition-colors pointer-events-none">
                    <AlignLeft size={12} strokeWidth={2.5} />
                </div>

                <Textarea
                    value={value ?? ''}
                    placeholder={field.placeholder || "Enter content..."}
                    disabled={field.disabled}
                    spellCheck={false}
                    className={cn(
                        "min-h-[100px] w-full resize-y rounded-xl border-white/[0.05] bg-white/[0.02] pl-9 pr-4 py-2.5 text-[13px] font-mono leading-relaxed text-white/90 ring-offset-transparent transition-all placeholder:font-sans placeholder:text-neutral-600 focus-visible:border-white/20 focus-visible:bg-white/[0.04] focus-visible:ring-0 focus-visible:ring-offset-0 disabled:opacity-30",
                        "scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent"
                    )}
                    onChange={(e) => onChange(field.path, e.target.value)}
                />

                {/* Aesthetic Resize Corner Decoration */}
                <div className="absolute bottom-1.5 right-1.5 pointer-events-none text-white/5 group-focus-within:text-white/20 transition-colors">
                    <CornerDownRight size={10} />
                </div>

                {/* Sub-label for Character Count or Status (Optional) */}
                {value && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="absolute bottom-[-18px] right-1 flex items-center gap-1.5 px-1"
                    >
                        <span className="text-[9px] font-mono text-neutral-600 uppercase tracking-tighter">
                            Length: {value.length}
                        </span>
                    </motion.div>
                )}

                {/* Ambient Glow */}
                <div className="absolute inset-0 -z-10 rounded-xl bg-white/5 opacity-0 blur-2xl transition-opacity group-focus-within:opacity-10" />
            </div>
        </FieldWrapper>
    );
}