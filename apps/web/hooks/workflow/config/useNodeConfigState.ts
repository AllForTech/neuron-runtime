'use client';

import { useCallback, useMemo, useState, useEffect, useRef } from 'react';
import { getValueAtPath, removeValueByPath, setValueAtPath } from '@/lib/config/path';

interface UseNodeConfigStateProps<T> {
    initialValues: T;
    onChange?: (values: T) => void;
}

export function useNodeConfigState<T extends Record<string, any>>({
                                                                      initialValues,
                                                                      onChange,
                                                                  }: UseNodeConfigStateProps<T>) {
    const [values, setValues] = useState<T>(initialValues);

    // Track if this is the first render to avoid firing onChange on mount
    const isFirstMount = useRef(true);

    // Side effect: Notify the parent ONLY after local state has updated
    useEffect(() => {
        if (isFirstMount.current) {
            isFirstMount.current = false;
            return;
        }
        onChange?.(values);
    }, [values, onChange]);

    const updateValue = useCallback((path: string, value: any) => {
        setValues((prev) => setValueAtPath({ ...prev }, path, value));
    }, []);

    const removeValue = useCallback((path: string) => {
        setValues((prev) => removeValueByPath({ ...prev }, path));
    }, []);

    const getValue = useCallback(<TValue = any>(path: string): TValue | undefined => {
        return getValueAtPath<TValue>(values, path);
    }, [values]);

    const reset = useCallback(() => setValues(initialValues), [initialValues]);

    return useMemo(() => ({
        values,
        getValue,
        updateValue,
        removeValue,
        reset,
        setValues,
    }), [values, getValue, updateValue, removeValue, reset]);
}