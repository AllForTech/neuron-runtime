export type ExecutionLogStatus =
    | "pending"
    | "running"
    | "success"
    | "error";

export interface ExecutionLog {
    id: string;

    executionId: string;

    nodeId: string;
    nodeType: string;
    nodeLabel: string;

    status: ExecutionLogStatus;

    input: unknown;
    output?: unknown | null;
    error?: string | null;

    startedAt: string;     // ISO string
    finishedAt?: string | null;

    durationMs?: number | null;

    order: number;

    createdAt: string;     // ISO string
}


export interface Execution<TResult = unknown> {
    id: string;

    workflowId: string;
    userId: string;

    workflowVersionId?: string | null;

    status: "pending" | "running" | "success" | "failed";

    startedAt: string;
    finishedAt?: string | null;

    result?: TResult | null;
}