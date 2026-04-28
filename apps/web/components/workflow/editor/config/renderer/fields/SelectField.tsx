'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { ChevronDown, Check, MousePointerClick } from 'lucide-react';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { FieldWrapper } from '../FieldWrapper';
import { SelectFieldSchema } from "@neuron/shared";
import { getValueAtPath } from "@/lib/config/path";
import { cn } from "@/lib/utils";

/**
 * SelectField
 * A refined dropdown component featuring a glassmorphic content panel
 * and detailed option layouts for professional engineering data selection.
 */
export function SelectField({
                                field,
                                values,
                                onChange,
                            }: {
    field: SelectFieldSchema;
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
            <div className="group relative">
                <Select
                    value={value ? String(value) : undefined}
                    onValueChange={(val) => onChange(field.path, val)}
                    disabled={field.disabled}
                >
                    <SelectTrigger
                        className={cn(
                            "h-10 w-full rounded-xl border-white/[0.05] bg-white/[0.02] pl-4 pr-3 text-[13px] font-medium tracking-tight text-white/90 transition-all hover:bg-white/[0.05] hover:border-white/10 focus:ring-0 focus:ring-offset-0 disabled:opacity-30",
                            "data-[state=open]:border-white/20 data-[state=open]:bg-white/[0.06]"
                        )}
                    >
                        <div className="flex items-center gap-2 overflow-hidden">
                            <MousePointerClick size={12} className="shrink-0 text-neutral-500 group-hover:text-neutral-300 transition-colors" />
                            <SelectValue placeholder={field.placeholder || "Select option..."} />
                        </div>
                    </SelectTrigger>

                    <SelectContent
                        className="min-w-[220px] overflow-hidden rounded-xl border-white/10 bg-[#0A0A0A]/90 p-1 shadow-2xl backdrop-blur-2xl animate-in fade-in zoom-in-95 duration-200"
                        position="popper"
                        sideOffset={8}
                    >
                        <div className="flex flex-col gap-0.5 p-1">
                            {field.options?.map((option) => (
                                <SelectItem
                                    key={option.value}
                                    value={String(option.value)}
                                    className="relative flex cursor-pointer select-none items-center rounded-lg py-2.5 pl-3 pr-9 outline-none transition-colors focus:bg-white/[0.05] focus:text-white data-[state=checked]:bg-white/[0.08]"
                                >
                                    <div className="flex flex-col gap-0.5">
                                        <span className="text-[12px] font-semibold leading-none tracking-tight">
                                            {option.label}
                                        </span>
                                        {option.description && (
                                            <span className="text-[10px] leading-tight text-neutral-500 line-clamp-1">
                                                {option.description}
                                            </span>
                                        )}
                                    </div>

                                    {/* Custom Check Indicator */}
                                    <span className="absolute right-3 flex h-3.5 w-3.5 items-center justify-center">
                                        <Check className="h-3 w-3 text-white opacity-0 group-data-[state=checked]:opacity-100 transition-opacity" />
                                    </span>
                                </SelectItem>
                            ))}
                        </div>
                    </SelectContent>
                </Select>

                {/* Ambient Selection Glow */}
                <div className="absolute inset-0 -z-10 rounded-xl bg-white/5 opacity-0 blur-xl transition-opacity group-hover:opacity-10 group-focus-within:opacity-20" />
            </div>
        </FieldWrapper>
    );
}