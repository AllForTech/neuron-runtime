export type ExecutionSignal =
    | "success"
    | "error"
    | "timeout"
    | "retry_exhausted"
    | "manual";

export interface NormalizedExecutionPolicy {
    retryAttempts: number;
    retryDelayMs: number;
    retryStrategy: "fixed" | "exponential";

    timeoutMs?: number;

    continueOnError: boolean;
    fallbackNodeId?: string;
}