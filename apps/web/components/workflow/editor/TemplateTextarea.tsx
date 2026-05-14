'use client';

import React, { useState, useRef, useEffect } from 'react';

import {
  useFloating,
  offset,
  flip,
  shift,
  autoUpdate,
} from '@floating-ui/react';

import getCaretCoordinates from 'textarea-caret';
import { cn, getVariableQuery, insertVariable } from '@/lib/utils';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { UpstreamNodePicker } from '@/components/workflow/editor/UpstreamNodePicker';
import { WorkflowNode } from '@neuron/shared';

interface Props {
  value: string;
  variables: WorkflowNode[];
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  label?: string;
  disabled?: boolean;
}

export function TemplateTextarea({
  value,
  variables,
  onChange,
  placeholder,
  className,
  label,
  disabled,
}: Props) {
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  const [query, setQuery] = useState<string | null>(null);
  const [startIndex, setStartIndex] = useState<number | null>(null);

  const { x, y, strategy, refs, update } = useFloating({
    placement: 'bottom-start',
    strategy: 'fixed',
    middleware: [offset(6), flip(), shift()],
  });

  useEffect(() => {
    if (!refs.reference.current || !refs.floating.current) return;

    return autoUpdate(refs.reference.current, refs.floating.current, update);
  }, [refs, update]);

  function handleInput(e: React.ChangeEvent<HTMLTextAreaElement>) {
    const text = e.target.value;
    const cursor = e.target.selectionStart;

    onChange(text);

    const result = getVariableQuery(text, cursor);

    if (!result) {
      setQuery(null);
      setStartIndex(null);
      return;
    }

    setQuery(result.query);
    setStartIndex(result.startIndex);

    // 1. Get caret position relative to the textarea
    const coords = getCaretCoordinates(e.target, cursor);

    // 2. Get the textarea's position relative to the viewport
    const rect = e.target.getBoundingClientRect();

    // 3. Combine them to get the absolute viewport position
    refs.setReference({
      getBoundingClientRect() {
        return {
          width: 0,
          height: 0,
          x: rect.left + coords.left,
          y: rect.top + coords.top,
          top: rect.top + coords.top,
          left: rect.left + coords.left,
          right: rect.left + coords.left,
          bottom: rect.top + coords.top,
        };
      },
    } as any);
  }

  function selectVariable(variable: string) {
    if (startIndex === null || !textareaRef.current) return;

    const cursor = textareaRef.current.selectionStart;

    const next = insertVariable(value, cursor, startIndex, variable);

    onChange(next);

    setQuery(null);
  }

  const filtered =
    query === null
      ? []
      : variables.filter((v) =>
          v.id.toLowerCase().includes(query.toLowerCase())
        );

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Escape') {
      setQuery(null);
    }
  }

  return (
    <div className="relative flex w-full flex-col gap-2.5">
      {label && (
        <div
          className={cn(
            `grid w-full grid-cols-3 items-start justify-start gap-1 py-2`
          )}
        >
          <div className="space-y-1">
            <Label className="text-secondary-foreground text-sm font-medium">
              {label}
            </Label>
          </div>
        </div>
      )}

      <Textarea
        ref={(node) => {
          textareaRef.current = node;
        }}
        value={value}
        disabled={disabled}
        onKeyDown={handleKeyDown}
        onChange={handleInput}
        placeholder={placeholder}
        className={cn(
          'w-full ' +
            ' min-h-[120px] ' +
            ' resize-y ' +
            ' rounded-lg ' +
            ' border ' +
            ' border-white/[0.06] ' +
            ' bg-white/[0.02] ' +
            ' px-3 ' +
            ' py-2 ' +
            ' text-xs ' +
            ' text-neutral-300 ' +
            ' placeholder:text-neutral-600 ' +
            ' outline-none ' +
            ' focus:ring-1 ' +
            ' focus:ring-white/[0.08] ' +
            ' focus:border-white/[0.12] ' +
            ' transition-all ' +
            ' duration-200',
          className
        )}
      />

      {query !== null && filtered.length > 0 && (
        <div
          onClick={() => setQuery(null)}
          className={'screen center absolute z-48 bg-transparent'}
        />
      )}

      {query !== null && filtered.length > 0 && (
        <div
          ref={refs.setFloating}
          style={{
            position: strategy,
            top: y ?? 0,
            left: x ?? 0,
          }}
          className="z-100 w-64"
        >
          <UpstreamNodePicker
            nodes={variables}
            isLoading={false}
            onSelect={(id) => {
              selectVariable(id);
            }}
          />
        </div>
      )}
    </div>
  );
}
