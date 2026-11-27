import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const WEB_UTILS = fileURLToPath(
    new URL("../../../apps/web/lib/utils.ts", import.meta.url),
);

describe("web vault key configuration", () => {
    it("has no hardcoded or fallback AES key literal", () => {
        const source = readFileSync(WEB_UTILS, "utf8");

        expect(source).not.toMatch(/VAULT_SECRET\s*\?\?/);
        expect(source).not.toMatch(/['"`][0-9a-fA-F]{64}['"`]/);
    });

    it("requires an explicit VAULT_SECRET with a clear missing-key error", () => {
        const source = readFileSync(WEB_UTILS, "utf8");

        expect(source).toMatch(/process\.env\.VAULT_SECRET/);
        expect(source).toMatch(/if\s*\(\s*!secret\s*\)/);
        expect(source).toMatch(/VAULT_SECRET environment variable is missing/);
    });
});
