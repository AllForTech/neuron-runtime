'use client';

import { cn } from '@/lib/utils';
import {
  Zap,
  Search,
  FileCode2,
  Package,
  Mail,
  Workflow,
  Activity,
  Clock,
  CheckCircle2,
  XCircle,
} from 'lucide-react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { ExecutionDataInspector } from './ExecutionDataInspector';
import { memo, useMemo } from 'react';
import { ExecutionLog } from '@neuron/db';
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

  if (formatedLogs.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <Activity className="mb-3 h-6 w-6 text-neutral-700" />
        <p className="text-xs text-neutral-500">No logs available</p>
      </div>
    );
  }

  return (
    <div className="w-full space-y-3">
      <div className="flex items-center gap-2 px-1">
        <Activity className="h-3.5 w-3.5 text-neutral-500" />
        <span className="text-[10px] font-medium text-neutral-500 uppercase tracking-wider">
          {title ?? 'Steps'}
        </span>
        <span className="text-[10px] text-neutral-600">
          {formatedLogs.length}
        </span>
      </div>

      <Accordion type="single" collapsible className="space-y-2">
        {formatedLogs.map((log) => {
          const NodeIcon = nodeIconMap[log.nodeType] || Workflow;
          const isError = log.status === 'error';

          return (
            <AccordionItem
              key={log.id ?? nanoid()}
              value={log.id}
              className="rounded-lg border border-white/5 bg-white/[0.02] transition-all data-[state=open]:bg-white/[0.04]"
            >
              <AccordionTrigger className="group px-3 py-2.5 hover:no-underline">
                <div className="flex w-full items-center gap-3 text-left">
                  <div className="relative shrink-0">
                    <div className="rounded-md border border-white/5 bg-neutral-900/50 p-1.5">
                      <NodeIcon className="h-3.5 w-3.5 text-primary" />
                    </div>
                    <div
                      className={cn(
                        'absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full border border-neutral-950',
                        isError ? 'bg-red-500' : 'bg-emerald-500'
                      )}
                    />
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="text-[9px] font-medium text-neutral-600 uppercase">
                      {log.nodeType}
                    </p>
                    <p className="truncate text-xs font-medium text-primary">
                      {log.nodeLabel}
                    </p>
                  </div>

                  <div className="flex items-center gap-1.5 text-neutral-600">
                    <Clock className="h-3 w-3" />
                    <span className="text-[10px]">
                      {log.durationMs}ms
                    </span>
                  </div>
                </div>
              </AccordionTrigger>

              <AccordionContent className="border-t border-white/5 bg-white/[0.02] px-3 pb-3">
                <div className="pt-3">
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