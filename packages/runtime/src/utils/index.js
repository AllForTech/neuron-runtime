"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createExecutionResult = void 0;
exports.resolveConfig = resolveConfig;
exports.resolveTemplate = resolveTemplate;
const shared_1 = require("@neuron/shared");
const TEMPLATE_REGEX = /{{\s*([\w.-]+)\s*}}/g;
const BLOCKED_KEYS = new Set(["__proto__", "constructor", "prototype"]);
/**
 * Traverses the context object to find a value at a given path
 */
function safePathLookup(obj, path) {
    const parts = path.split(".");
    let current = obj;
    for (const part of parts) {
        if (BLOCKED_KEYS.has(part))
            return undefined;
        if (current === null || current === undefined)
            return undefined;
        current = current[part];
    }
    return current;
}
async function resolveConfig(config, context, options) {
    // 1. Handle Strings (The actual template resolution)
    if (typeof config === "string") {
        return await resolveTemplate(config, context, options);
    }
    // 2. Handle Arrays (Recursive)
    if (Array.isArray(config)) {
        return await Promise.all(config.map(v => resolveConfig(v, context, options)));
    }
    // 3. Handle Objects (Recursive)
    if (config && typeof config === "object") {
        const result = {};
        for (const key of Object.keys(config)) {
            // Pass the entire options object down
            result[key] = await resolveConfig(config[key], context, options);
        }
        return result;
    }
    return config;
}
async function resolveTemplate(template, context, options) {
    if (!template || typeof template !== "string" || !template.includes("{{")) {
        return template;
    }
    // If the template is ONLY a single variable, return the RAW value (Object, Array, etc.)
    // Matches: "{{node_1}}" or "{{ Global.KEY }}" but NOT "ID: {{node_1}}"
    const trimmed = template.trim();
    const isSingleVar = trimmed.startsWith("{{") &&
        trimmed.endsWith("}}") &&
        (trimmed.match(/{{/g) || []).length === 1;
    if (isSingleVar) {
        const path = trimmed.slice(2, -2).trim();
        return await extractValue(path, context, options.variables);
    }
    // If there is surrounding text, we treat it as a string
    const matches = Array.from(template.matchAll(TEMPLATE_REGEX));
    let resolvedString = template;
    for (const match of matches) {
        const [fullMatch, path] = match;
        const resolvedValue = await extractValue(path, context, options.variables);
        if (resolvedValue !== undefined && resolvedValue !== null) {
            const stringified = typeof resolvedValue === "object"
                ? JSON.stringify(resolvedValue)
                : String(resolvedValue);
            shared_1.logger.warn("Runtime", "Could not resolve: ${path}. Falling back to raw string.");
            resolvedString = resolvedString?.replaceAll(fullMatch, stringified);
        }
        else {
            shared_1.logger.warn("Runtime", `Could not resolve: ${path}`);
        }
    }
    return resolvedString;
}
/**
 * Helper to handle the logic of where to pull data from
 */
async function extractValue(path, context, options) {
    const segments = path.split(".").filter(Boolean);
    const namespace = segments[0];
    const keyOrPath = segments.slice(1).join(".");
    try {
        switch (namespace) {
            case "Vault":
                if (!options?.vault) {
                    shared_1.logger.warn("Runtime", `Vault namespace used but no VaultService provided.`);
                    return undefined;
                }
                return await options.vault.resolve(keyOrPath);
            case "Global":
                return options.variables?.[keyOrPath];
            default:
                // Standard node data lookup (e.g., node_1.output)
                return safePathLookup(context, path);
        }
    }
    catch (err) {
        shared_1.logger.warn("Runtime", `Resolution error for ${path}:`, err);
        return undefined;
    }
}
/**
 * Creates a standardized NodeExecutionResult with type enforcement.
 */
const createExecutionResult = (status, payload, startTime, error) => {
    const metrics = {
        durationMs: performance.now() - startTime,
        timestamp: new Date().toISOString(),
    };
    if (status === 'success') {
        return {
            status: 'success',
            data: payload,
            metrics,
        };
    }
    return {
        status: status,
        data: null,
        error: error || { message: 'Unknown error occurred', code: 'UNKNOWN_ERROR' },
        metrics,
    };
};
exports.createExecutionResult = createExecutionResult;
