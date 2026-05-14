'use client';

import React, { useState, useMemo, useCallback } from 'react';
import { useWorkflowEditor } from '@/hooks/workflow/useWorkflowEditor';
import { ExecutionLogsViewer } from './ExecutionLogsViewer';
import { Activity, History } from 'lucide-react';
import ExecutionCard from '@/components/workflow/editor/executions/ExecutionCard';

export default function ExecutionHistoryPanel() {
  const {
    runtimeState,
    getExecutionLogs,
  } = useWorkflowEditor();

  const [selectedExecutionId, setSelectedExecutionId] = useState<string | null>(
    null
  );

  const sortedExecutions = useMemo(() => {
    const record = runtimeState.executions || {};
    return Object.values(record).sort(
      (a: any, b: any) =>
        new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime()
    );
  }, [runtimeState.executions]);

  const handleExecutionClick = useCallback(
    async (id: string) => {
      setSelectedExecutionId(id);
      await getExecutionLogs(id);
    },
    [runtimeState.logs, getExecutionLogs]
  );

  return (
    <div className="flex h-full flex-col p-4">
      {selectedExecutionId ? (
        <ExecutionLogsViewer
          executionId={selectedExecutionId}
          onBack={() => setSelectedExecutionId(null)}
        />
      ) : (
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <History className="h-3.5 w-3.5 text-neutral-500" />
            <span className="text-[10px] font-medium text-neutral-500 uppercase tracking-wider">
              Executions
            </span>
            <span className="text-[10px] text-neutral-600">
              {sortedExecutions.length}
            </span>
          </div>

          {sortedExecutions.length === 0 ? (
            <div className="flex flex-1 flex-col items-center justify-center py-16">
              <Activity className="mb-3 h-6 w-6 text-neutral-700" />
              <p className="text-xs text-neutral-500">No executions yet</p>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {sortedExecutions.map((execution) => (
                <ExecutionCard
                  key={execution.id}
                  execution={execution as any}
                  onClick={() => handleExecutionClick(execution.id)}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}