'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, EyeOff, Type, Lock, Fingerprint } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { FieldWrapper } from '../FieldWrapper';
import { TextFieldSchema } from "@neuron/shared";
import { getValueAtPath } from "@/lib/config/path";
import { cn } from "@/lib/utils";
import { TextareaField } from './TextareaField';

/**
 * TextField
 * A high-performance input component that adapts based on the field type.
 * Includes specialized handling for secrets (passwords) with a toggle visibility
 * feature and distinctive visual cues for different data intents.
 */
export function TextField({ field, values, onChange }: {
    field: TextFieldSchema;
    values: Record<string, any>;
    onChange: (path: string, value: string) => void;
}) {
    const [showSecret, setShowSecret] = useState(false);
    const value = getValueAtPath(values, field.path, field.defaultValue ?? "");

    // Delegate to TextareaField if type is textarea
    if (field.type === "textarea") {
        return <TextareaField field={field} values={values} onChange={onChange} />;
    }

    const isSecret = field.type === "secret";

    // Choose icon based on field intent
    const Icon = isSecret ? Lock : (field.path.includes('id') || field.path.includes('key') ? Fingerprint : Type);

    return (
        <FieldWrapper
            label={field.label}
            description={field.description}
            required={field.required}
        >
            <div className="group relative flex items-center">
                {/* Visual Type Indicator */}
                <div className="absolute left-3.5 flex items-center justify-center text-neutral-500 transition-colors group-focus-within:text-white pointer-events-none">
                    <Icon size={12} strokeWidth={2.5} />
                </div>

                <Input
                    type={isSecret && !showSecret ? "password" : "text"}
                    value={value}
                    placeholder={field.placeholder || "Enter value..."}
                    disabled={field.disabled}
                    spellCheck={false}
                    className={cn(
                        "h-10 w-full rounded-xl border-white/[0.05] bg-white/[0.02] pl-10 pr-10 text-[13px] font-medium tracking-tight text-white/90 ring-offset-transparent transition-all placeholder:text-neutral-600 focus-visible:border-white/20 focus-visible:bg-white/[0.04] focus-visible:ring-0 focus-visible:ring-offset-0 disabled:opacity-30",
                        isSecret && !showSecret && "font-mono tracking-widest text-[10px]"
                    )}
                    onChange={(e) => onChange(field.path, e.target.value)}
                />

                {/* Secret Visibility Toggle */}
                <AnimatePresence>
                    {isSecret && (
                        <motion.button
                            type="button"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => setShowSecret(!showSecret)}
                            className="absolute right-3 flex h-6 w-6 items-center justify-center rounded-md text-neutral-500 hover:bg-white/5 hover:text-white transition-colors"
                        >
                            {showSecret ? <EyeOff size={12} /> : <Eye size={12} />}
                        </motion.button>
                    )}
                </AnimatePresence>

                {/* Status Bar (Active Glow) */}
                <div className="absolute -left-[1px] top-1/4 h-1/2 w-[2px] rounded-full bg-white opacity-0 transition-all duration-300 group-focus-within:opacity-100" />

                {/* Ambient Depth Glow */}
                <div className="absolute inset-0 -z-10 rounded-xl bg-white/5 opacity-0 blur-xl transition-opacity group-focus-within:opacity-20" />
            </div>
        </FieldWrapper>
    );
}