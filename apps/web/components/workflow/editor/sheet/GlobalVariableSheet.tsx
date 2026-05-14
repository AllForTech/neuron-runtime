'use client';

import React, { useState, useMemo, memo } from 'react';
import {
    Plus,
    Trash2,
    Variable,
    Copy,
    Check,
    Search,
    Edit3,
    X,
    Database,
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useWorkflowEditor } from '@/hooks/workflow/useWorkflowEditor';
import { WorkflowEditorActionType } from '@/constants';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { GlobalVariable } from '@neuron/shared';
import { debounce } from 'lodash';

function GlobalVariables() {
    const {
        editorState,
        workflowEditorDispatch,
    } = useWorkflowEditor();

    const variables: Record<string, GlobalVariable> = useMemo(() => {
        return editorState.globalVariables ?? {};
    }, [editorState.globalVariables]);

    const [draft, setDraft] = useState({ key: '', value: '' });
    const [editingKey, setEditingKey] = useState<string | null>(null);
    const [editValue, setEditValue] = useState('');
    const [copiedKey, setCopiedKey] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');

    const debouncedDispatch = useMemo(
        () =>
            debounce((newVars: any) => {
                workflowEditorDispatch({
                    type: WorkflowEditorActionType.UPDATE_GLOBAL_VARS,
                    payload: newVars,
                });
            }, 500),
        [workflowEditorDispatch]
    );

    const handleSaveNew = () => {
        if (!draft.key.trim()) return;
        const formattedKey = draft.key.toUpperCase().replace(/\s+/g, '_');

        const newVariable = {
            id: crypto.randomUUID(),
            key: formattedKey,
            value: draft.value,
            type: 'string',
            createdAt: new Date(),
            updatedAt: new Date(),
        };

        const nextVars = { ...variables, [formattedKey]: newVariable };
        debouncedDispatch(nextVars);
        setDraft({ key: '', value: '' });
    };

    const handleCommitEdit = (key: string) => {
        if (!variables[key]) return;
        const updatedVariable = {
            ...variables[key],
            value: editValue,
            updatedAt: new Date(),
        };
        const nextVars = { ...variables, [key]: updatedVariable };

        workflowEditorDispatch({
            type: WorkflowEditorActionType.UPDATE_GLOBAL_VARS,
            payload: nextVars,
        });
        setEditingKey(null);
    };

    const handleDelete = (key: string) => {
        const nextVars = { ...variables };
        delete nextVars[key];
        debouncedDispatch(nextVars);
    };

    const copyToClipboard = (key: string) => {
        navigator.clipboard.writeText(`{{Global.${key}}}`);
        setCopiedKey(key);
        setTimeout(() => setCopiedKey(null), 2000);
    };

    const filteredEntries = useMemo(() => {
        return Object.entries(variables).filter(([k]) =>
            k.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [variables, searchQuery]);

    const hasVariables = Object.keys(variables).length > 0;

    return (
        <div className="flex h-full flex-col p-4">
            {/* Registration Form */}
            <div className="mb-4 rounded-xl border border-white/5 bg-white/[0.02] p-4">
                <div className="mb-3 flex items-center gap-2">
                    <Plus className="h-3.5 w-3.5 text-primary" />
                    <span className="text-[10px] font-semibold tracking-wider text-neutral-400 uppercase">
            Add Variable
          </span>
                </div>

                <div className="space-y-3">
                    <Input
                        placeholder="VARIABLE_NAME"
                        value={draft.key}
                        onChange={(e) =>
                            setDraft((p) => ({ ...p, key: e.target.value }))
                        }
                        className="h-9 border-white/10 uppercase bg-white/[0.03] text-xs text-primary placeholder:text-neutral-600 focus-visible:ring-1 focus-visible:ring-white/20"
                    />
                    <Textarea
                        placeholder="Value..."
                        value={draft.value}
                        onChange={(e) =>
                            setDraft((p) => ({ ...p, value: e.target.value }))
                        }
                        className="max-h-[120px] min-h-[80px] resize-none border-white/10 bg-white/[0.03] text-xs text-neutral-300 placeholder:text-neutral-600 focus-visible:ring-1 focus-visible:ring-white/20"
                    />
                    <Button
                        onClick={handleSaveNew}
                        disabled={!draft.key}
                        className="h-8 w-full bg-white text-xs font-medium text-black hover:bg-neutral-200"
                    >
                        Add Variable
                    </Button>
                </div>
            </div>

            {/* Search & Stats */}
            {hasVariables && (
                <div className="mb-3 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Database className="h-3 w-3 text-neutral-500" />
                        <span className="text-[10px] font-medium text-neutral-500">
              {Object.keys(variables).length} variable{Object.keys(variables).length !== 1 ? 's' : ''}
            </span>
                    </div>
                    <div className="relative">
                        <Search className="absolute top-1/2 left-2.5 h-3 w-3 -translate-y-1/2 text-neutral-600" />
                        <Input
                            placeholder="Search..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="h-7 w-28 border-white/10 bg-white/[0.03] pl-8 text-[10px] placeholder:text-neutral-600 focus-visible:ring-1 focus-visible:ring-white/20"
                        />
                    </div>
                </div>
            )}

            {/* Variables List */}
            <div className="flex-1 space-y-2 overflow-y-auto pb-4">
                {filteredEntries.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12">
                        <Variable className="mb-3 h-6 w-6 text-neutral-700" />
                        <p className="text-xs text-neutral-500">
                            {hasVariables ? 'No variables match your search' : 'No variables yet'}
                        </p>
                    </div>
                ) : (
                    filteredEntries.map(([key, variable]) => (
                        <div
                            key={variable.id}
                            className={cn(
                                'group relative overflow-hidden rounded-lg border border-white/5 bg-white/[0.02] p-3 transition-all hover:bg-white/[0.04]',
                                editingKey === key && 'bg-white/[0.04] ring-1 ring-white/20'
                            )}
                        >
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3 overflow-hidden">
                  <span className="shrink-0 rounded-md bg-white/10 px-2 py-1 text-[10px] font-medium text-primary">
                    {key}
                  </span>
                                    {editingKey !== key && (
                                        <span className="max-w-[180px] truncate text-[11px] text-neutral-500">
                      {variable.value || 'empty'}
                    </span>
                                    )}
                                </div>

                                <div className="flex items-center gap-1">
                                    {editingKey === key ? (
                                        <div className="flex items-center gap-1">
                                            <Button
                                                size="icon"
                                                variant="ghost"
                                                className="h-6 w-6 text-emerald-500 hover:text-emerald-400"
                                                onClick={() => handleCommitEdit(key)}
                                            >
                                                <Check className="h-3 w-3" />
                                            </Button>
                                            <Button
                                                size="icon"
                                                variant="ghost"
                                                className="h-6 w-6 text-neutral-500 hover:text-neutral-400"
                                                onClick={() => setEditingKey(null)}
                                            >
                                                <X className="h-3 w-3" />
                                            </Button>
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-0.5 opacity-0 transition-opacity group-hover:opacity-100">
                                            <Button
                                                size="icon"
                                                variant="ghost"
                                                className="h-6 w-6 text-neutral-500 hover:text-primary"
                                                onClick={() => copyToClipboard(key)}
                                            >
                                                {copiedKey === key ? (
                                                    <Check className="h-3 w-3 text-emerald-500" />
                                                ) : (
                                                    <Copy className="h-3 w-3" />
                                                )}
                                            </Button>
                                            <Button
                                                size="icon"
                                                variant="ghost"
                                                className="h-6 w-6 text-neutral-500 hover:text-primary"
                                                onClick={() => {
                                                    setEditingKey(key);
                                                    setEditValue(variable.value);
                                                }}
                                            >
                                                <Edit3 className="h-3 w-3" />
                                            </Button>
                                            <Button
                                                size="icon"
                                                variant="ghost"
                                                className="h-6 w-6 text-neutral-500 hover:text-red-500"
                                                onClick={() => handleDelete(key)}
                                            >
                                                <Trash2 className="h-3 w-3" />
                                            </Button>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {editingKey === key && (
                                <div className="mt-3">
                                    <Textarea
                                        value={editValue}
                                        onChange={(e) => setEditValue(e.target.value)}
                                        autoFocus
                                        className="max-h-[150px] min-h-[80px] border-white/10 bg-white/[0.03] text-xs focus-visible:ring-1 focus-visible:ring-white/20"
                                    />
                                </div>
                            )}
                        </div>
                    ))
                )}
            </div>

            {/* Help Text */}
            <div className="rounded-lg border border-blue-500/10 bg-blue-500/5 p-3">
                <p className="text-[10px] leading-relaxed text-neutral-500">
                    Use <span className="text-blue-400">{'{{Global.KEY}}'}</span> in your nodes to reference these variables.
                </p>
            </div>
        </div>
    );
}

export default memo(GlobalVariables);