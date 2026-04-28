'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Asterisk } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FieldWrapperProps {
    label?: string;
    description?: string;
    required?: boolean;
    children: React.ReactNode;
    className?: string;
}

/**
 * FieldWrapper
 * The structural foundation for all configuration inputs.
 * Orchestrates typography, spacing, and accessibility requirements
 * while maintaining a clean, high-contrast engineering aesthetic.
 */
export function FieldWrapper({
                                 label,
                                 description,
                                 required,
                                 children,
                                 className,
                             }: FieldWrapperProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            className={cn("flex flex-col gap-2.5 w-full", className)}
        >
            {(label || description) && (
                <div className="flex flex-col gap-1.5 px-0.5">
                    {label && (
                        <div className="flex items-center gap-1">
                            <label className="text-[12px] font-bold tracking-tight text-white/70 select-none cursor-default">
                                {label}
                            </label>

                            {required && (
                                <motion.span
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    className="text-white/40"
                                >
                                    <Asterisk size={10} strokeWidth={3} />
                                </motion.span>
                            )}
                        </div>
                    )}

                    {description && (
                        <p className="text-[11px] leading-relaxed text-neutral-500 font-medium max-w-[95%] select-none">
                            {description}
                        </p>
                    )}
                </div>
            )}

            <div className="relative w-full">
                {children}
            </div>

            {/* Minimalist focus/activity baseline (Optional decorative element) */}
            <div className="h-[1px] w-full bg-gradient-to-r from-white/[0.02] via-transparent to-transparent" />
        </motion.div>
    );
}