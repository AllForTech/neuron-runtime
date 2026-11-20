import { NodeExecutor, NodeExecutorContext, ExecutorOutput } from "@neuron/shared";
import ivm from "isolated-vm";
import { TransformNodeConfig } from "../index.js";

const TRANSFORM_TIMEOUT_MS = 1000;
const ISOLATE_MEMORY_LIMIT_MB = 64;

function normalizeTransformCode(code: string) {
    const trimmed = code.trim();
    if (/return\s+/m.test(trimmed)) return code;
    return `return (${trimmed})`;
}

export const transformNodeExecutor: NodeExecutor = async ({
                                                  config,
                                                  input,
                                              }: NodeExecutorContext): Promise<ExecutorOutput> => { // Explicitly define return type

    // User code runs in a separate V8 isolate: no host globals (require/process),
    // a hard CPU timeout, and a bounded heap. The isolate is released on every path.
    const isolate = new ivm.Isolate({ memoryLimit: ISOLATE_MEMORY_LIMIT_MB });

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
        await script.run(context, { timeout: TRANSFORM_TIMEOUT_MS });

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
