import { BaseNodeConfig } from "@neuron/shared";
import { NormalizedExecutionPolicy } from "@neuron/shared";

export function normalizeExecutionPolicy(config?: BaseNodeConfig): NormalizedExecutionPolicy {
    const exec = config?.executionConfig;

    return {
        retryEnabled: exec?.retry?.enabled ?? false,
        retryAttempts: exec?.retry?.enabled ? exec.retry.maxAttempts : 1,
        retryDelayMs: exec?.retry?.delayMs ?? 0,
        retryStrategy: exec?.retry?.strategy ?? "fixed",

        timeoutEnabled: exec?.timeout?.enabled ?? false,
        timeoutMs: exec?.timeout?.enabled ? exec.timeout.durationMs : undefined,

        runAsynchronously: exec?.async?.enabled ?? false,

        continueOnError: exec?.errorHandling?.continueOnError ?? false,
        fallbackNodeId: exec?.errorHandling?.fallbackNodeId,
    };
}