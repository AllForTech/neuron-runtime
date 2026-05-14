'use client';

import { useCallback, useMemo, useRef, useState, useEffect } from 'react';
import { getValueAtPath, removeValueByPath, setValueAtPath } from '@/lib/config/path';

interface UseNodeConfigStateProps<T> {
    initialValues: T;
    onChange?: (values: T) => void;
}

export function useNodeConfigState<T extends Record<string, any>>({
                                                                      initialValues,
                                                                      onChange,
                                                                  }: UseNodeConfigStateProps<T>) {
    const [values, setLocalValues] = useState<T>(initialValues);
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        setLocalValues(initialValues);
        // Clear any pending debounced updates from the previous node
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }
    }, [initialValues]);

    const onChangeRef = useRef(onChange);
    useEffect(() => {
        onChangeRef.current = onChange;
    }, [onChange]);

    const setValues = useCallback((newValues: T) => {
        setLocalValues(newValues);
    }, []);

    const updateValue = useCallback((path: string, value: any) => {
        setLocalValues((prev) => {
            const next = setValueAtPath({ ...prev }, path, value);

            // Handle the debounce
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
            timeoutRef.current = setTimeout(() => {
                // Use the ref to call the latest version of handleConfigChange
                onChangeRef.current?.(next);
            }, 150);

            return next;
        });
    }, []); // Empty dependencies = perfectly stable function

    const removeValue = useCallback((path: string) => {
        setLocalValues((prev) => {
            const next = removeValueByPath({ ...prev }, path);
            onChangeRef.current?.(next);
            return next;
        });
    }, []);

    const getValue = useCallback(<TValue = any>(path: string): TValue | undefined => {
        return getValueAtPath<TValue>(values, path);
    }, [values]);

    const reset = useCallback(() => {
        setLocalValues(initialValues);
        onChangeRef.current?.(initialValues);
    }, [initialValues]);

    return useMemo(() => ({
        values,
        getValue,
        updateValue,
        removeValue,
        reset,
        setValues,
    }), [values, getValue, updateValue, removeValue, reset, setValues]);
}