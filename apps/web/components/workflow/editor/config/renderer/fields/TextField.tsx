'use client';

import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, EyeOff, Type, Lock, Fingerprint, Hash } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { FieldWrapper } from '../FieldWrapper';
import { TextFieldSchema } from "@neuron/shared";
import { getValueAtPath } from "@/lib/config/path";
import { cn } from "@/lib/utils";
import { TextareaField } from './TextareaField';

export function TextField({ field, values, onChange }: {
    field: TextFieldSchema;
    values: Record<string, any>;
    onChange: (path: string, value: string) => void;
}) {
    const [showSecret, setShowSecret] = useState(false);
    const [isFocused, setIsFocused] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);
    const value = getValueAtPath(values, field.path, field.defaultValue ?? "");

    if (field.type === "textarea") {
        return <TextareaField field={field} values={values} onChange={onChange} />;
    }

    const isSecret = field.type === "secret";
    const Icon = isSecret ? Lock : (field.path.includes('id') || field.path.includes('key') ? Fingerprint : (field.path.includes('uuid') ? Hash : Type));

    return (
        <FieldWrapper
            label={field.label}
            description={field.description}
            required={field.required}
        >
            <div className="relative h-full w-full">
                {/* Glass input container */}
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
                            : "bg-white/[0.015] border-white/[0.06] hover:bg-white/[0.02] hover:border-white/[0.06]"
                    )}
                >
                    {/* Subtle gradient overlay */}
                    <div className={cn(
                        "absolute inset-0 bg-gradient-to-r from-white/[0.02] via-transparent to-white/[0.01] pointer-events-none opacity-0 transition-opacity",
                        isFocused && "opacity-100"
                    )} />
                    
                    {/* Icon */}
                    <div className={cn(
                        "relative z-10 flex items-center justify-center ml-3 transition-all duration-200",
                        isFocused ? "text-white" : "text-neutral-600"
                    )}>
                        <Icon size={12} strokeWidth={1.5} />
                    </div>

                    <Input
                        ref={inputRef}
                        type={isSecret && !showSecret ? "password" : "text"}
                        value={value}
                        placeholder={field.placeholder || "Enter value..."}
                        disabled={field.disabled}
                        spellCheck={false}
                        onFocus={() => setIsFocused(true)}
                        onBlur={() => setIsFocused(false)}
                        className={cn(
                            "relative z-10 w-full h-full bg-transparent border-none pl-3 pr-10 py-2.5 text-[12px] transition-all",
                            "text-neutral-200 placeholder:text-neutral-700",
                            "focus-visible:ring-0 focus-visible:ring-offset-0",
                            isSecret && !showSecret && "font-mono tracking-[0.2em] text-[11px]"
                        )}
                        onChange={(e) => onChange(field.path, e.target.value)}
                    />

                    {/* Secret toggle */}
                    <AnimatePresence>
                        {isSecret && (
                            <motion.button
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                type="button"
                                onClick={() => setShowSecret(!showSecret)}
                                className={cn(
                                    "relative z-10 flex items-center justify-center mr-2 p-1.5 rounded-lg transition-all",
                                    "text-neutral-600 hover:text-neutral-300 hover:bg-white/[0.04]"
                                )}
                            >
                                {showSecret ? <EyeOff size={12} /> : <Eye size={12} />}
                            </motion.button>
                        )}
                    </AnimatePresence>
                </motion.div>
            </div>
        </FieldWrapper>
    );
}