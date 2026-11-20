import { describe, expect, it } from "vitest";
import type { NodeExecutorContext } from "@neuron/shared";
import type { TransformNodeConfig } from "../index.js";
import { transformNodeExecutor } from "./execution.js";

function makeContext(code: string, input: unknown = {}): NodeExecutorContext {
    return {
        nodeType: "Utility.Transform",
        config: { code } as TransformNodeConfig,
        input,
    };
}

describe("transformNodeExecutor sandbox", () => {
    it("returns the transformed value in the executor output shape", async () => {
        const result = await transformNodeExecutor(
            makeContext("return { doubled: inputs.value * 2 };", { value: 21 })
        );

        expect(result).toEqual({ success: true, output: { doubled: 42 } });
    });

    it("enforces the 1000ms timeout with the frozen error message", async () => {
        await expect(
            transformNodeExecutor(makeContext("while (true) {}\nreturn 1;"))
        ).rejects.toThrow("Execution Timeout: Transformation took too long.");
    });

    it("denies require access to user code", async () => {
        await expect(
            transformNodeExecutor(
                makeContext("return require('node:fs').readFileSync('/etc/passwd', 'utf8');")
            )
        ).rejects.toThrow("User Script Error: require is not defined");
    });

    it("denies process access to user code", async () => {
        await expect(
            transformNodeExecutor(makeContext("return process.env;"))
        ).rejects.toThrow("User Script Error: process is not defined");
    });
});
