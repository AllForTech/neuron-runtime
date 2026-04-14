'use client';

import { cn } from '@/lib/utils';
import {
  ChevronRight,
  Zap,
  Search,
  FileCode2,
  Package,
  Mail,
  Workflow,
  Activity,
  Clock,
} from 'lucide-react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { ExecutionDataInspector } from './ExecutionDataInspector';
import { memo, useMemo } from 'react';
import { ExecutionLog } from '@/types';
import { nanoid } from 'nanoid';

const nodeIconMap: Record<string, any> = {
  webhook: Zap,
  filter: Search,
  http_request: FileCode2,
  function: Package,
  send_email: Mail,
};

function Logs({
  logs,
  title,
}: {
  logs: Record<string, ExecutionLog>;
  title?: string;
}) {
  const formatedLogs = useMemo(() => {
    return Object.values(logs);
  }, [logs]);

  return (
    <div className="w-full space-y-4 rounded-xl border border-neutral-800/80 bg-black p-4">
      <header className="mb-6 flex items-center gap-2 px-1">
        <Activity className="h-3.5 w-3.5 text-neutral-500" />
        <span className="text-[10px] font-bold tracking-[0.2em] text-neutral-500 uppercase">
          {title ?? 'Sequence Telemetry'}
        </span>
      </header>

      <Accordion type="single" collapsible className="space-y-3">
        {formatedLogs.map((log) => {
          const NodeIcon = nodeIconMap[log.nodeType] || Workflow;
          const isError = log.status === 'error';

          return (
            <AccordionItem
              key={log.id ?? nanoid()}
              value={log.id}
              className="overflow-hidden rounded-xl border border-neutral-800 bg-neutral-900/40 px-0 transition-all data-[state=open]:border-white/20 data-[state=open]:bg-white/[0.02]"
            >
              <AccordionTrigger className="group px-4 py-4 transition-all hover:no-underline">
                <div className="flex w-full items-center gap-4 text-left">
                  {/* Icon with Status Indicator */}
                  <div className="relative shrink-0">
                    <div className="rounded-lg border border-white/5 bg-neutral-950 p-2.5 transition-colors group-hover:border-white/10">
                      <NodeIcon className="h-4 w-4 text-white" />
                    </div>
                    <div
                      className={cn(
                        'absolute -top-1 -right-3! h-2.5 w-2.5 rounded-full border-2 border-neutral-900',
                        isError ? 'bg-red-500' : 'bg-emerald-500'
                      )}
                    />
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="mb-0.5 text-[9px] font-bold tracking-widest text-neutral-500 uppercase opacity-70">
                      {log.nodeType}
                    </p>
                    <h4 className="truncate text-sm font-medium tracking-tight text-white">
                      {log.nodeLabel}
                    </h4>
                  </div>

                  <div className="mr-2 flex shrink-0 items-center gap-3">
                    <div className="flex items-center gap-1.5 text-neutral-600">
                      <Clock className="h-3 w-3" />
                      <span className="font-mono text-[10px]">
                        {log.durationMs}ms
                      </span>
                    </div>
                  </div>
                </div>
              </AccordionTrigger>

              <AccordionContent className="border-t border-neutral-800/50 bg-neutral-950/40 px-4 pb-4">
                <div className="animate-in fade-in slide-in-from-top-2 max-w-[700px] pt-5 duration-300">
                  <ExecutionDataInspector selectedLog={log} />
                </div>
              </AccordionContent>
            </AccordionItem>
          );
        })}
      </Accordion>
    </div>
  );
}

export const LogTimeline = memo(Logs);
