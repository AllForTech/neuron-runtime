import { NodeExecutor, NodeExecutorContext, ExecutorOutput } from "@neuron/shared";
import { NodeVM } from "vm2";
import { TransformNodeConfig } from "../index";

function normalizeTransformCode(code: string) {
    const trimmed = code.trim();
    if (/return\s+/m.test(trimmed)) return code;
    return `return (${trimmed})`;
}

export const executor: NodeExecutor = async ({
                                                 config,
                                                 input,
                                             }: NodeExecutorContext): Promise<ExecutorOutput> => { // Explicitly define return type

    try {
        const vm = new NodeVM({
            console: "redirect",
            sandbox: {
                inputs: Object.freeze(input ?? {})
            },
            timeout: 1000,
            eval: false,
            wasm: false,
            require: false,
        });

        const userCode = normalizeTransformCode((config as TransformNodeConfig).code);

        const wrappedCode = `
            module.exports = (function() {
                "use strict";
                try {
                    const result = (function() {
                        ${userCode}
                    })();

                    return result;
                } catch (e) {
                    return { __is_error: true, message: e.message };
                }
            })();
        `;

        const result = vm.run(wrappedCode, "transform.js");

        if (result && result.__is_error) {
            throw new Error(`User Script Error: ${result.message}`);
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
    }
}