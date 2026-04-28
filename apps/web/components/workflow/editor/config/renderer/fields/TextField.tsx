'use client';

import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { FieldWrapper } from '../FieldWrapper';
import { TextFieldSchema } from "@neuron/shared";
import { getValueAtPath } from "@/lib/config/path";

interface TextFieldProps {
    field: TextFieldSchema;
    values: Record<string, any>;
    onChange: (path: string, value: string) => void;
}

export function TextField({ field, values, onChange }: TextFieldProps) {
    const value = getValueAtPath(values, field.path, field.defaultValue ?? "");

    return (
        <FieldWrapper
            label={field.label}
            description={field.description}
            required={field.required}
        >
            {field.type === "textarea" ? (
                <Textarea
                    value={value}
                    placeholder={field.placeholder}
                    disabled={field.disabled}
                    className="min-h-[100px] bg-white/[0.03] border-white/10"
                    onChange={(e) => onChange(field.path, e.target.value)}
                />
            ) : (
                <Input
                    type={field.type === "secret" ? "password" : "text"}
                    value={value}
                    placeholder={field.placeholder}
                    disabled={field.disabled}
                    className="bg-white/[0.03] border-white/10"
                    onChange={(e) => onChange(field.path, e.target.value)}
                />
            )}
        </FieldWrapper>
    );
}