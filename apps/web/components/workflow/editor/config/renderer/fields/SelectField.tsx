'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { ChevronDown, Check, MousePointerClick, ChevronRight } from 'lucide-react';
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
                            "relative h-10 w-full rounded-xl border bg-white/[0.02] pl-3.5 pr-3 text-[12px] font-medium transition-all",
                            "border-white/[0.04] text-neutral-300 placeholder:text-neutral-600",
                            "hover:bg-white/[0.03] hover:border-white/[0.07]",
                            "focus-visible:ring-0 focus-visible:ring-offset-0",
                            "data-[state=open]:border-white/[0.12] data-[state=open]:bg-white/[0.04] data-[state=open]:shadow-[0_0_20px_-8px_rgba(255,255,255,0.08)]",
                            "disabled:opacity-30"
                        )}
                    >
                        <div className="flex items-center gap-2.5 overflow-hidden">
                            <MousePointerClick size={11} className="shrink-0 text-neutral-600 group-hover:text-neutral-400 transition-colors" />
                            <SelectValue 
                                placeholder={field.placeholder || "Select option..."}
                                className="text-neutral-400"
                            />
                        </div>
                        <ChevronDown 
                            size={12} 
                            className="ml-auto text-neutral-600 group-hover:text-neutral-400 transition-colors" 
                        />
                    </SelectTrigger>

                    <SelectContent
                        className="min-w-[200px] overflow-hidden rounded-xl border border-white/[0.08] bg-[#0A0A0A]/95 p-1.5 shadow-2xl backdrop-blur-xl animate-in fade-in zoom-in-95 duration-200"
                        position="popper"
                        sideOffset={8}
                    >
                        <div className="flex flex-col gap-0.5 p-0.5">
                            {field.options?.map((option) => (
                                <SelectItem
                                    key={option.value}
                                    value={String(option.value)}
                                    className={cn(
                                        "relative flex cursor-pointer items-center rounded-lg py-2.5 pl-3 pr-8 outline-none transition-all",
                                        "text-[11px] font-medium",
                                        "focus:bg-white/[0.05] focus:text-white",
                                        "data-[state=checked]:bg-white/[0.08] data-[state=checked]:text-white"
                                    )}
                                >
                                    <div className="flex flex-col gap-0.5 mr-2">
                                        <span className="leading-none tracking-tight">
                                            {option.label}
                                        </span>
                                        {option.description && (
                                            <span className="text-[10px] text-neutral-600 line-clamp-1">
                                                {option.description}
                                            </span>
                                        )}
                                    </div>

                                    <ChevronRight 
                                        size={12} 
                                        className="absolute right-2 text-neutral-600 ml-auto data-[state=checked]:text-white transition-colors" 
                                    />
                                </SelectItem>
                            ))}
                        </div>
                    </SelectContent>
                </Select>

                {/* Ambient glow effect on focus */}
                <div className="absolute inset-0 -z-10 rounded-xl bg-white/[0.03] opacity-0 blur-xl transition-all group-hover:opacity-5 group-focus-within:opacity-10" />
            </div>
        </FieldWrapper>
    );
}