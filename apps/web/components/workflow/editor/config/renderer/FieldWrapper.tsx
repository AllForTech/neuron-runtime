'use client';

import React from 'react';
import { cn } from '@/lib/utils';

interface FieldWrapperProps {
    label?: string;
    description?: string;
    required?: boolean;
    children: React.ReactNode;
}

export function FieldWrapper({
                                 label,
                                 description,
                                 required,
                                 children,
                             }: FieldWrapperProps) {
    return (
        <div className="flex flex-col gap-2">
            {(label || description) && (
                <div className="flex flex-col gap-1">
                    {label && (
                        <label className="text-xs font-semibold text-neutral-200">
                            {label}

                            {required && (
                                <span className="ml-1 text-red-400">*</span>
                            )}
                        </label>
                    )}

                    {description && (
                        <p className="text-[11px] text-neutral-500">
                            {description}
                        </p>
                    )}
                </div>
            )}

            {children}
        </div>
    );
}