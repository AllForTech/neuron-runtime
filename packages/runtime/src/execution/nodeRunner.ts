import { WorkflowNode } from "@neuron/db";
import { nodeExecutors } from "@neuron/nodes/server";
import {BaseNodeConfig, logger, NodeExecutor, NodeType} from "@neuron/shared";
import { createExecutionResult, normalizeExecutionPolicy,  delay, runWithTimeout  } from "../utils";
import { ExecutionSignal } from "@neuron/shared";

export class NodeRunner {
    private readonly registry: Record<NodeType, NodeExecutor>;

    constructor() {
        this.registry = nodeExecutors;
    }

    public async run(
        node: WorkflowNode,
        resolvedConfig: Record<string, any>
    ) {
        const startTime = performance.now();
        const policy = normalizeExecutionPolicy(node.config as BaseNodeConfig);

        const executor = this.registry[node.type as NodeType];

        if (!executor) {
            return {
                result: createExecutionResult("failed", null, startTime, {
                    message: `Executor not found for ${node.type}`,
                    code: "EXECUTOR_NOT_FOUND"
                }),
                signal: "error" as ExecutionSignal,
                attempts: 0
            };
        }

        let lastError: any;
        let attempts = 0;

        for (let i = 0; i < policy.retryAttempts; i++) {
            attempts++;

            try {
                const execution = await runWithTimeout(
                    () =>
                        executor({
                            nodeType: node.type as NodeType,
                            config: resolvedConfig as BaseNodeConfig,
                            input: resolvedConfig
                        }),
                    policy.timeoutMs
                );

                return {
                    result: createExecutionResult("success", execution.output, startTime),
                    signal: "success" as ExecutionSignal,
                    attempts
                };

            } catch (err: any) {
                lastError = err;

                logger.debug("Execution error", err);
                // Timeout detection
                if (err.message === "Execution timeout") {
                    return {
                        result: createExecutionResult("timeout", null, startTime, {
                            message: err.message,
                            code: "TIMEOUT"
                        }),
                        signal: "timeout" as ExecutionSignal,
                        attempts
                    };
                }

                // Retry logic
                if (attempts < policy.retryAttempts) {
                    const delayMs =
                        policy.retryStrategy === "exponential"
                            ? policy.retryDelayMs * Math.pow(2, attempts - 1)
                            : policy.retryDelayMs;

                    await delay(delayMs);
                }
            }
        }

        return {
            result: createExecutionResult("failed", null, startTime, {
                message: lastError?.message || "Execution failed",
                code: "RETRY_EXHAUSTED"
            }),
            signal: "retry_exhausted" as ExecutionSignal,
            attempts
        };
    }
}