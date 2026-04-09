'use client';

import React, { useState, useMemo, ReactNode, memo } from 'react';
import {
  Plus,
  Trash2,
  Variable,
  Info,
  Copy,
  Check,
  Hash,
  Type,
  Save,
  Search,
  Edit3,
  X,
  Database,
} from 'lucide-react';
import { SheetWrapper } from '@/components/workflow/editor/SheetWrapper';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
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
    isGlobalVariableSheetOpen,
    setIsGlobalVariableSheetOpen,
  } = useWorkflowEditor();

  // variables is now Record<string, GlobalVariable>
  const variables = useMemo(() => {
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

    // Use immediate dispatch for explicit "Save" actions
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

  return (
    <SheetWrapper
      open={isGlobalVariableSheetOpen}
      onOpenChange={setIsGlobalVariableSheetOpen}
      title="Global Intelligence Registry"
      className="w-[600px]! border-l border-neutral-800 bg-neutral-950/98 backdrop-blur-2xl"
    >
      <div className="flex h-full flex-col">
        {/* --- 1. REGISTRATION PANEL --- */}
        <div className="space-y-4 border-b border-neutral-900 bg-neutral-900/10 p-5">
          <div className="mb-2 flex items-center gap-2">
            <Plus className="h-3.5 w-3.5 text-primary" />
            <h4 className="text-[10px] font-bold tracking-[0.2em] text-neutral-400 uppercase">
              Register New Constant
            </h4>
          </div>

          <div className="grid grid-cols-1 gap-3">
            <div className="flex items-center gap-2 rounded-lg border border-neutral-800 bg-black/40 px-3 transition-all focus-within:border-primary">
              <Type className="h-3.5 w-3.5 text-neutral-600" />
              <Input
                placeholder="VARIABLE_NAME"
                value={draft.key}
                onChange={(e) =>
                  setDraft((p) => ({ ...p, key: e.target.value }))
                }
                className="h-9 border-none bg-transparent font-mono text-xs font-bold text-primary uppercase placeholder:text-neutral-700 focus-visible:ring-0"
              />
            </div>
            <Textarea
              placeholder="Value or JSON payload..."
              value={draft.value}
              onChange={(e) =>
                setDraft((p) => ({ ...p, value: e.target.value }))
              }
              className="max-h-[250px] min-h-[100px] resize-none border-neutral-800 bg-black/40 p-3 font-mono text-xs text-neutral-300 focus:border-primary focus-visible:ring-0"
            />
            <Button
              onClick={handleSaveNew}
              disabled={!draft.key}
              className="h-9 bg-white text-[10px] font-bold tracking-widest text-black uppercase hover:bg-neutral-200"
            >
              Commit to Registry
            </Button>
          </div>
        </div>

        {/* --- 2. SEARCH & STATS --- */}
        <div className="flex items-center justify-between bg-neutral-950/50 px-6 py-4">
          <div className="flex items-center gap-2">
            <Database className="h-3 w-3 text-neutral-500" />
            <span className="text-[10px] font-bold tracking-widest text-neutral-500 uppercase">
              Active Registry
            </span>
            <span className="ml-2 font-mono text-[9px] text-neutral-700">
              Total: {Object.keys(variables).length}
            </span>
          </div>
          <div className="relative">
            <Search className="absolute top-1/2 left-2 h-3 w-3 -translate-y-1/2 text-neutral-700" />
            <Input
              placeholder="Search keys..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-7 w-32 border-neutral-800 bg-neutral-900 pl-7 text-[10px] focus-visible:ring-0"
            />
          </div>
        </div>

        {/* --- 3. LIST AREA --- */}
        <ScrollArea className="flex-1 px-6">
          <div className="mt-4 space-y-2 pb-10">
            {filteredEntries.map(([key, variable]) => (
              <div
                key={variable.id}
                className={cn(
                  'group flex flex-col rounded-xl border p-3 transition-all',
                  editingKey === key
                    ? 'border-primary bg-blue-500/5'
                    : 'border-neutral-800/40 bg-neutral-900/20 hover:border-neutral-700'
                )}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 overflow-hidden">
                    <Badge className="shrink-0 border-none bg-neutral-200/10 py-0.5 font-mono text-[10px] text-primary">
                      {key}
                    </Badge>
                    {editingKey !== key && (
                      <span className="max-w-[250px] truncate font-mono text-[11px] text-neutral-500">
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
                          className="h-7 w-7 text-emerald-500"
                          onClick={() => handleCommitEdit(key)}
                        >
                          <Check className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-7 w-7 text-neutral-500"
                          onClick={() => setEditingKey(null)}
                        >
                          <X className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-7 w-7 text-neutral-500 hover:text-white"
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
                          className="h-7 w-7 text-neutral-500 hover:text-primary"
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
                          className="h-7 w-7 text-neutral-500 hover:text-red-500"
                          onClick={() => handleDelete(key)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    )}
                  </div>
                </div>

                {editingKey === key && (
                  <div className="animate-in fade-in slide-in-from-top-1 mt-3 duration-200">
                    <Textarea
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      autoFocus
                      className="max-h-[200px] min-h-[100px] border-neutral-800 bg-black/40 p-3 font-mono text-xs focus:border-primary focus-visible:ring-0"
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        </ScrollArea>

        <div className="border-t border-neutral-900 bg-neutral-950 p-4">
          <div className="flex gap-3 rounded-lg border border-blue-500/10 bg-blue-500/5 p-3">
            <Info className="mt-0.5 h-4 w-4 shrink-0 text-blue-500" />
            <p className="text-[10px] leading-tight text-neutral-500">
              Global variables are accessible as{' '}
              <code className="text-blue-400">{'{{Global.KEY}}'}</code>. Values
              are stored as plain text but can be parsed as JSON in specialized
              nodes.
            </p>
          </div>
        </div>
      </div>
    </SheetWrapper>
  );
}

export const GlobalVariablesSheet = memo(GlobalVariables);

function Badge({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        'rounded-md border px-1.5 text-[9px] font-bold tracking-tight',
        className
      )}
    >
      {children}
    </span>
  );
}
