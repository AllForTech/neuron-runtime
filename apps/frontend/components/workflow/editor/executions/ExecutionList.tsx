"use client";

import React, { useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";
import ExecutionCard from "@/components/workflow/editor/executions/ExecutionCard";
import { ExecutionLogsViewer } from "./ExecutionLogsViewer";

interface ExecutionListProps {
    executions: any[]; // Replace with your 'executions' type
}

export function ExecutionList({ executions }: ExecutionListProps) {
    const [selectedExecutionId, setSelectedExecutionId] = useState<string | null>(null);

    // Sort by startedAt descending (most recent first)
    const sortedExecutions = [...executions].sort(
        (a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime()
    );

    if (selectedExecutionId) {
        return (
            <ExecutionLogsViewer
                executionId={selectedExecutionId}
                onBack={() => setSelectedExecutionId(null)}
            />
        );
    }

    return (
        <div className="flex flex-col gap-3 p-4">
            <div className="flex items-center justify-between mb-2">
                <p className="text-[10px] font-bold uppercase text-neutral-500 tracking-[0.2em]">
                    Run History
                </p>
                <span className="text-[10px] text-neutral-600 bg-neutral-900 px-2 py-1 rounded-md border border-neutral-800">
                    {executions.length} Total
                </span>
            </div>

            {sortedExecutions.map((execution) => (
                <ExecutionCard
                    key={execution.id}
                    execution={execution}
                    onClick={() => setSelectedExecutionId(execution.id)}
                />
            ))}
        </div>
    );
}