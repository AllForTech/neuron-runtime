'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { ToggleRight, ToggleLeft } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { SwitchFieldSchema } from "@neuron/shared";
import { getValueAtPath } from "@/lib/config/path";
import { cn } from "@/lib/utils";

/**
 * SwitchField
 * A sleek, high-contrast toggle component.
 * Designed to feel like a hardware instrument with tactile feedback
 * and state-dependent iconography.
 */
export function SwitchField({ field, values, onChange }: {
    field: SwitchFieldSchema;
    values: Record<string, any>;
    onChange: (path: string, value: boolean) => void;
}) {
    const value = !!getValueAtPath(values, field.path, field.defaultValue ?? false);

    return (
        <motion.div
            initial={false}
            animate={{
                backgroundColor: value ? "rgba(255, 255, 255, 0.03)" : "rgba(255, 255, 255, 0.01)"
            }}
            className={cn(
                "group relative flex items-center justify-between rounded-xl border border-white/[0.04] p-3 transition-all duration-300 hover:border-white/10",
                value && "border-white/[0.08] shadow-[0_0_20px_-12px_rgba(255,255,255,0.2)]"
            )}
        >
            <div className="z-10 flex flex-col gap-1">
                <div className="flex items-center gap-2">
                    {/* Status Icon Indicator */}
                    <div className={cn(
                        "transition-colors duration-300",
                        value ? "text-white" : "text-neutral-600"
                    )}>
                        {value ? <ToggleRight size={14} /> : <ToggleLeft size={14} />}
                    </div>

                    <label className="text-[12px] font-bold tracking-tight text-white/90">
                        {field.label}
                    </label>
                </div>

                {field.description && (
                    <p className="pl-5 text-[10px] leading-relaxed text-neutral-500 transition-colors group-hover:text-neutral-400">
                        {field.description}
                    </p>
                )}
            </div>

            <div className="relative z-10 flex items-center">
                <Switch
                    checked={value}
                    disabled={field.disabled}
                    onCheckedChange={(checked) => onChange(field.path, checked)}
                    className={cn(
                        "scale-90 transition-all data-[state=checked]:bg-white data-[state=unchecked]:bg-white/10",
                        "focus-visible:ring-0 focus-visible:ring-offset-0"
                    )}
                />
            </div>

            {/* Background Glow for active state */}
            {value && (
                <div className="absolute inset-0 z-0 bg-gradient-to-r from-white/[0.02] to-transparent pointer-events-none rounded-xl" />
            )}
        </motion.div>
    );
}