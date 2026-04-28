'use client';

import { Textarea } from '@/components/ui/textarea';
import { FieldWrapper } from '../FieldWrapper';

interface TextareaFieldProps {
    field: any;
    value: any;
    onChange: (value: string) => void;
}

export function TextareaField({
                                  field,
                                  value,
                                  onChange,
                              }: TextareaFieldProps) {
    return (
        <FieldWrapper
            label={field.label}
            description={field.description}
            required={field.required}
        >
            <Textarea
                value={value ?? ''}
                placeholder={field.placeholder}
                disabled={field.disabled}
                onChange={(e) => onChange(e.target.value)}
            />
        </FieldWrapper>
    );
}