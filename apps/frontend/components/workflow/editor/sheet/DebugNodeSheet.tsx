'use client';

import React, { memo, useEffect, useState } from 'react';
import { Node } from 'reactflow';
import { useWorkflowEditor } from '@/hooks/workflow/useWorkflowEditor';
import { WorkflowEditorActionType } from '@/constants';
import { DebugNodeConfig } from '@neuron/shared';

import { Input } from '@/components/ui/input';
import { SheetWrapper } from '@/components/workflow/editor/SheetWrapper';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

function DebugConfigSheet({
  node,
  open,
  onOpen,
}: {
  node: Node;
  open: boolean;
  onOpen: (open: boolean) => void;
}) {
  const { workflowEditorDispatch } = useWorkflowEditor();

  // 1. Initialize local state from node config (following your schema)
  const [config, setConfig] = useState<DebugNodeConfig>({
    message: node.data?.message || '',
    ...node.data,
  });

  // 2. Debounced sync to global workflow state
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
  }, [config, node.id, workflowEditorDispatch]);

  const handleChange = (key: string, value: any) => {
    setConfig((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <SheetWrapper
      nodeId={node.id}
      open={open}
      onOpenChange={onOpen}
      nodeMeta={config.meta}
      onMetaUpdate={handleChange}
      executionConfig={config.executionConfig}
      onExecutionConfigUpdate={(newExec) =>
        handleChange('executionConfig', newExec)
      }
      className="h-full! w-[550px]! border-l border-neutral-800 bg-neutral-950/95 p-0! backdrop-blur-xl"
      title="Debug Configuration"
    >
      <div className="mt-6 space-y-6 p-2">
        <div className="space-y-5 rounded-xl border border-neutral-800/50 bg-neutral-900/40 p-4 backdrop-blur-sm">
          <p className="mb-1 text-[10px] font-bold tracking-tight text-neutral-500 uppercase">
            Log Payload
          </p>

          {/* MESSAGE / CONTENT */}
          <div className="space-y-2">
            <Label className="text-[11px] font-bold tracking-wider text-neutral-400 uppercase">
              Debug Message
            </Label>
            <Textarea
              value={config.message}
              onChange={(e) => handleChange('message', e.target.value)}
              placeholder="Enter message or use {{variable}}..."
              className="focus:border-primary/50 min-h-[120px] resize-none rounded-xl border-neutral-800 bg-neutral-950 font-mono text-[11px] text-white transition-all focus:ring-0"
            />
          </div>

          {/* LOG LEVEL - Based on your common debug patterns */}
          <div className="space-y-2">
            <Label className="text-[11px] font-bold tracking-wider text-neutral-400 uppercase">
              Severity Level
            </Label>
            <select
              value={'info'}
              onChange={(e) => handleChange('logLevel', e.target.value)}
              className="focus:border-primary/50 h-10 w-full cursor-pointer appearance-none rounded-xl border border-neutral-800 bg-neutral-950 px-3 text-[11px] text-white transition-all outline-none"
            >
              <option value="debug">DEBUG</option>
              <option value="info">INFO</option>
              <option value="warn">WARNING</option>
              <option value="error">ERROR</option>
            </select>
          </div>
        </div>

        {/* HELPER TEXT */}
        <div className="flex items-start gap-2 px-1">
          <div className="bg-primary/40 mt-1 h-1.5 w-1.5 animate-pulse rounded-full" />
          <p className="text-[10px] leading-relaxed text-neutral-500">
            Debug nodes output data to the <b>Execution Logs</b> without
            affecting downstream production logic.
          </p>
        </div>
      </div>
    </SheetWrapper>
  );
}

export const DebugNodeConfigSheet = memo(DebugConfigSheet);
