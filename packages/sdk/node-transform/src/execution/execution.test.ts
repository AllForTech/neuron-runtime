import { describe, expect, it } from "vitest";
import type { NodeExecutor, NodeExecutorContext } from "@neuron/shared";
import type { TransformNodeConfig } from "../index.js";
import {
    createTransformNodeExecutor,
    ISOLATE_MEMORY_LIMIT_MB,
    transformNodeExecutor,
} from "./execution.js";

function makeContext(code: string, input: unknown = {}): NodeExecutorContext {
    return {
        nodeType: "Utility.Transform",
        config: { code } as TransformNodeConfig,
        input,
    };
}

function flushMicrotasks(): Promise<void> {
    return new Promise<void>((resolve) => setImmediate(resolve));
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

    it("bounds the isolate heap to the configured memory limit", async () => {
        // Pin the intended limit so a silent change to the constant fails here.
        expect(ISOLATE_MEMORY_LIMIT_MB).toBe(64);

        // Behavioural check, independent of timing: an allocation larger than
        // the configured heap fails inside the same executor code path.
        const oversizedBytes = (ISOLATE_MEMORY_LIMIT_MB + 32) * 1024 * 1024;
        await expect(
            transformNodeExecutor(makeContext(`return new Uint8Array(${oversizedBytes}).length;`))
        ).rejects.toThrow("Array buffer allocation failed");
    });

    it("caps concurrent isolates and completes all queued work", async () => {
        const cap = 2;
        const total = 5;
        let active = 0;
        let peak = 0;
        let completed = 0;
        const releases: Array<() => void> = [];

        const executeInIsolate: NodeExecutor = async () => {
            active += 1;
            peak = Math.max(peak, active);
            await new Promise<void>((resolve) => { releases.push(resolve); });
            active -= 1;
            completed += 1;
            return { success: true, output: completed };
        };

        const executor = createTransformNodeExecutor({ maxConcurrentIsolates: cap, executeInIsolate });
        const pending = Array.from({ length: total }, (_, index) =>
            executor(makeContext(`return ${index};`))
        );

        await flushMicrotasks();
        expect(active).toBe(cap);
        expect(peak).toBe(cap);
        expect(releases).toHaveLength(cap);

        while (completed < total) {
            const releaseNext = releases.shift();
            if (!releaseNext) throw new Error("Expected a pending execution to release");
            releaseNext();
            await flushMicrotasks();
        }

        const results = await Promise.all(pending);
        expect(results).toHaveLength(total);
        expect(results.every((result) => result.success)).toBe(true);
        expect(peak).toBe(cap);
        expect(releases).toHaveLength(0);
    });
});
