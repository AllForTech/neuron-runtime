import { spawnSync } from "node:child_process";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const apiDir = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const repoRoot = resolve(apiDir, "../..");
const tsc = resolve(repoRoot, "node_modules/typescript/bin/tsc");

describe("backend typecheck contract", () => {
  it("passes with the backend tsconfig for routes and imported package sources", () => {
    const result = spawnSync(
      process.execPath,
      [tsc, "--noEmit", "--incremental", "false", "--project", apiDir],
      { cwd: apiDir, encoding: "utf8" },
    );

    expect(
      result.status,
      `tsc failed with status ${result.status}:\n${result.stdout}${result.stderr}`,
    ).toBe(0);
  }, 120_000);
});
