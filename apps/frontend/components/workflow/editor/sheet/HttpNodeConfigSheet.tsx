'use client';

import React, { memo, useEffect, useState } from 'react';
import { Node } from 'reactflow';
import {
  Globe,
  X,
  Settings2,
  ChevronDown,
  Database,
  Key,
  Activity,
} from 'lucide-react';

import { useWorkflowEditor } from '@/hooks/workflow/useWorkflowEditor';
import { WorkflowEditorActionType, HTTP_METHODS } from '@/constants';
import { getAvailableUpstreamNodes } from '@/lib/utils';
import { HttpRequestNodeConfig } from '@neuron/shared';

import { SheetWrapper } from '@/components/workflow/editor/SheetWrapper';
import { TemplateTextarea } from '@/components/workflow/editor/TemplateTextarea';
import { HeadersEditor } from './HeaderEditor';
import FormField from '@/components/FormField';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';

function HttpRequestConfigSheet({
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

  // 1. Initialize local state from node config using Schema types
  const [config, setConfig] = useState<HttpRequestNodeConfig>({
    url: node.data?.url || '',
    method: node.data?.method || 'GET',
    headers: node.data?.headers || {},
    body: node.data?.body || {},
    ...node.data,
  });

  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    headers: true,
    body: true,
  });

  const availableVariables = getAvailableUpstreamNodes(node.id, {
    nodes,
    edges,
  });

  // 2. Optimized Debounced Sync (The Fix)
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
    setConfig((prevState) => ({ ...prevState, [key]: value }));
  };

  const toggleSection = (section: string) => {
    setOpenSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  return (
    <SheetWrapper
      open={open}
      onOpenChange={onOpen}
      nodeId={node.id}
      nodeMeta={config.meta}
      executionConfig={config.executionConfig}
      onExecutionConfigUpdate={(newExec) =>
        handleChange('executionConfig', newExec)
      }
      onMetaUpdate={handleChange}
      className="h-full! w-[550px]! border-l border-neutral-800 bg-neutral-950/95 p-0! backdrop-blur-xl"
    >
      <div className="flex h-full flex-col">
        {/* HEADER */}
        <div className="flex items-center justify-between border-b border-neutral-900 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-blue-500/10 p-2">
              <Globe className="h-4 w-4 text-blue-500" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-neutral-200">
                HTTP Request
              </h3>
              <p className="text-[10px] font-medium tracking-widest text-neutral-500 uppercase">
                Network Connector
              </p>
            </div>
          </div>
          <div className="h-8 w-8 text-neutral-500 hover:text-white"></div>
        </div>

        {/* CONTENT */}
        <div className="flex min-h-0 flex-1 flex-col space-y-6 px-4 py-4">
          {/* PRIMARY CONFIG (METHOD & URL) */}
          <section className="shrink-0 space-y-4">
            <div className="flex w-full flex-col gap-5">
              <div className="flex w-full flex-row items-start! justify-start gap-3">
                <FormField
                  label="Method"
                  type="select"
                  path="method"
                  className="w-full space-y-2 self-start!"
                  value={config.method}
                  onChange={handleChange}
                  options={HTTP_METHODS}
                />
              </div>
              <div className="col-span-3">
                <TemplateTextarea
                  label="Endpoint URL"
                  value={config.url}
                  variables={availableVariables}
                  onChange={(val) => handleChange('url', val)}
                  placeholder="https://api.example.com/v1"
                  className="min-h-[38px] border-neutral-800 bg-neutral-900/40"
                />
              </div>
            </div>
          </section>

          {/* SCROLLABLE CONFIG AREA */}
          <section className="flex min-h-0 flex-1 flex-col space-y-4">
            <div className="flex shrink-0 items-center gap-2 px-1">
              <Settings2 className="h-3 w-3 text-neutral-500" />
              <label className="text-[10px] font-bold tracking-widest text-neutral-500 uppercase">
                Parameters & Payloads
              </label>
            </div>

            <ScrollArea className="-mr-4 flex-1 pr-4">
              <div className="space-y-4 pb-8">
                {/* HEADERS COLLAPSIBLE */}
                <Collapsible
                  open={openSections.headers}
                  onOpenChange={() => toggleSection('headers')}
                  className="group overflow-hidden rounded-xl border border-neutral-800 bg-neutral-900/20 transition-all hover:border-neutral-700"
                >
                  <CollapsibleTrigger className="flex w-full items-center justify-between p-4 text-left transition-colors hover:bg-neutral-800/30">
                    <div className="flex items-center gap-4">
                      <div className="rounded-md border border-neutral-800 bg-neutral-950 p-1.5 text-neutral-600 transition-colors group-hover:text-blue-400">
                        <Key className="h-3 w-3" />
                      </div>
                      <div className="flex flex-col">
                        <span className="mb-1 font-mono text-[11px] leading-none text-neutral-300">
                          Request Headers
                        </span>
                        <span className="text-[9px] font-bold tracking-tighter text-neutral-500 uppercase">
                          {Object.keys(config.headers || {}).length} pairs
                          defined
                        </span>
                      </div>
                    </div>
                    <ChevronDown className="h-4 w-4 text-neutral-700 transition-transform group-data-[state=open]:rotate-180" />
                  </CollapsibleTrigger>
                  <CollapsibleContent className="animate-in slide-in-from-top-2 border-t border-neutral-800/50 bg-black/40 p-4 duration-200">
                    <HeadersEditor
                      headers={config.headers}
                      variables={availableVariables}
                      onChange={(headers) => handleChange('headers', headers)}
                    />
                  </CollapsibleContent>
                </Collapsible>

                {/* BODY COLLAPSIBLE */}
                {config.method !== 'GET' && (
                  <Collapsible
                    open={openSections.body}
                    onOpenChange={() => toggleSection('body')}
                    className="group overflow-hidden rounded-xl border border-neutral-800 bg-neutral-900/20 transition-all hover:border-neutral-700"
                  >
                    <CollapsibleTrigger className="flex w-full items-center justify-between p-4 text-left transition-colors hover:bg-neutral-800/30">
                      <div className="flex items-center gap-4">
                        <div className="rounded-md border border-neutral-800 bg-neutral-950 p-1.5 text-neutral-600 transition-colors group-hover:text-emerald-400">
                          <Database className="h-3 w-3" />
                        </div>
                        <div className="flex flex-col">
                          <span className="mb-1 font-mono text-[11px] leading-none text-neutral-300">
                            JSON Body
                          </span>
                          <span className="text-[9px] font-bold tracking-tighter text-neutral-500 uppercase">
                            Payload Configuration
                          </span>
                        </div>
                      </div>
                      <ChevronDown className="h-4 w-4 text-neutral-700 transition-transform group-data-[state=open]:rotate-180" />
                    </CollapsibleTrigger>
                    <CollapsibleContent className="animate-in slide-in-from-top-2 border-t border-neutral-800/50 bg-black/40 p-4 duration-200">
                      <HeadersEditor
                        headers={config.body}
                        variables={availableVariables}
                        onChange={(body) => handleChange('body', body)}
                      />
                    </CollapsibleContent>
                  </Collapsible>
                )}

                {/* ADVANCED SETTINGS PLACEHOLDER */}
                <div className="flex items-center justify-between rounded-xl border border-dashed border-neutral-800 p-4 opacity-50">
                  <div className="flex items-center gap-3">
                    <Activity className="h-3 w-3 text-neutral-500" />
                    <span className="text-[10px] font-bold text-neutral-500 uppercase">
                      Retry Policy
                    </span>
                  </div>
                  <span className="font-mono text-[9px] text-neutral-700 italic">
                    Coming Soon
                  </span>
                </div>
              </div>
            </ScrollArea>
          </section>
        </div>
      </div>
    </SheetWrapper>
  );
}

export const HttpRequestNodeConfigSheet = memo(HttpRequestConfigSheet);
