'use client';

import { useCallback, useMemo, useState } from 'react';
import {
    getValueAtPath,
    removeValueByPath,
    setValueAtPath,
} from '@/lib/config/path';

interface UseNodeConfigStateProps<T> {
    initialValues: T;
    onChange?: (values: T) => void;
}

export function useNodeConfigState<T extends Record<string, any>>({
                                                                      initialValues,
                                                                      onChange,
                                                                  }: UseNodeConfigStateProps<T>) {
    const [values, setValues] = useState<T>(initialValues);

    const updateValue = useCallback(
        (path: string, value: any) => {
            setValues((prev) => {
                const next = setValueAtPath(prev, path, value);

                onChange?.(next);

                return next;
            });
        },
        [onChange]
    );

    const removeValue = useCallback(
        (path: string) => {
            setValues((prev) => {
                const next = removeValueByPath(prev, path);

                onChange?.(next);

                return next;
            });
        },
        [onChange]
    );

    const getValue = useCallback(
        <TValue = any>(path: string): TValue | undefined => {
            return getValueAtPath<TValue>(values, path);
        },
        [values]
    );

    const reset = useCallback(() => {
        setValues(initialValues);
    }, [initialValues]);

    return useMemo(
        () => ({
            values,

            getValue,
            updateValue,
            removeValue,

            reset,
            setValues,
        }),
        [
            values,
            getValue,
            updateValue,
            removeValue,
            reset,
        ]
    );
}