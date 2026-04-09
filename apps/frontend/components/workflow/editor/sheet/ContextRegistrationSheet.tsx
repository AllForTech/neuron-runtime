'use client';

import React from 'react';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { ChevronDown, Share2, AlertCircle, Link2 } from 'lucide-react';
import { useWorkflowEditor } from '@/hooks/workflow/useWorkflowEditor';
import { WorkflowEditorActionType } from '@/constants';
import { ContextNode, NodeConfigType } from '@neuron/shared';
import { cn } from '@/lib/utils';

export const ContextRegistrationSheet = ({ nodeId }: { nodeId: string }) => {
  const { editorState, workflowEditorDispatch } = useWorkflowEditor();

  // Direct state lookup for reactivity
  const nodes = editorState.graph.nodes;
  const currentNode = nodes[nodeId];
  const contextNode = Object.values(nodes).find(
    (n) => n.type === 'contextNode'
  ) as ContextNode;

  if (!currentNode) return null;

  const config: NodeConfigType = currentNode.config;
  const isActive = config.persistToContext && !!contextNode;

  const handleToggle = (checked: boolean) => {
    workflowEditorDispatch({
      type: WorkflowEditorActionType.UPDATE_NODE,
      id: nodeId,
      payload: {
        ...config,
        persistToContext: checked,
        contextNodeId: checked ? contextNode?.id : undefined,
      },
    });

    if (checked && contextNode) {
      const aliasKey = config.alias || nodeId;
      workflowEditorDispatch({
        type: WorkflowEditorActionType.UPDATE_NODE,
        id: contextNode.id,
        payload: {
          ...contextNode.config,
          fields: {
            ...contextNode.config.fields,
            [aliasKey]: `{{${nodeId}}}`,
          },
        },
      });
    }
  };

  const handleAliasChange = (newAlias: string) => {
    const oldAlias = config.alias || nodeId;

    workflowEditorDispatch({
      type: WorkflowEditorActionType.UPDATE_NODE,
      id: nodeId,
      payload: { ...config, alias: newAlias },
    });

    if (config.persistToContext && contextNode) {
      const newFields = { ...contextNode.config.fields };
      delete newFields[oldAlias];
      newFields[newAlias || nodeId] = `{{${nodeId}}}`;

      workflowEditorDispatch({
        type: WorkflowEditorActionType.UPDATE_NODE,
        id: contextNode.id,
        payload: {
          ...contextNode.config,
          fields: newFields,
        },
      });
    }
  };

  return (
    <Collapsible
      className={cn(
        'w-full rounded-2xl border p-4 transition-all duration-500',
        isActive
          ? 'border-emerald-500/30 bg-emerald-500/[0.03] shadow-[0_0_20px_-10px_rgba(16,185,129,0.2)]'
          : 'border-neutral-800 bg-neutral-900/40'
      )}
    >
      <CollapsibleTrigger className="group flex w-full items-center justify-between">
        <div className="flex items-center gap-3">
          <div
            className={cn(
              'rounded-xl border p-2 transition-colors duration-300',
              isActive
                ? 'border-emerald-500/20 bg-emerald-500/10'
                : 'border-neutral-800 bg-neutral-950'
            )}
          >
            <Share2
              className={cn(
                'h-4 w-4',
                isActive ? 'text-emerald-400' : 'text-neutral-500'
              )}
            />
          </div>
          <div className="flex flex-col items-start gap-0.5">
            <span className="text-[11px] font-bold tracking-widest text-neutral-200 uppercase">
              Context Sync
            </span>
            <span className="text-[9px] font-medium text-neutral-500">
              {isActive ? 'ACTIVE REGISTRY' : 'LOCAL SCOPE'}
            </span>
          </div>
        </div>
        <ChevronDown
          className={cn(
            'h-4 w-4 text-neutral-600 transition-transform duration-300 group-data-[state=open]:rotate-180',
            isActive && 'text-emerald-500/50'
          )}
        />
      </CollapsibleTrigger>

      <CollapsibleContent className="space-y-5 pt-6">
        <div
          onClick={() => handleToggle(!isActive)}
          className="transition-200 flex items-center justify-between rounded-xl border border-neutral-800/50 bg-black/20 p-3 hover:bg-black/15"
        >
          <div className="space-y-1">
            <Label
              htmlFor="persist"
              className="cursor-pointer text-[10px] font-bold tracking-tight text-white uppercase"
            >
              Expose Output
            </Label>
            {!contextNode && (
              <p className="flex items-center gap-1 text-[9px] font-medium text-amber-500/80">
                <AlertCircle className="h-2.5 w-2.5" /> REQUIRED:
                CONTEXT_NODE_MISSING
              </p>
            )}
          </div>
          <Switch
            id="persist"
            checked={config.persistToContext || false}
            onCheckedChange={handleToggle}
            disabled={!contextNode}
            className="data-[state=checked]:bg-emerald-500"
          />
        </div>

        {config.persistToContext && (
          <div className="animate-in fade-in zoom-in-95 space-y-2.5 duration-300">
            <div className="flex items-center gap-2 px-1">
              <Link2 className="h-3 w-3 text-neutral-500" />
              <Label className="text-[9px] font-black tracking-widest text-neutral-500 uppercase">
                Registry Alias
              </Label>
            </div>
            <Input
              placeholder="e.g. data_source"
              value={config.alias || ''}
              onChange={(e) => handleAliasChange(e.target.value)}
              className="h-10 rounded-xl border-neutral-800 bg-neutral-950 font-mono text-[11px] text-white transition-all focus:border-emerald-500/50 focus:ring-0"
            />
          </div>
        )}
      </CollapsibleContent>
    </Collapsible>
  );
};
