'use client';

import { Switch } from '@/components/ui/switch';
import { FieldWrapper } from '../FieldWrapper';
import { SwitchFieldSchema } from "@neuron/shared";
import { getValueAtPath } from "@/lib/config/path";

interface SwitchFieldProps {
    field: SwitchFieldSchema;
    values: Record<string, any>;
    onChange: (path: string, value: boolean) => void;
}

export function SwitchField({ field, values, onChange }: SwitchFieldProps) {
    const value = getValueAtPath(values, field.path, field.defaultValue ?? false);

    return (
        <div className="flex items-center justify-between py-2 px-1">
            <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-neutral-200">{field.label}</label>
                {field.description && (
                    <p className="text-[10px] text-neutral-500">{field.description}</p>
                )}
            </div>
            <Switch
                checked={!!value}
                disabled={field.disabled}
                onCheckedChange={(checked) => onChange(field.path, checked)}
            />
        </div>
    );
}