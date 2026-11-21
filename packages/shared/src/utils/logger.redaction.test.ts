import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const PREFIXED_SECRET = "nrn_live_abcdef123456";
const TOKEN_SECRET = "sk-abcdefghijklmnopqrstuvwxyz";
const PASSWORD_SECRET = "hunter2-correct-horse";
const BEARER_SECRET = `Bearer ${TOKEN_SECRET}`;

function render(value: unknown): string {
    if (value instanceof Error) {
        return `${value.name}: ${value.message}\n${value.stack ?? ""}`;
    }
    if (typeof value === "string") return value;
    try {
        return JSON.stringify(value) ?? String(value);
    } catch {
        return String(value);
    }
}

function spyOnConsole(output: string[]): () => void {
    const capture = (...args: unknown[]) => {
        output.push(args.map(render).join(" "));
    };
    const spies = [
        vi.spyOn(console, "log").mockImplementation(capture),
        vi.spyOn(console, "dir").mockImplementation(capture),
        vi.spyOn(console, "error").mockImplementation(capture),
        vi.spyOn(console, "info").mockImplementation(capture),
        vi.spyOn(console, "warn").mockImplementation(capture),
        vi.spyOn(console, "debug").mockImplementation(capture),
    ];
    return () => spies.forEach((spy) => spy.mockRestore());
}

async function loadLogger() {
    vi.resetModules();
    const module = await import("./logger");
    return module.logger;
}

describe("logger redaction", () => {
    beforeEach(() => {
        vi.stubEnv("NODE_ENV", "test");
    });

    afterEach(() => {
        vi.unstubAllEnvs();
        vi.restoreAllMocks();
    });

    it("redacts secret-named fields and prefixed values in node output", async () => {
        const logger = await loadLogger();
        const output: string[] = [];
        const restore = spyOnConsole(output);

        logger.info("Runtime", `connecting with ${PREFIXED_SECRET}`, {
            apiKey: TOKEN_SECRET,
            nested: { password: PASSWORD_SECRET },
            nodeCount: 3,
        });

        restore();
        const text = output.join("\n");
        expect(text).not.toContain(PREFIXED_SECRET);
        expect(text).not.toContain(TOKEN_SECRET);
        expect(text).not.toContain(PASSWORD_SECRET);
        expect(text).toContain("[REDACTED]");
        expect(text).toContain("nodeCount");
        expect(text).toContain("3");
    });

    it("redacts secrets carried by errors and authorization context", async () => {
        const logger = await loadLogger();
        const output: string[] = [];
        const restore = spyOnConsole(output);

        logger.error(
            "Runtime",
            "vault resolution failed",
            new Error(`token ${TOKEN_SECRET} rejected`),
            { authorization: BEARER_SECRET },
        );

        restore();
        const text = output.join("\n");
        expect(text).not.toContain(TOKEN_SECRET);
        expect(text).not.toContain(BEARER_SECRET);
        expect(text).toContain("[REDACTED]");
        expect(text).toContain("vault resolution failed");
    });

    it("redacts secrets from production JSON output", async () => {
        vi.stubEnv("NODE_ENV", "production");
        const logger = await loadLogger();
        const output: string[] = [];
        const restore = spyOnConsole(output);

        logger.info("Runtime", "connecting", {
            client_secret: PASSWORD_SECRET,
            safeField: "visible-value",
        });

        restore();
        const text = output.join("\n");
        expect(text).not.toContain(PASSWORD_SECRET);
        expect(text).toContain("[REDACTED]");
        expect(text).toContain("visible-value");
        expect(text).toContain('"level":"info"');
    });

    it("preserves benign diagnostic fields while redacting secret fields", async () => {
        const logger = await loadLogger();
        const output: string[] = [];
        const restore = spyOnConsole(output);

        logger.info("Runtime", "diagnostics", {
            tokenCount: 42,
            passed: true,
            credentialType: "oauth",
            sessionStartedAt: "2026-11-21T00:00:00Z",
            apiKey: TOKEN_SECRET,
            accessToken: TOKEN_SECRET,
            password: PASSWORD_SECRET,
        });

        restore();
        const text = output.join("\n");
        expect(text).toContain("tokenCount");
        expect(text).toContain("42");
        expect(text).toContain("passed");
        expect(text).toContain("true");
        expect(text).toContain("credentialType");
        expect(text).toContain("oauth");
        expect(text).toContain("sessionStartedAt");
        expect(text).toContain("2026-11-21T00:00:00Z");
        expect(text).not.toContain(TOKEN_SECRET);
        expect(text).not.toContain(PASSWORD_SECRET);
        expect(text).toContain("[REDACTED]");
    });

    it("redacts realistic secret field-name variants without over-redacting benign names", async () => {
        const logger = await loadLogger();
        const output: string[] = [];
        const restore = spyOnConsole(output);

        logger.info("Runtime", "credentials", {
            secretValue: PASSWORD_SECRET,
            passphrase: PASSWORD_SECRET,
            passcode: PASSWORD_SECRET,
            pin: PASSWORD_SECRET,
            authHeader: BEARER_SECRET,
            apikey: TOKEN_SECRET,
            "x-api-key": TOKEN_SECRET,
        });

        restore();
        const text = output.join("\n");
        expect(text).not.toContain(PASSWORD_SECRET);
        expect(text).not.toContain(TOKEN_SECRET);
        expect(text).not.toContain(BEARER_SECRET);
        expect(text).toContain("[REDACTED]");
        expect(text).toContain("secretValue");
        expect(text).toContain("passphrase");
        expect(text).toContain("passcode");
        expect(text).toContain("pin");
        expect(text).toContain("authHeader");
        expect(text).toContain("apikey");
        expect(text).toContain("x-api-key");
    });
});
