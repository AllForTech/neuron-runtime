"use client";

import {
  CheckCircle2,
  CircleDashed,
  Clock,
  XCircle,
  ChevronRight,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import { Execution } from '@neuron/db';

function ExecutionCard({
  execution,
  onClick,
  currentExecId = '',
}: {
  execution: Execution;
  onClick: () => void;
  currentExecId?: string;
}) {
  const statusConfig = {
    success: {
      icon: CheckCircle2,
      color: 'text-emerald-500',
      bg: 'bg-emerald-500/10',
    },
    failed: { icon: XCircle, color: 'text-red-500', bg: 'bg-red-500/10' },
    running: {
      icon: CircleDashed,
      color: 'text-blue-400',
      bg: 'bg-blue-400/10',
    },
    pending: {
      icon: Clock,
      color: 'text-neutral-500',
      bg: 'bg-neutral-500/10',
    },
  };

  const config =
    statusConfig[execution.status as keyof typeof statusConfig] ||
    statusConfig.pending;
  const Icon = config.icon;

  return (
    <button
      onClick={onClick}
      className={cn(
        'group flex w-full items-center justify-between rounded-lg border border-white/5 bg-white/[0.02] p-3 text-left transition-all hover:bg-white/[0.04] hover:border-white/10',
        currentExecId === execution.id && 'border-white/10 bg-white/[0.04]'
      )}
    >
      <div className="flex items-center gap-3">
        <div className={cn('rounded-lg border border-white/5 p-2', config.bg)}>
          <Icon className={cn('h-3.5 w-3.5', config.color)} />
        </div>
        <div>
          <p className="text-xs font-medium text-primary">
            #{execution.id.slice(0, 8)}
          </p>
          <p className="text-[10px] text-neutral-500">
            {formatDistanceToNow(new Date(execution.startedAt), {
              addSuffix: true,
            })}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {execution.finishedAt && (
          <span className="text-[10px] text-neutral-600">
            {Math.round(
              (new Date(execution.finishedAt).getTime() -
                new Date(execution.startedAt).getTime()) /
                1000
            )}
            s
          </span>
        )}
        <ChevronRight className="h-3.5 w-3.5 text-neutral-600 transition-colors group-hover:text-neutral-400" />
      </div>
    </button>
  );
}

export default ExecutionCard;