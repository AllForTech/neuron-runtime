import { BaseNodeConfig } from "@neuron/shared";
import { NormalizedExecutionPolicy } from "@neuron/shared";

export function normalizeExecutionPolicy(config?: BaseNodeConfig): NormalizedExecutionPolicy {
    const exec = config?.executionConfig;

    return {
        retryAttempts: exec?.retry?.enabled ? exec.retry.maxAttempts : 1,
        retryDelayMs: exec?.retry?.delayMs ?? 0,
        retryStrategy: exec?.retry?.strategy ?? "fixed",

        timeoutMs: exec?.timeout?.enabled ? exec.timeout.durationMs : undefined,

        continueOnError: exec?.errorHandling?.continueOnError ?? false,
        fallbackNodeId: exec?.errorHandling?.fallbackNodeId,
    };
}