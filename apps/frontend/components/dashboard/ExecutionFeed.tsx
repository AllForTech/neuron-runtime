// components/dashboard/execution-feed.tsx

import ExecutionCard from '@/components/workflow/editor/executions/ExecutionCard';
import { ExecutionLog } from '@/types';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';

export function ExecutionFeed({
  executions,
  loading,
  currentExecId,
  logs,
  onClick,
}: {
  executions: any[];
  loading: boolean;
  logs: boolean;
  currentExecId?: string;
  onClick: (executionId: string) => Promise<Record<string, ExecutionLog>>;
}) {
  return (
    <div
      className={cn(
        'transition-200 h-full overflow-hidden rounded-2xl border border-white/10 bg-black! p-5 px-3.5! md:h-[560px]! md:min-w-1/2',
        !logs && 'w-full'
      )}
    >
      <div className="mb-6 flex items-center justify-between">
        <h3 className="text-[10px] font-bold tracking-[0.3em] text-neutral-500 uppercase">
          Live Execution Stream
        </h3>
        {loading && (
          <div className="flex items-center gap-2">
            <div className="bg-primary h-1 w-1 animate-ping rounded-full" />
            <span className="font-mono text-[9px] text-neutral-600">
              syncing
            </span>
          </div>
        )}
      </div>

      <ScrollArea className={'center h-full w-full pr-3 pb-7!'}>
        <div className="space-y-3">
          {loading ? (
            // Show 5 skeletons while initial loading
            <>
              <ExecutionSkeleton />
              <ExecutionSkeleton />
              <ExecutionSkeleton />
              <ExecutionSkeleton />
              <ExecutionSkeleton />
              <ExecutionSkeleton />
              <ExecutionSkeleton />
            </>
          ) : executions.length > 0 ? (
            executions.map((exec) => (
              <ExecutionCard
                key={exec.id}
                currentExecId={currentExecId}
                execution={exec}
                onClick={() => onClick(exec.id)}
              />
            ))
          ) : (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-white/5 py-20">
              <p className="text-[11px] tracking-widest text-neutral-600 uppercase">
                No Active Telemetry
              </p>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}

export function ExecutionSkeleton() {
  return (
    <div className="flex animate-pulse items-center justify-between rounded-xl border border-white/[0.03] bg-white/[0.01] p-4">
      <div className="flex flex-1 items-center gap-4">
        {/* Status Icon Placeholder */}
        <div className="h-8 w-8 rounded-lg bg-white/5" />

        <div className="flex-1 space-y-2">
          {/* Execution Name Placeholder */}
          <div className="h-3 w-32 rounded-full bg-white/10" />
          {/* Timestamp Placeholder */}
          <div className="h-2 w-20 rounded-full bg-white/5" />
        </div>
      </div>

      {/* Duration / Action Placeholder */}
      <div className="h-4 w-12 rounded-md bg-white/5" />
    </div>
  );
}
