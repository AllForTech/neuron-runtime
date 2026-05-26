'use client';

import React from 'react';
import { CheckCircle, Circle } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { FieldWrapper } from '../FieldWrapper';
import { SwitchFieldSchema } from "@neuron/shared";
import { getValueAtPath } from "@/lib/config/path";
import { cn } from "@/lib/utils";

export function SwitchField({ field, values, onChange }: {
    field: SwitchFieldSchema;
    values: Record<string, any>;
    onChange: (path: string, value: boolean) => void;
}) {
    const value = !!getValueAtPath(values, field.path, field.defaultValue ?? false);

    const handleToggle = (e: React.MouseEvent | React.KeyboardEvent) => {
        if (field.disabled) return;
        onChange(field.path, !value);
    };

    return (
        <FieldWrapper
            label={field.label}
            description={field.description}
            required={field.required}
        >
            <div
                onClick={handleToggle}
                className={cn(
                    "group relative flex items-center justify-between rounded-xl border p-3.5 transition-all duration-300 cursor-pointer select-none",
                    value
                        ? "bg-white/[0.025] border-white/[0.1] shadow-[0_0_20px_-8px_rgba(255,255,255,0.08)]"
                        : "bg-white/[0.01] border-white/[0.03] hover:border-white/[0.06] hover:bg-white/[0.015]",
                    field.disabled && "opacity-50 cursor-not-allowed pointer-events-none"
                )}
            >
                {/* Inner glow effect */}
                <div className={cn(
                    "absolute inset-0 rounded-xl bg-gradient-to-r pointer-events-none transition-opacity duration-300",
                    value ? "from-white/[0.04] via-transparent to-white/[0.02] opacity-100" : "opacity-0"
                )} />

                <div className="relative z-10 flex items-center gap-3">
                    {/* Status Icon */}
                    <div className={cn(
                        "flex items-center justify-center w-6 h-6 rounded-md transition-all duration-300",
                        value
                            ? "bg-white/[0.08] text-white"
                            : "bg-white/[0.03] text-neutral-600 group-hover:text-neutral-500"
                    )}>
                        {value ? (
                            <CheckCircle size={12} strokeWidth={2} />
                        ) : (
                            <Circle size={12} strokeWidth={1.5} />
                        )}
                    </div>
                </div>

                <div className="relative z-10 flex items-center">
                    <Switch
                        checked={value}
                        disabled={field.disabled}
                        onCheckedChange={(checked) => onChange(field.path, checked)}
                        className={cn(
                            "scale-90 transition-all data-[state=checked]:bg-white data-[state=unchecked]:bg-white/10",
                            "focus-visible:ring-0 focus-visible:ring-offset-0 pointer-events-none"
                        )}
                    />
                </div>
            </div>
        </FieldWrapper>
    );
}