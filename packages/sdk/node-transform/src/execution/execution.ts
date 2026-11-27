import { NodeExecutor, NodeExecutorContext, ExecutorOutput } from "@neuron/shared";
import ivm from "isolated-vm";
import { TransformNodeConfig } from "../index.js";
import { Semaphore } from "./semaphore.js";

export const TRANSFORM_TIMEOUT_MS = 1000;
export const ISOLATE_MEMORY_LIMIT_MB = 64;
export const DEFAULT_MAX_CONCURRENT_ISOLATES = 4;

function normalizeTransformCode(code: string) {
    const trimmed = code.trim();
    if (/return\s+/m.test(trimmed)) return code;
    return `return (${trimmed})`;
}

/** Creates a fresh, bounded V8 isolate for one transform execution. */
export function createTransformIsolate(memoryLimitMb: number = ISOLATE_MEMORY_LIMIT_MB): ivm.Isolate {
    return new ivm.Isolate({ memoryLimit: memoryLimitMb });
}

export interface TransformExecutorOptions {
    /** Hard CPU timeout for user code, in milliseconds. */
    timeoutMs?: number;
    /** Heap limit for each isolate, in megabytes. */
    memoryLimitMb?: number;
    /** Maximum number of isolates allowed to exist at the same time. */
    maxConcurrentIsolates?: number;
    /** Execution strategy override; used to test scheduling without real isolates. */
    executeInIsolate?: NodeExecutor;
}

async function runInIsolate(
    { config, input }: NodeExecutorContext,
    memoryLimitMb: number,
    timeoutMs: number
): Promise<ExecutorOutput> {
    // User code runs in a separate V8 isolate: no host globals (require/process),
    // a hard CPU timeout, and a bounded heap. The isolate is released on every path.
    const isolate = createTransformIsolate(memoryLimitMb);

    try {
        const context = await isolate.createContext();
        const jail = context.global;

        await jail.set("inputs", new ivm.ExternalCopy(input ?? {}).copyInto());

        const userCode = normalizeTransformCode((config as TransformNodeConfig).code);

        const wrappedCode = `
            "use strict";
            Object.freeze(inputs);
            const noop = function () {};
            globalThis.console = {
                log: noop, info: noop, warn: noop, error: noop,
                debug: noop, trace: noop, dir: noop, table: noop
            };
            try {
                globalThis.__result = (function() {
                    ${userCode}
                })();
            } catch (e) {
                globalThis.__result = { __is_error: true, message: e.message };
            }
        `;

        const script = await isolate.compileScript(wrappedCode, { filename: "transform.js" });
        await script.run(context, { timeout: timeoutMs });

        const result = await jail.get("__result", { copy: true });

        if (result && (result as { __is_error?: boolean }).__is_error) {
            throw new Error(`User Script Error: ${(result as { message: string }).message}`);
        }

        if (result === undefined || result === null) {
            throw new Error("Transform must return a value.");
        }

        return {
            success: true,
            output: result,
        };

    } catch (error: any) {
        const message = error.message.includes("Script execution timed out")
            ? "Execution Timeout: Transformation took too long."
            : error.message;

        throw new Error(message);
    } finally {
        isolate.dispose();
    }
}

/**
 * Builds a transform executor whose isolate creation is bounded by a semaphore.
 *
 * Default limits match the previous executor behaviour; only the concurrency
 * cap is newly enforced. The returned function keeps the NodeExecutor contract
 * and output shape.
 */
export function createTransformNodeExecutor(options: TransformExecutorOptions = {}): NodeExecutor {
    const memoryLimitMb = options.memoryLimitMb ?? ISOLATE_MEMORY_LIMIT_MB;
    const timeoutMs = options.timeoutMs ?? TRANSFORM_TIMEOUT_MS;
    const maxConcurrentIsolates = options.maxConcurrentIsolates ?? DEFAULT_MAX_CONCURRENT_ISOLATES;
    const execute = options.executeInIsolate ?? ((ctx: NodeExecutorContext) => runInIsolate(ctx, memoryLimitMb, timeoutMs));
    const semaphore = new Semaphore(maxConcurrentIsolates);

    return async (ctx: NodeExecutorContext): Promise<ExecutorOutput> => {
        await semaphore.acquire();
        try {
            return await execute(ctx);
        } finally {
            semaphore.release();
        }
    };
}

export const transformNodeExecutor: NodeExecutor = createTransformNodeExecutor();
