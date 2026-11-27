import {readdirSync, readFileSync} from "node:fs";
import {dirname, join, resolve} from "node:path";
import {fileURLToPath} from "node:url";
import {describe, expect, it} from "vitest";

const apiDir = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const runtimeDir = resolve(apiDir, "../../packages/runtime");

function sourceFiles(dir: string): string[] {
    return readdirSync(dir, {withFileTypes: true}).flatMap(entry => {
        const fullPath = join(dir, entry.name);
        if (entry.isDirectory()) return sourceFiles(fullPath);
        return entry.name.endsWith(".ts") ? [fullPath] : [];
    });
}

const files = sourceFiles(join(runtimeDir, "src"));
const read = (file: string) => readFileSync(file, "utf8");

describe("runtime package boundary", () => {
    it("imports nothing from @neuron/db", () => {
        const offenders = files.filter(file => /from\s+["']@neuron\/db["']/.test(read(file)));
        expect(offenders).toEqual([]);
    });

    it("does not import editor action enums or their wire strings", () => {
        const pattern = /WorkflowEditorActionType|NODE_EXECUTION_START|NODE_EXECUTION_SUCCESS|NODE_EXECUTION_ERROR/;
        const offenders = files.filter(file => pattern.test(read(file)));
        expect(offenders).toEqual([]);
    });

    it("does not declare @neuron/db as a package dependency", () => {
        const manifest = JSON.parse(read(join(runtimeDir, "package.json")));
        expect(manifest.dependencies?.["@neuron/db"]).toBeUndefined();
    });
});
