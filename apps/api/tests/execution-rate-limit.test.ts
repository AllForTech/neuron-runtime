import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, expect, it, vi } from "vitest";
import { rateLimit } from "express-rate-limit";
import { publicExecutionRateLimit } from "../src/schemas/execution-rate-limit";

const INDEX_TS = fileURLToPath(new URL("../src/index.ts", import.meta.url));

function makeRequest() {
    return {
        ip: "203.0.113.10",
        method: "GET",
        originalUrl: "/api/v1/execute/workflow/deployment-1",
        headers: {},
        app: {
            get(setting: string) {
                return setting === "trust proxy" ? false : undefined;
            },
        },
    } as any;
}

function makeResponse() {
    return {
        statusCode: 200,
        body: undefined as unknown,
        headersSent: false,
        writableEnded: false,
        headers: {} as Record<string, string>,
        setHeader(name: string, value: string | number) {
            this.headers[name] = String(value);
            return this;
        },
        getHeader(name: string) {
            return this.headers[name];
        },
        append() {
            return this;
        },
        status(code: number) {
            this.statusCode = code;
            return this;
        },
        send(body: unknown) {
            this.body = body;
            this.writableEnded = true;
            return this;
        },
        json(body: unknown) {
            this.body = body;
            this.writableEnded = true;
            return this;
        },
    } as any;
}

describe("public execution rate limit", () => {
    it("uses a bounded fixed window and does not add headers to successful responses", () => {
        expect(publicExecutionRateLimit.windowMs).toBe(60_000);
        expect(publicExecutionRateLimit.max).toBeGreaterThan(0);
        expect(publicExecutionRateLimit.max).toBeLessThanOrEqual(120);
        expect((publicExecutionRateLimit.message as { error?: string }).error).toEqual(expect.any(String));
        expect(publicExecutionRateLimit.legacyHeaders).toBe(false);
        expect(publicExecutionRateLimit.standardHeaders).toBe(false);
    });

    it("blocks a client that exceeds the configured window limit", async () => {
        const limiter = rateLimit(publicExecutionRateLimit);
        const max = publicExecutionRateLimit.max as number;
        let allowed = 0;

        for (let index = 0; index < max; index += 1) {
            const next = vi.fn();
            await limiter(makeRequest(), makeResponse(), next);
            if (next.mock.calls.length === 1) allowed += 1;
        }

        const blockedResponse = makeResponse();
        const blockedNext = vi.fn();
        await limiter(makeRequest(), blockedResponse, blockedNext);

        expect(allowed).toBe(max);
        expect(blockedNext).not.toHaveBeenCalled();
        expect(blockedResponse.statusCode).toBe(429);
        expect(blockedResponse.body).toEqual(publicExecutionRateLimit.message);
    });

    it("is mounted on the public execution route before the deployment router", () => {
        const source = readFileSync(INDEX_TS, "utf8");

        expect(source).toMatch(/rateLimit\(publicExecutionRateLimit\)/);
        expect(source.indexOf("app.use('/api/v1/execute/workflow', publicExecutionLimiter)")).toBeGreaterThan(-1);
        expect(
            source.indexOf("app.use('/api/v1/execute/workflow', publicExecutionLimiter)"),
        ).toBeLessThan(source.indexOf("app.use('/api/v1/execute/workflow', deploymentRoutes)"));
    });
});
