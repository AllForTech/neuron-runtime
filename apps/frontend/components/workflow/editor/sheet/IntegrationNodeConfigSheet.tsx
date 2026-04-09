'use client';

import React, { memo, useEffect, useState } from 'react';
import { Node } from 'reactflow';
import {
  MessageSquare,
  ShieldCheck,
  Settings,
  Info,
  Zap,
  ExternalLink,
  Activity,
  Database,
  ChevronRight,
  Lock,
} from 'lucide-react';
import { useWorkflowEditor } from '@/hooks/workflow/useWorkflowEditor';
import { WorkflowEditorActionType } from '@/constants';
import { INTEGRATION_MANIFEST } from '@/constants';

import { SheetWrapper } from '@/components/workflow/editor/SheetWrapper';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { TemplateTextarea } from '@/components/workflow/editor/TemplateTextarea';
import { getAvailableUpstreamNodes } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { IntegrationNodeConfig } from '@neuron/shared';

function IntegrationConfigSheet({
  node,
  open,
  onOpen,
}: {
  node: Node;
  open: boolean;
  onOpen: (o: boolean) => void;
}) {
  const {
    workflowEditorDispatch,
    editorState: {
      graph: { nodes, edges },
    },
  } = useWorkflowEditor();

  const availableVariables = getAvailableUpstreamNodes(node.id, {
    nodes,
    edges,
  });

  // 1. Initialize local state from node data with Schema types
  const [config, setConfig] = useState<IntegrationNodeConfig>({
    integrationId: node.data?.integrationId || 'slack',
    connectionId: node.data?.connectionId || '',
    action: node.data?.action || 'postMessage',
    parameters: node.data?.parameters || {},
    ...node.data,
  });

  const manifest = INTEGRATION_MANIFEST[config.integrationId];
  // Note: Mapping your actionId from UI to action in the config schema
  const currentAction = manifest?.actions.find((a) => a.id === config.action);

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

  const updateParam = (key: string, value: string) => {
    setConfig((prev: any) => ({
      ...prev,
      parameters: { ...prev.parameters, [key]: value },
    }));
  };

  const handleMetaUpdate = (key: string, value: any) => {
    setConfig((prev) => ({
      ...prev,
      meta: { ...prev.meta, [key]: value },
    }));
  };

  return (
    <SheetWrapper
      open={open}
      onOpenChange={onOpen}
      nodeId={node.id}
      nodeMeta={config?.meta}
      onMetaUpdate={handleMetaUpdate}
      executionConfig={config.executionConfig}
      onExecutionConfigUpdate={(newExec) =>
        handleChange('executionConfig', newExec)
      }
      title={manifest?.label || 'Integration'}
      className="w-[550px]! border-l border-neutral-800 bg-neutral-950/95 p-0! backdrop-blur-2xl"
    >
      <div className="flex h-full flex-col overflow-hidden">
        {/* SUB-HEADER / STATUS BAR */}
        <div className="flex items-center justify-between border-b border-neutral-800/50 bg-neutral-900/40 px-6 py-3">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Activity className="h-3 w-3 text-emerald-500" />
              <span className="font-mono text-[10px] text-neutral-400">
                Node Status: Ready
              </span>
            </div>
            <div className="h-3 w-px bg-neutral-800" />
            <div className="flex items-center gap-2">
              <Database className="h-3 w-3 text-blue-500" />
              <span className="font-mono text-[10px] text-neutral-400">
                ID: {node.id.slice(0, 8)}
              </span>
            </div>
          </div>
          <Badge
            variant="outline"
            className="border-neutral-800 text-[9px] text-neutral-500 uppercase"
          >
            V2.4 Runtime
          </Badge>
        </div>

        <ScrollArea className="flex-1">
          <div className="space-y-8 p-6">
            {/* SECTION: INFRASTRUCTURE (Auth & Action) */}
            <div className="space-y-4">
              <div className="mb-2 flex items-center gap-2">
                <div className="rounded-md bg-blue-500/10 p-1.5">
                  <Settings className="h-3.5 w-3.5 text-blue-500" />
                </div>
                <h4 className="text-[11px] font-bold tracking-widest text-neutral-200 uppercase">
                  System Gateway
                </h4>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="ml-1 text-[10px] font-semibold text-neutral-500">
                    Account Connection
                  </label>
                  <Select
                    value={config.connectionId}
                    onValueChange={(val) => handleChange('connectionId', val)}
                  >
                    <SelectTrigger className="focus:ring-primary h-9 border-neutral-800 bg-neutral-900/50 text-xs focus:ring-1">
                      <div className="flex items-center gap-2">
                        {config.connectionId ? (
                          <ShieldCheck className="h-3 w-3 text-emerald-500" />
                        ) : (
                          <Lock className="h-3 w-3" />
                        )}
                        <SelectValue placeholder="Select Account" />
                      </div>
                    </SelectTrigger>
                    <SelectContent className="border-neutral-800 bg-neutral-950">
                      <SelectItem value="conn_1">
                        Muhammad&#39;s Slack
                      </SelectItem>
                      <SelectItem value="conn_2">API Key</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="ml-1 text-[10px] font-semibold text-neutral-500">
                    Target Action
                  </label>
                  <Select
                    value={config.action}
                    onValueChange={(val) =>
                      setConfig((p) => ({ ...p, action: val, parameters: {} }))
                    }
                  >
                    <SelectTrigger className="focus:ring-primary! h-9 border-neutral-800 bg-neutral-900/50 text-xs focus:ring-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="border-neutral-800 bg-neutral-950">
                      {manifest?.actions.map((action) => (
                        <SelectItem key={action.id} value={action.id}>
                          {action.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* SECTION: PARAMETERS (Dynamic Fields) */}
            <div className="space-y-4 border-t border-neutral-900 pt-4">
              <div className="mb-2 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="rounded-md bg-purple-500/10 p-1.5">
                    <Zap className="h-3.5 w-3.5 text-purple-500" />
                  </div>
                  <h4 className="text-[11px] font-bold tracking-widest text-neutral-200 uppercase">
                    Payload Configuration
                  </h4>
                </div>
                {currentAction && (
                  <span className="font-mono text-[9px] text-neutral-600 italic">
                    Endpoint: {currentAction.id}
                  </span>
                )}
              </div>

              <div className="space-y-5 rounded-xl border border-neutral-800/50 bg-neutral-900/20 p-4 backdrop-blur-sm">
                {currentAction?.fields.map((field) => (
                  <div key={field.id} className="group space-y-2">
                    <div className="flex items-center justify-between px-1">
                      <label className="group-focus-within:text-primary! text-[10px] font-bold text-neutral-400 transition-colors">
                        {field.label}
                      </label>
                      {field.type === 'textarea' && (
                        <Badge
                          variant="outline"
                          className="h-3.5 border-neutral-800 font-mono text-[8px] text-neutral-600"
                        >
                          JS Template
                        </Badge>
                      )}
                    </div>

                    {field.type === 'textarea' ? (
                      <div className="group/field relative">
                        <div className="group-focus-within/field:bg-primary/50 absolute top-0 bottom-0 -left-[1px] w-[2px] rounded-full bg-neutral-800 transition-colors" />
                        <TemplateTextarea
                          value={config.parameters[field.id] || ''}
                          onChange={(val) => updateParam(field.id, val)}
                          variables={availableVariables}
                          className="focus:border-primary/30 min-h-[140px] rounded-lg border-neutral-800 bg-black/60 font-mono text-[12px] leading-relaxed transition-all"
                          placeholder={field.placeholder}
                        />
                      </div>
                    ) : (
                      <Input
                        value={config.parameters[field.id] || ''}
                        onChange={(e) => updateParam(field.id, e.target.value)}
                        className="focus:border-primary/30 h-10 border-neutral-800 bg-black/60 text-xs transition-all"
                        placeholder={field.placeholder}
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* HELPER BOX */}
            <div className="flex gap-4 rounded-xl border border-blue-500/10 bg-blue-500/5 p-4">
              <div className="h-fit rounded-lg bg-blue-500/10 p-2">
                <Info className="h-4 w-4 text-blue-400" />
              </div>
              <div className="space-y-1">
                <p className="text-[11px] font-semibold text-neutral-300">
                  Variable Injection Enabled
                </p>
                <p className="text-[10px] leading-normal text-neutral-500">
                  Type{' '}
                  <code className="rounded bg-blue-400/5 px-1 text-blue-400">
                    {'{{ '}
                  </code>{' '}
                  to browse data from upstream nodes. Use{' '}
                  <code className="text-neutral-300">inputs.node_id</code> to
                  access raw JSON payloads.
                </p>
                <button className="flex items-center gap-1 pt-1 text-[10px] font-medium text-blue-500 hover:underline">
                  View full documentation{' '}
                  <ExternalLink className="h-2.5 w-2.5" />
                </button>
              </div>
            </div>
          </div>
        </ScrollArea>

        {/* ACTION FOOTER */}
        <div className="flex items-center justify-between border-t border-neutral-800 bg-neutral-900/20 p-4">
          <button
            onClick={() => handleChange('parameters', {})}
            className="text-[10px] font-medium text-neutral-500 transition-colors hover:text-neutral-300"
          >
            Clear All Parameters
          </button>
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1 text-[9px] text-neutral-600">
              <ChevronRight className="h-2 w-2" /> Changes save automatically
            </span>
          </div>
        </div>
      </div>
    </SheetWrapper>
  );
}

export const IntegrationNodeConfigSheet = memo(IntegrationConfigSheet);
