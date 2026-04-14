'use client';

import React, { memo, useState, useEffect, useMemo } from 'react';
import { Node } from 'reactflow';
import {
  Send,
  Hash,
  Globe,
  ShieldCheck,
  Code2,
  Activity,
  Zap,
  Database,
  Infinity,
  Layout,
} from 'lucide-react';

import { useWorkflowEditor } from '@/hooks/workflow/useWorkflowEditor';
import { WorkflowEditorActionType } from '@/constants';
import { SheetWrapper } from '@/components/workflow/editor/SheetWrapper';
import { getAvailableUpstreamNodes } from '@/lib/utils';
import { TemplateTextarea } from '@/components/workflow/editor/TemplateTextarea';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { cn } from '@/lib/utils';
import { RespondNodeConfig } from '@neuron/shared';

function RespondConfigSheet({
  node,
  open,
  onOpen,
}: {
  node: Node;
  open: boolean;
  onOpen: (open: boolean) => void;
}) {
  const { workflowEditorDispatch, editorState } = useWorkflowEditor();
  const { nodes, edges } = editorState.graph;

  // 1. Detect presence of Context Node
  const hasContextNode = useMemo(
    () => Object.values(nodes).some((n) => n.type === 'contextNode'),
    [nodes]
  );

  // 2. Initialize local state from node data
  const [config, setConfig] = useState<RespondNodeConfig>({
    statusCode: node.data?.statusCode ?? 200,
    headers: node.data?.headers ?? { 'Content-Type': 'application/json' },
    body: node.data?.body ?? '',
    attachContext: node.data?.attachContext ?? false,
    options: {
      minify: false,
      includeTraceId: true,
      errorOnEmpty: false,
      ...node.data?.options,
    },
    ...node.data,
  });

  const availableVariables = getAvailableUpstreamNodes(node.id, {
    nodes,
    edges,
  });

  // 3. Debounced sync to global workflow state
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

  const handleOptionChange = (key: string, value: any) => {
    setConfig((prev) => ({
      ...prev,
      options: { ...prev.options, [key]: value },
    }));
  };

  return (
    <SheetWrapper
      open={open}
      onOpenChange={onOpen}
      nodeMeta={config?.meta}
      onMetaUpdate={handleChange}
      title="Terminal Response"
      showContextSettings={false}
      executionConfig={config.executionConfig}
      onExecutionConfigUpdate={(newExec) =>
        handleChange('executionConfig', newExec)
      }
      className="w-[550px]! border-l border-neutral-900 bg-neutral-950/95 p-0! backdrop-blur-3xl"
    >
      <div className="flex h-full flex-col overflow-hidden">
        {/* STATUS SUB-HEADER */}
        <div className="flex items-center justify-between border-b border-neutral-800/40 bg-neutral-900/20 px-6 py-3">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Send className="h-3.5 w-3.5 text-neutral-400" />
              <span className="font-mono text-[10px] tracking-widest text-neutral-500 uppercase">
                Network Sink // Terminal
              </span>
            </div>
          </div>
          <Badge
            variant="outline"
            className="border-neutral-800 bg-transparent text-[9px] tracking-tighter text-neutral-400 uppercase"
          >
            HTTP_FINALIZER
          </Badge>
        </div>

        <ScrollArea className="flex-1">
          <div className="space-y-8 p-6 px-3!">
            {/* SECTION: CONTEXT INTEGRATION LAYER */}
            {hasContextNode && (
              <div
                onClick={() =>
                  handleChange('attachContext', !config.attachContext)
                }
                className={cn(
                  'relative w-full cursor-pointer overflow-hidden rounded-2xl border p-5 transition-all duration-500',
                  config.attachContext
                    ? 'border-emerald-500/30 bg-emerald-500/[0.02] shadow-[0_0_25px_-12px_rgba(16,185,129,0.15)]'
                    : 'border-neutral-800 bg-neutral-900/40'
                )}
              >
                <div className="relative z-10 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div
                      className={cn(
                        'rounded-xl border p-2.5 transition-colors duration-300',
                        config.attachContext
                          ? 'border-emerald-500/20 bg-emerald-500/10'
                          : 'border-neutral-800 bg-neutral-950'
                      )}
                    >
                      <Database
                        className={cn(
                          'h-4 w-4',
                          config.attachContext
                            ? 'text-emerald-400'
                            : 'text-neutral-500'
                        )}
                      />
                    </div>
                    <div className="flex flex-col gap-0.5">
                      <span className="text-[11px] font-bold tracking-[0.15em] text-white uppercase">
                        Context-Aware Mapping
                      </span>
                      <span className="text-[9px] font-medium text-neutral-500">
                        AUTOMATICALLY ATTACH WORKFLOW CONTEXT DATA INTO RESPONSE
                      </span>
                    </div>
                  </div>
                  <Switch
                    checked={config.attachContext}
                    onCheckedChange={(val) =>
                      handleChange('attachContext', val)
                    }
                    className="shadow-sm data-[state=checked]:bg-emerald-500"
                  />
                </div>

                {config.attachContext && (
                  <div className="animate-in fade-in slide-in-from-top-2 mt-4 border-t border-emerald-500/10 pt-4 duration-500">
                    <div className="flex items-center gap-2 text-emerald-500/70">
                      <Infinity className="h-3 w-3" />
                      <p className="font-mono text-[9px] tracking-tighter uppercase">
                        Registry Linked: Resolving all dynamic pointers in
                        runtime
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* SECTION 1: PROTOCOL DEFINITION */}
            <div className="space-y-4">
              <div className="mb-2 flex items-center gap-2">
                <div className="rounded-md border border-white/10 bg-white/5 p-1.5">
                  <Globe className="h-3.5 w-3.5 text-white" />
                </div>
                <h4 className="text-[11px] font-bold tracking-widest text-white uppercase">
                  Protocol
                </h4>
              </div>

              <div className="grid grid-cols-1 gap-4 rounded-xl border border-neutral-800/50 bg-neutral-900/20 p-4">
                <div className="space-y-2">
                  <label className="ml-1 flex items-center gap-2 text-[9px] font-bold tracking-widest text-neutral-500 uppercase">
                    <Hash className="h-3 w-3" /> Status Code
                  </label>
                  <Input
                    type="text"
                    value={config.statusCode}
                    onChange={(e) => handleChange('statusCode', e.target.value)}
                    className="h-10 rounded-xl border-neutral-800 bg-neutral-950 font-mono text-[11px] text-white focus:border-white/20"
                    placeholder="200"
                  />
                </div>
              </div>
            </div>

            {/* SECTION 2: PAYLOAD ORCHESTRATION */}
            <div className="space-y-4 pt-2">
              <div className="mb-2 flex items-center gap-2">
                <div className="rounded-md border border-white/10 bg-white/5 p-1.5">
                  <Code2 className="h-3.5 w-3.5 text-white" />
                </div>
                <h4 className="text-[11px] font-bold tracking-widest text-white uppercase">
                  Data Payload
                </h4>
              </div>

              <div className="space-y-4 rounded-3xl border border-neutral-800/50 bg-neutral-900/20 p-5">
                <div className="space-y-3">
                  <div className="flex items-center justify-between px-1">
                    <label className="text-[9px] font-bold tracking-widest text-neutral-500 uppercase">
                      JSON Template
                    </label>
                    <Badge
                      variant="outline"
                      className="border-neutral-800 text-[8px] tracking-tighter text-neutral-600"
                    >
                      REACTIVE_ENGINE_V1
                    </Badge>
                  </div>
                  <TemplateTextarea
                    value={config.body as string}
                    onChange={(val) => handleChange('body', val)}
                    variables={availableVariables}
                    placeholder='{ "status": "resolved", "data": {{node.output}} }'
                    className="min-h-[180px] rounded-2xl border-neutral-800 bg-neutral-950 p-4 font-mono text-[11px] leading-relaxed text-white focus:border-white/20"
                  />
                </div>
              </div>
            </div>

            {/* SECTION 3: ADVANCED HEADERS & ENGINE OPTIONS */}
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="headers" className="border-neutral-900">
                <AccordionTrigger className="group py-4 hover:no-underline">
                  <div className="flex items-center gap-2 transition-transform duration-300 group-hover:translate-x-1">
                    <Layout className="h-3.5 w-3.5 text-neutral-500" />
                    <span className="text-[10px] font-bold tracking-widest text-neutral-400 uppercase">
                      Response Headers
                    </span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="space-y-4 pb-4">
                  <div className="space-y-2 rounded-xl border border-neutral-800 bg-neutral-900/20 p-4">
                    <div className="grid grid-cols-2 gap-3">
                      <Input
                        className="h-9 rounded-lg border-neutral-800 bg-neutral-950 font-mono text-[10px] text-neutral-500"
                        value="Content-Type"
                        disabled
                      />
                      <Input
                        className="h-9 rounded-lg border-neutral-800 bg-neutral-950 font-mono text-[10px] text-neutral-500"
                        value="application/json"
                        disabled
                      />
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="options" className="border-neutral-900">
                <AccordionTrigger className="group py-4 hover:no-underline">
                  <div className="flex items-center gap-2 transition-transform duration-300 group-hover:translate-x-1">
                    <Activity className="h-3.5 w-3.5 text-neutral-500" />
                    <span className="text-[10px] font-bold tracking-widest text-neutral-400 uppercase">
                      Engine Directives
                    </span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="grid grid-cols-1 gap-3 pb-4">
                  <div className="flex items-center justify-between rounded-xl border border-neutral-800 bg-neutral-900/20 p-4">
                    <div className="space-y-0.5">
                      <p className="text-[11px] font-bold text-white uppercase">
                        Minify Payload
                      </p>
                      <p className="font-mono text-[9px] text-neutral-500">
                        OPTIMIZE_DATA_SIZE
                      </p>
                    </div>
                    <Switch
                      checked={config.options.minify}
                      onCheckedChange={(val) =>
                        handleOptionChange('minify', val)
                      }
                      className="data-[state=checked]:bg-white data-[state=checked]:[&>span]:bg-black"
                    />
                  </div>
                  <div className="flex items-center justify-between rounded-xl border border-neutral-800 bg-neutral-900/20 p-4">
                    <div className="space-y-0.5">
                      <p className="text-[11px] font-bold text-white uppercase">
                        Inject Trace ID
                      </p>
                      <p className="font-mono text-[9px] text-neutral-500">
                        APPEND_DEBUG_HEADER
                      </p>
                    </div>
                    <Switch
                      checked={config.options.includeTraceId}
                      onCheckedChange={(val) =>
                        handleOptionChange('includeTraceId', val)
                      }
                      className="data-[state=checked]:bg-white data-[state=checked]:[&>span]:bg-black"
                    />
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>

            {/* HELPER FOOTER BOX */}
            <div className="flex gap-5 rounded-3xl border border-white/5 bg-white/[0.02] p-6">
              <div className="h-fit rounded-2xl border border-white/10 bg-white/5 p-2.5">
                <ShieldCheck className="h-4 w-4 text-white" />
              </div>
              <div className="space-y-1.5">
                <p className="text-[11px] font-bold tracking-tight text-white uppercase">
                  Security Protocol
                </p>
                <p className="text-[10px] leading-relaxed text-neutral-500">
                  This node marks the absolute termination of the thread.
                  Downstream connections are nullified. Ensure status codes
                  align with external trigger contracts.
                </p>
              </div>
            </div>
          </div>
        </ScrollArea>

        {/* BOTTOM ACTION BUTTONS */}
        <div className="flex items-center justify-between border-t border-neutral-900 bg-neutral-950/50 p-6">
          <button
            onClick={() => handleChange('body', '')}
            className="text-[10px] font-bold tracking-widest text-neutral-600 uppercase transition-colors hover:text-white"
          >
            Reset Schema
          </button>
          <div className="flex items-center gap-5">
            <div className="hidden flex-col items-end sm:flex">
              <span className="text-[9px] font-bold tracking-tighter text-neutral-500 uppercase italic">
                Engine Status
              </span>
              <span className="text-[9px] font-black tracking-tighter text-white uppercase">
                Ready
              </span>
            </div>
            <button className="flex h-11 items-center gap-2 rounded-full bg-white px-6 text-[11px] font-black tracking-widest text-black uppercase shadow-[0_0_20px_rgba(255,255,255,0.1)] transition-all hover:bg-neutral-200 active:scale-95">
              <Zap className="h-3.5 w-3.5 fill-black" /> Deploy Respond
            </button>
          </div>
        </div>
      </div>
    </SheetWrapper>
  );
}

export const RespondNodeConfigSheet = memo(RespondConfigSheet);
