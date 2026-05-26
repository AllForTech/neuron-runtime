'use client';

import React, { useRef, useEffect, memo } from 'react';
import { EditorView, basicSetup } from 'codemirror';
import { EditorState } from '@codemirror/state';
import { json } from '@codemirror/lang-json';
import { autocompletion } from '@codemirror/autocomplete';
import { oneDarkTheme } from '@codemirror/theme-one-dark';
import { HighlightStyle, syntaxHighlighting } from '@codemirror/language';
import { tags as t } from '@lezer/highlight';
import { FieldWrapper } from '../FieldWrapper';
import { getValueAtPath } from "@/lib/config/path";
import { cn } from "@/lib/utils";
import { Braces } from 'lucide-react';
import {JsonFieldSchema} from "@neuron/shared";

interface JsonFieldProps {
    field: JsonFieldSchema;
    values: Record<string, any>;
    onChange: (path: string, value: string) => void;
}

const jsonHighlightStyle = HighlightStyle.define([
    { tag: t.propertyName, color: '#60a5fa' },
    { tag: t.string, color: '#34d399' },
    { tag: t.number, color: '#fb923c' },
    { tag: t.bool, color: '#fbbf24' },
    { tag: t.null, color: '#fbbf24' },
    { tag: t.punctuation, color: '#9ca3af' },
]);

export function JsonField({ field, values, onChange }: JsonFieldProps) {
    const editorRef = useRef<HTMLDivElement>(null);
    const viewRef = useRef<EditorView | null>(null);
    const value = getValueAtPath(values, field.path, field.defaultValue ?? '') as string;

    useEffect(() => {
        if (!editorRef.current) return;

        const safeDoc = typeof value === 'string' ? value : '';

        const state = EditorState.create({
            doc: safeDoc,
            extensions: [
                basicSetup,
                json(),
                autocompletion(),
                oneDarkTheme,
                syntaxHighlighting(jsonHighlightStyle),
                EditorView.theme({
                    '&': { height: '150px', fontSize: '11px' },
                    '.cm-scroller': { overflow: 'auto' },
                    '&.cm-focused': { outline: 'none' },
                    '.cm-content': { fontFamily: 'JetBrains Mono, monospace' },
                    '.cm-gutters': {
                        backgroundColor: '#0a0a0a',
                        borderRight: '1px solid rgba(255,255,255,0.05)'
                    },
                    '.cm-activeLineGutter': { backgroundColor: 'rgba(255,255,255,0.02)' },
                    '.cm-activeLine': { backgroundColor: 'rgba(255,255,255,0.02)' },
                }),
                EditorView.updateListener.of((update) => {
                    if (update.docChanged) {
                        onChange(field.path, update.state.doc.toString());
                    }
                }),
            ],
        });

        const view = new EditorView({
            state,
            parent: editorRef.current,
        });

        viewRef.current = view;

        return () => {
            view.destroy();
            viewRef.current = null;
        };
    }, []);

    useEffect(() => {
        const safeValue = typeof value === 'string' ? value : '';

        if (viewRef.current && safeValue !== viewRef.current.state.doc.toString()) {
            viewRef.current.dispatch({
                changes: {
                    from: 0,
                    to: viewRef.current.state.doc.length,
                    insert: safeValue,
                },
            });
        }
    }, [value]);

    return (
        <FieldWrapper
            label={field.label}
            description={field.description}
            required={field.required}
        >
            <div className="group relative">
                <div className="absolute left-3 top-2.5 z-10 flex items-center gap-2">
                    <Braces size={12} className="text-emerald-400" />
                    <span className="text-[9px] font-medium uppercase tracking-wider text-neutral-500">
                        JSON
                    </span>
                </div>

                <div
                    className={cn(
                        "relative mt-4 w-full overflow-hidden rounded-xl border transition-all duration-300",
                        "border-white/[0.04] bg-[#050505]",
                        "hover:border-white/[0.08]",
                        "focus-within:border-white/[0.12] focus-within:shadow-[0_0_20px_-8px_rgba(52,211,153,0.15)]"
                    )}
                >
                    <div ref={editorRef} className="w-full overflow-hidden rounded-xl" />
                </div>
            </div>
        </FieldWrapper>
    );
}