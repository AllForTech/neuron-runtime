'use client';

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

interface SelectFieldProps {
    field: SelectFieldSchema;
    values: Record<string, any>;
    onChange: (path: string, value: string) => void;
}

export function SelectField({
                                field,
                                values,
                                onChange,
                            }: SelectFieldProps) {
    // Standardize value retrieval using the path
    const value = getValueAtPath(values, field.path, field.defaultValue);

    return (
        <FieldWrapper
            label={field.label}
            description={field.description}
            required={field.required}
        >
            <Select
                value={value ? String(value) : undefined}
                onValueChange={(val) => onChange(field.path, val)}
                disabled={field.disabled}
            >
                <SelectTrigger className="bg-white/[0.03] border-white/10 hover:border-white/20 transition-all">
                    <SelectValue placeholder={field.placeholder || "Select an option"} />
                </SelectTrigger>

                <SelectContent className="bg-[#0C0C0C] border-white/10 backdrop-blur-xl">
                    {field.options?.map((option) => (
                        <SelectItem
                            key={option.value}
                            value={String(option.value)}
                            className="focus:bg-white/5 focus:text-white transition-colors"
                        >
                            <div className="flex flex-col gap-0.5">
                                <span className="text-xs font-medium">{option.label}</span>
                                {option.description && (
                                    <span className="text-[10px] text-neutral-500 line-clamp-1">
                                        {option.description}
                                    </span>
                                )}
                            </div>
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
        </FieldWrapper>
    );
}