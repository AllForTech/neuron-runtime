export type ExecutionSignal =
    | "success"
    | "error"
    | "timeout"
    | "retry_exhausted"
    | "manual";

export interface NormalizedExecutionPolicy {
    retryEnabled: boolean;
    retryAttempts: number;
    retryDelayMs: number;
    retryStrategy: "fixed" | "exponential";

    timeoutEnabled: boolean;
    timeoutMs?: number;

    runAsynchronously: boolean;

    continueOnError: boolean;
    fallbackNodeId?: string;
}