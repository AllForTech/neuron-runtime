'use client';

import React, { memo, useEffect, useState } from 'react';
import { Node } from 'reactflow';
import { Code2, X, Zap, Info, Terminal, Layers } from 'lucide-react';

import { useWorkflowEditor } from '@/hooks/workflow/useWorkflowEditor';
import { WorkflowEditorActionType } from '@/constants';
import { getAvailableUpstreamNodes } from '@/lib/utils';
import { TransformNodeConfig } from '@neuron/shared';

import { SheetWrapper } from '@/components/workflow/editor/SheetWrapper';
import CodeEditor from '@/components/workflow/editor/CodeEditor';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

function TransformConfigSheet({
  node,
  open,
  onOpen,
}: {
  node: Node;
  open: boolean;
  onOpen?: (open: boolean) => void;
}) {
  const {
    workflowEditorDispatch,
    editorState: {
      graph: { nodes, edges },
    },
  } = useWorkflowEditor();

  // 1. Initialize local state with full schema spread
  const [config, setConfig] = useState<TransformNodeConfig>({
    code: "// Access upstream data via the 'inputs' object\nreturn inputs;",
    ...node.data,
  });

  const availableVariables = getAvailableUpstreamNodes(node.id, {
    nodes,
    edges,
  });

  // 2. Debounced sync to global state with change detection
  useEffect(() => {
    const hasChanged = JSON.stringify(config) !== JSON.stringify(node.data);
    if (!hasChanged) return;

    const timer = setTimeout(() => {
      workflowEditorDispatch({
        type: WorkflowEditorActionType.UPDATE_NODE,
        id: node.id,
        payload: config,
      });
    }, 300);

    return () => clearTimeout(timer);
  }, [config, node.id, workflowEditorDispatch, node.data]);

  // 3. Proper state update handlers
  const handleChange = (key: string, value: any) => {
    setConfig((prev) => ({ ...prev, [key]: value }));
  };

  const handleCodeChange = (value: string) => {
    setConfig((prev) => ({ ...prev, code: value }));
  };

  return (
    <SheetWrapper
      open={open}
      onOpenChange={onOpen}
      nodeMeta={config?.meta}
      onMetaUpdate={handleChange}
      nodeId={node.id}
      executionConfig={config.executionConfig}
      onExecutionConfigUpdate={(newExec) =>
        handleChange('executionConfig', newExec)
      }
      title="Data Transformation"
      className="h-full! w-[600px]! border-l border-neutral-800 bg-neutral-950/95 p-0! backdrop-blur-xl"
    >
      <div className="flex h-full flex-col">
        {/* HEADER SUB-INFO */}
        <div className="flex items-center justify-between border-b border-neutral-800/50 bg-neutral-900/40 px-6 py-3">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <Terminal className="h-3.5 w-3.5 text-neutral-500" />
              <span className="font-mono text-[10px] tracking-widest text-neutral-500 uppercase">
                Logic Engine // Runtime
              </span>
            </div>
          </div>
          <Badge
            variant="outline"
            className="border-purple-500/20 bg-purple-500/5 text-[9px] tracking-tighter text-purple-400 uppercase"
          >
            Javascript V8 (Node 20)
          </Badge>
        </div>

        {/* CONTENT AREA */}
        <div className="flex min-h-0 flex-1 flex-col space-y-6 px-6 py-6">
          {/* EDITOR SECTION */}
          <div className="flex min-h-0 flex-1 flex-col space-y-3">
            <div className="flex shrink-0 items-center justify-between px-1">
              <div className="flex items-center gap-2">
                <div className="rounded bg-yellow-500/10 p-1">
                  <Zap className="h-3 w-3 text-yellow-500" />
                </div>
                <label className="text-[10px] font-bold tracking-widest text-neutral-400 uppercase">
                  Functional Logic
                </label>
              </div>
            </div>

            <div className="group relative flex-1 overflow-hidden rounded-xl border border-neutral-800 bg-black shadow-2xl">
              <CodeEditor
                value={config.code}
                onChange={handleCodeChange}
                height="100%"
                className="border-none bg-transparent"
              />
            </div>
          </div>

          {/* CONTEXT EXPLORER */}
          <div className="shrink-0 space-y-3">
            <div className="flex items-center gap-2 px-1">
              <Layers className="h-3 w-3 text-neutral-500" />
              <label className="text-[10px] font-bold tracking-widest text-neutral-400 uppercase">
                Global Scope Explorer
              </label>
            </div>

            <ScrollArea className="h-48 rounded-xl border border-neutral-800 bg-neutral-900/20 p-4">
              <div className="space-y-4">
                {/* Global Variable Info */}
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <code className="rounded border border-purple-500/20 bg-purple-500/10 px-1.5 py-0.5 text-[11px] font-bold text-purple-400">
                      inputs
                    </code>
                    <span className="text-[10px] font-medium text-neutral-500">
                      Immutable Registry
                    </span>
                  </div>
                  <p className="text-[10px] leading-relaxed text-neutral-500 italic">
                    Contains results from all parent nodes. Access values via
                    <span className="mx-1 font-mono text-neutral-300">
                      inputs.node_id.output
                    </span>
                    .
                  </p>
                </div>

                {/* Upstream Nodes List */}
                <div className="border-t border-neutral-800/50 pt-3">
                  <p className="mb-2 text-[9px] font-bold text-neutral-600 uppercase">
                    Resolved Dependencies
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {availableVariables.length > 0 ? (
                      availableVariables.map((v) => (
                        <div
                          key={v.id}
                          className="flex items-center gap-1.5 rounded-md border border-neutral-800/50 bg-neutral-950 px-2 py-1"
                        >
                          <div className="h-1 w-1 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                          <span className="font-mono text-[10px] text-neutral-400">
                            {v.type || v.id}
                          </span>
                        </div>
                      ))
                    ) : (
                      <span className="text-[10px] text-neutral-700 italic">
                        No upstream signals detected
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </ScrollArea>

            <div className="flex items-start gap-3 rounded-xl border border-blue-500/10 bg-blue-500/5 p-3 text-[10px] text-neutral-500">
              <Info className="mt-0.5 h-3.5 w-3.5 text-blue-500" />
              <span className="leading-relaxed">
                <strong>Sandbox Isolation:</strong> Transformations run in a
                secure V8 isolate. External networking (fetch, axios) and
                filesystem access are restricted for security.
              </span>
            </div>
          </div>
        </div>
      </div>
    </SheetWrapper>
  );
}

export const TransformNodeConfigSheet = memo(TransformConfigSheet);
