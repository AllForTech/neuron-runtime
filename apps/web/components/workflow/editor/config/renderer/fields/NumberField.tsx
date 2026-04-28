'use client';

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
    // Extract the value using the path utility
    const value = getValueAtPath(values, field.path, field.defaultValue);

    return (
        <FieldWrapper
            label={field.label}
            description={field.description}
            required={field.required}
        >
            <Input
                type="number"
                value={value ?? ''}
                placeholder={field.placeholder}
                disabled={field.disabled}
                min={field.min}
                max={field.max}
                step={field.step}
                className="bg-white/[0.03] border-white/10 focus:border-white/20 transition-all"
                onChange={(e) => {
                    const val = e.target.value === '' ? undefined : Number(e.target.value);
                    onChange(field.path, val);
                }}
            />
        </FieldWrapper>
    );
}