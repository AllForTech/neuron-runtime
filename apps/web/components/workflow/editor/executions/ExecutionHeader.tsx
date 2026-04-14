import {
  ArrowLeft,
  Calendar,
  Timer,
  Hash,
  CheckCircle2,
  XCircle,
  Loader2,
} from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { useMemo } from 'react';

export function ExecutionHeader({
  execution,
  onBack,
}: {
  execution: any;
  onBack: () => void;
}) {
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
      // Check if the date is actually valid (NaN check)
      if (isNaN(date.getTime())) return 'Invalid Date';
      return format(date, 'MMM d, HH:mm:ss');
    } catch (e) {
      return 'Error';
    }
  }, [execution]);

  return (
    <div className="mb-8 rounded-2xl border border-neutral-800 bg-neutral-900/50 p-6">
      <div className="mb-8 flex items-center gap-5">
        <button
          onClick={onBack}
          className="group rounded-full border border-white/10 bg-white/5 p-3 transition-all hover:bg-white/10"
        >
          <ArrowLeft className="h-4 w-4 text-neutral-400 group-hover:text-white" />
        </button>
        <div className="flex-1">
          <p className="mb-1 text-[10px] font-bold tracking-[0.3em] text-neutral-500 uppercase">
            Sequence Report
          </p>
          <h2 className="text-xl font-semibold tracking-tight text-white">
            Run {execution?.id.slice(0, 8).toUpperCase()}
          </h2>
        </div>
        <div
          className={cn(
            'flex items-center gap-2 rounded-full border px-4 py-2',
            isSuccess
              ? 'border-emerald-500/20 bg-emerald-500/5 text-emerald-400'
              : 'border-red-500/20 bg-red-500/5 text-red-400'
          )}
        >
          <StatusIcon
            className={cn(
              'h-4 w-4',
              execution?.status === 'running' && 'animate-spin'
            )}
          />
          <span className="text-sm font-medium capitalize">
            {execution?.status}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-8">
        <Stat icon={Calendar} label="Timestamp" value={timestamp} />
        <Stat
          icon={Timer}
          label="Duration"
          value={`${execution?.durationMs || 0}ms`}
        />
        <Stat
          icon={Hash}
          label="Version"
          value={execution?.workflowVersionId?.slice(0, 8) || 'Direct Run'}
        />
      </div>
    </div>
  );
}

function Stat({
  icon: Icon,
  label,
  value,
}: {
  icon: any;
  label: string;
  value: string;
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 text-neutral-500">
        <Icon className="h-3.5 w-3.5" />
        <span className="text-[10px] leading-none font-bold tracking-widest uppercase">
          {label}
        </span>
      </div>
      <p className="text-sm font-medium text-white">{value}</p>
    </div>
  );
}
