'use client';

import { memo, useMemo } from 'react';
import { Activity, ArrowLeft, Calendar, Timer, Hash, CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useWorkflowEditor } from '@/hooks/workflow/useWorkflowEditor';
import { LogTimeline } from '@/components/workflow/editor/executions/LogsTimeline';
import { ExecutionLoadingSkeleton } from '@/components/workflow/editor/executions/ExecutionLoadingSkeleton';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

function ExecutionLogs({
  executionId,
  onBack,
}: {
  executionId: string;
  onBack: () => void;
}) {
  const { workflowEditorDispatch, runtimeState, isLogsLoading } =
    useWorkflowEditor();

  const execution = useMemo(
    () => runtimeState.executions[executionId],
    [runtimeState.executions, workflowEditorDispatch]
  );

  const isSuccess = execution?.status === 'success';
  const StatusIcon =
    execution?.status === 'running'
      ? Loader2
      : isSuccess
        ? CheckCircle2
        : XCircle;

  const timestamp = useMemo(() => {
    try {
      if (!execution?.startedAt) return '---';
      const date = new Date(execution.startedAt);
      if (isNaN(date.getTime())) return 'Invalid Date';
      return format(date, 'MMM d, HH:mm');
    } catch (e) {
      return 'Error';
    }
  }, [execution]);

  return isLogsLoading ? (
    <ExecutionLoadingSkeleton />
  ) : (
    <div className="flex h-full flex-col overflow-hidden">
      {/* Header */}
      <div className="mb-4 rounded-xl border border-white/5 bg-white/[0.02] p-4">
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className="rounded-lg border border-white/10 bg-white/5 p-2 transition-all hover:bg-white/10"
          >
            <ArrowLeft className="h-3.5 w-3.5 text-neutral-400" />
          </button>
          <div className="flex-1">
            <p className="text-[10px] font-medium text-neutral-500 uppercase tracking-wider">
              Execution
            </p>
            <h2 className="text-sm font-medium text-primary">
              {execution?.id?.slice(0, 8).toUpperCase() || 'Unknown'}
            </h2>
          </div>
          <div
            className={cn(
              'flex items-center gap-2 rounded-full border px-3 py-1.5',
              isSuccess
                ? 'border-emerald-500/20 bg-emerald-500/5 text-emerald-400'
                : 'border-red-500/20 bg-red-500/5 text-red-400'
            )}
          >
            <StatusIcon
              className={cn(
                'h-3.5 w-3.5',
                execution?.status === 'running' && 'animate-spin'
              )}
            />
            <span className="text-xs font-medium capitalize">
              {execution?.status}
            </span>
          </div>
        </div>

        <div className="mt-4 flex gap-6">
          <div className="flex items-center gap-2">
            <Calendar className="h-3 w-3 text-neutral-600" />
            <span className="text-[10px] text-neutral-500">{timestamp}</span>
          </div>
          <div className="flex items-center gap-2">
            <Timer className="h-3 w-3 text-neutral-600" />
            <span className="text-[10px] text-neutral-500">
              {(execution as any)?.durationMs || 0}ms
            </span>
          </div>
        </div>
      </div>

      {/* Timeline */}
      <div className="flex-1 overflow-hidden">
        <ScrollArea className="h-full">
          <div className="pb-4">
            <LogTimeline logs={runtimeState.logs as any} />
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}

export const ExecutionLogsViewer = memo(ExecutionLogs);