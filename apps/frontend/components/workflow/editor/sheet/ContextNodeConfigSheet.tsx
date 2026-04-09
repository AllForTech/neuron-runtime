'use client';

import React, { useMemo } from 'react';
import { Node } from 'reactflow';
import {
  Braces,
  Database,
  Hash,
  Layers,
  Link2,
  ShieldCheck,
  Trash2,
  X,
  Zap,
} from 'lucide-react';

import { useWorkflowEditor } from '@/hooks/workflow/useWorkflowEditor';
import { WorkflowEditorActionType } from '@/constants';
import { SheetWrapper } from '@/components/workflow/editor/SheetWrapper';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { ContextNode } from '@neuron/shared';
import { toast } from 'sonner';

export function ContextNodeConfigSheet({
  node: initialNode,
  open,
  onOpen,
}: {
  node: Node;
  open: boolean;
  onOpen: (open: boolean) => void;
}) {
  const { workflowEditorDispatch, editorState } = useWorkflowEditor();

  const activeNode = useMemo(() => {
    const node = editorState.graph.nodes[initialNode.id];

    return node as ContextNode;
  }, [editorState.graph.nodes, initialNode.id]);

  const fields = activeNode.config?.fields ?? {};
  const fieldEntries = Object.entries(fields);

  const removeField = (keyToRemove: string) => {
    const newFields = { ...fields };
    delete newFields[keyToRemove];

    workflowEditorDispatch({
      type: WorkflowEditorActionType.UPDATE_NODE,
      id: activeNode.id,
      payload: {
        ...activeNode.config,
        fields: newFields,
      },
    });
  };

  const clearRegistry = () => {
    workflowEditorDispatch({
      type: WorkflowEditorActionType.UPDATE_NODE,
      id: activeNode.id,
      payload: {
        ...activeNode.config,
        fields: {},
      },
    });
  };

  const handleChange = (key: string, value: any) => {
    workflowEditorDispatch({
      type: WorkflowEditorActionType.UPDATE_NODE,
      id: initialNode.id,
      payload: { ...initialNode.data, meta: value },
    });
  };

  return (
    <SheetWrapper
      open={open}
      onOpenChange={onOpen}
      title="Context Aggregator"
      showContextSettings={false}
      nodeMeta={initialNode.data?.meta}
      onMetaUpdate={handleChange}
      className="w-[550px]! border-l border-neutral-900 bg-neutral-950/95 p-0! backdrop-blur-3xl"
    >
      <div className="flex h-full flex-col overflow-hidden">
        {/* SUB-HEADER STATUS */}
        <div className="flex items-center justify-between border-b border-neutral-800/40 bg-neutral-900/20 px-6 py-3">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Database className="h-3.5 w-3.5 text-neutral-400" />
              <span className="font-mono text-[10px] tracking-widest text-neutral-500 uppercase">
                storage.v1 // {activeNode.id.split('-')[0]}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div
              className={cn(
                'h-1 w-1 rounded-full',
                fieldEntries.length > 0
                  ? 'bg-white shadow-[0_0_8px_white]'
                  : 'bg-neutral-800'
              )}
            />
            <span className="text-[9px] font-bold tracking-tighter text-neutral-400 uppercase">
              {fieldEntries.length > 0 ? 'Sync Active' : 'Buffer Null'}
            </span>
          </div>
        </div>

        <ScrollArea className="flex-1">
          <div className="space-y-8 p-4">
            {/* SECTION: REGISTERED FIELDS */}
            <div className="space-y-4">
              <div className="flex items-center justify-between px-1">
                <div className="flex items-center gap-2">
                  <div className="rounded-md border border-white/10 bg-white/5 p-1.5">
                    <Layers className="h-3.5 w-3.5 text-white" />
                  </div>
                  <h4 className="text-[11px] font-bold tracking-[0.2em] text-white uppercase">
                    Active Registry
                  </h4>
                </div>
                <Badge
                  variant="outline"
                  className="border-neutral-800 font-mono text-[10px] text-neutral-500"
                >
                  {fieldEntries.length} Slots
                </Badge>
              </div>

              <div className="min-h-full! space-y-2">
                {fieldEntries.length === 0 ? (
                  <div className="flex flex-col items-center justify-center rounded-3xl border border-neutral-900 bg-neutral-900/20 py-20">
                    <Braces className="mb-3 h-5 w-5 text-neutral-800" />
                    <p className="text-[10px] font-bold tracking-widest text-neutral-600 uppercase">
                      No Data Pointers
                    </p>
                  </div>
                ) : (
                  fieldEntries.map(([key, value]) => (
                    <div
                      key={key}
                      className="group flex items-center justify-between gap-4 rounded-2xl border border-neutral-800/50 bg-neutral-900/40 p-4 transition-all duration-300 hover:border-white/20"
                    >
                      <div className="flex items-center gap-4 overflow-hidden">
                        <div className="rounded-lg border border-neutral-800 bg-neutral-950 p-2">
                          <Hash className="h-3 w-3 text-neutral-400" />
                        </div>
                        <div className="flex flex-col gap-0.5 overflow-hidden">
                          <span className="truncate font-mono text-[11px] font-bold text-white">
                            {key}
                          </span>
                          <div className="flex items-center gap-1.5 opacity-40">
                            <Link2 className="h-2.5 w-2.5" />
                            <span className="truncate font-mono text-[9px]">
                              {String(value)}
                            </span>
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={() => removeField(key)}
                        className="rounded-xl p-2.5 text-neutral-600 opacity-0 transition-all group-hover:opacity-100 hover:bg-white/5 hover:text-white"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* ARCHITECTURAL INFO BOX */}
            <div className="flex gap-5 rounded-3xl border border-white/5 bg-green-500/[0.10] p-6">
              <div className="h-fit rounded-2xl border border-white/10 bg-white/5 p-2.5">
                <ShieldCheck className="h-4 w-4 text-white" />
              </div>
              <div className="space-y-1.5">
                <p className="text-[11px] font-bold tracking-tight text-white uppercase">
                  Logic Verification
                </p>
                <p className="text-[10px] leading-relaxed text-neutral-500">
                  Fields listed here are dynamically resolved during the
                  execution phase. Deleting a registry entry here will
                  permanently sever the template reference.
                </p>
              </div>
            </div>
          </div>
        </ScrollArea>

        {/* BOTTOM ACTION BAR */}
        <div className="flex items-center justify-between border-t border-neutral-900 bg-neutral-950/50 p-6 pb-3!">
          <button
            onClick={() => onOpen(false)}
            className="flex items-center gap-2 px-2 text-[9px] font-bold tracking-widest text-neutral-600 uppercase transition-colors hover:text-white"
          >
            <X className="h-3 w-3" /> Dismiss
          </button>

          <div className="flex items-center gap-5">
            <div className="hidden flex-col items-end sm:flex">
              <span className="text-[9px] font-bold tracking-tighter text-neutral-500 uppercase">
                Engine State
              </span>
              <span className="text-[9px] font-black tracking-tighter text-white uppercase">
                Ready
              </span>
            </div>
            <button
              onClick={clearRegistry}
              className="flex h-11 items-center gap-2 rounded-full bg-white px-6 text-[11px] font-black tracking-widest text-black uppercase shadow-[0_0_20px_rgba(255,255,255,0.1)] transition-all hover:bg-neutral-200 active:scale-95"
            >
              <Zap className="h-3.5 w-3.5 fill-black" /> Clear Context
            </button>
          </div>
        </div>
      </div>
    </SheetWrapper>
  );
}
