'use client';

import React, { useState } from 'react';
import {
  Activity,
  Minimize2,
  Database,
  AlertCircle,
  Terminal,
  Cpu,
  Box,
  ChevronDown,
  ChevronRight,
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { Button } from '@/components/ui/button';
import { JsonRenderer } from '@/components/JsonRenederer';
import { useWorkflowEditor } from '@/hooks/workflow/useWorkflowEditor';
import { cn } from '@/lib/utils';

interface ExecutionTraceProps {
  className?: string;
  nodeNames?: Record<string, string>;
}

export default function ExecutionTrace({
  className,
  nodeNames = {},
}: ExecutionTraceProps) {
  const {
    editorState: {
      runtime: { nodeOutputs, nodeErrors },
    },
  } = useWorkflowEditor();
  const [openStates, setOpenStates] = useState<Record<string, boolean>>({});

  if (!nodeOutputs && !nodeErrors) return;

  const toggleAll = (ids: string[], open: boolean) => {
    const newState = ids.reduce((acc, id) => ({ ...acc, [id]: open }), {});
    setOpenStates(newState);
  };

    return (
        <div className={cn("flex h-full flex-col bg-transparent", className)}>
            <Tabs defaultValue="outputs" className="flex h-full flex-col">
                {/* Header with Sub-Navigation */}
                <div className="flex flex-col gap-4 border-b border-white/[0.05] p-4">
                    <div className="flex items-center justify-between">
                        <TabsList className="h-8 border border-white/[0.05] bg-neutral-900/50 p-1">
                            <TabsTrigger
                                value="outputs"
                                className="px-3 text-[10px] font-bold uppercase data-[state=active]:bg-white/[0.05] data-[state=active]:text-blue-400"
                            >
                                <Database className="mr-2 h-3 w-3" /> Outputs
                            </TabsTrigger>
                            <TabsTrigger
                                value="errors"
                                className="px-3 text-[10px] font-bold uppercase data-[state=active]:bg-white/[0.05] data-[state=active]:text-red-400"
                            >
                                <AlertCircle className="mr-2 h-3 w-3" /> Errors
                            </TabsTrigger>
                        </TabsList>

                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleAll([...Object.keys(nodeOutputs || {}), ...Object.keys(nodeErrors || {})], false)}
                            className="h-7 px-2 text-[9px] font-bold text-neutral-500 uppercase hover:text-white"
                        >
                            <Minimize2 className="mr-2 h-3 w-3" />
                            Collapse
                        </Button>
                    </div>
                </div>

                {/* Content Area */}
                <div className="flex-1 overflow-y-auto p-4">
                    <TabsContent value="outputs" className="m-0 focus-visible:ring-0">
                        <TraceList
                            dataMap={nodeOutputs || {}}
                            type="output"
                            nodeNames={nodeNames}
                            openStates={openStates}
                            setOpenStates={setOpenStates}
                            emptyMessage="No outputs generated"
                        />
                    </TabsContent>

                    <TabsContent value="errors" className="m-0 focus-visible:ring-0">
                        <TraceList
                            dataMap={nodeErrors || {}}
                            type="error"
                            nodeNames={nodeNames}
                            openStates={openStates}
                            setOpenStates={setOpenStates}
                            emptyMessage="No execution errors"
                        />
                    </TabsContent>
                </div>
            </Tabs>
        </div>
    );
}

// Reusable Trace List Component to easily add more tabs later
const TraceList = ({
  dataMap,
  emptyMessage,
  openStates,
  setOpenStates,
  type,
  nodeNames,
}: {
  dataMap: Record<string, any>;
  openStates: Record<string, boolean>;
  setOpenStates: (state: any) => void;
  emptyMessage: string;
  type: 'output' | 'error';
  nodeNames: Record<string, string>;
}) => {
  const ids = Object.keys(dataMap);
  if (ids.length === 0)
    return (
      <div className="m-4 flex h-64 flex-col items-center justify-center rounded-lg border border-dashed border-neutral-800 text-neutral-600">
        <p className="text-[10px] font-bold tracking-widest uppercase">
          {emptyMessage}
        </p>
      </div>
    );

  return (
    <div className="space-y-3 pb-10">
      {ids.map((id) => {
        const isOpen = openStates[id] ?? false;
        const data = dataMap[id];
        const isError = type === 'error';

        return (
          <Collapsible
            key={id}
            open={isOpen}
            onOpenChange={(val) =>
              setOpenStates((prev) => ({ ...prev, [id]: val }))
            }
            className={cn(
              'group overflow-hidden rounded-lg border bg-neutral-900/40 transition-all duration-200',
              isError
                ? 'border-red-900/30 hover:border-red-800/50'
                : 'border-neutral-800 hover:border-neutral-700'
            )}
          >
            <CollapsibleTrigger className="flex w-full items-center justify-between p-3 text-left transition-colors hover:bg-neutral-800/50">
              <div className="flex items-center gap-3">
                <div
                  className={cn(
                    'rounded-md border bg-neutral-950 p-1.5 transition-colors',
                    isOpen
                      ? isError
                        ? 'border-red-900/50 text-red-400'
                        : 'border-neutral-700 text-blue-400'
                      : 'border-neutral-800 text-neutral-500'
                  )}
                >
                  {isError ? (
                    <AlertCircle className="h-3.5 w-3.5" />
                  ) : typeof data === 'boolean' ? (
                    <Terminal className="h-3.5 w-3.5" />
                  ) : data?.content ? (
                    <Cpu className="h-3.5 w-3.5" />
                  ) : (
                    <Box className="h-3.5 w-3.5" />
                  )}
                </div>
                <div>
                  <p className="font-mono text-[11px] text-neutral-300">
                    {nodeNames[id] || id.split('-')[0]}
                  </p>
                  <p className="text-[9px] font-bold tracking-tight text-neutral-600 uppercase">
                    {isError
                      ? 'Execution Failed'
                      : typeof data === 'object'
                        ? 'Structured Object'
                        : 'Primitive Value'}
                  </p>
                </div>
              </div>
              {isOpen ? (
                <ChevronDown className="h-3.5 w-3.5 text-neutral-600" />
              ) : (
                <ChevronRight className="h-3.5 w-3.5 text-neutral-600" />
              )}
            </CollapsibleTrigger>

            <CollapsibleContent className="border-t border-neutral-800/50">
              <div className="bg-black/20 p-2">
                <JsonRenderer
                  data={data}
                  title={isError ? 'Error Details' : 'Raw Output'}
                  maxHeight="max-h-[300px]"
                  className="border-none shadow-none"
                />
              </div>
            </CollapsibleContent>
          </Collapsible>
        );
      })}
    </div>
  );
};
