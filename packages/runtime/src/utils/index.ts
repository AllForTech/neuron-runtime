import {IVaultResolver} from "@neuron/shared";
import {ExecutionError, ExecutionMetrics, NodeExecutionResult} from "../types";

const TEMPLATE_REGEX = /{{\s*([\w.-]+)\s*}}/g;
const BLOCKED_KEYS = new Set(["__proto__", "constructor", "prototype"]);


/**
 * Traverses the context object to find a value at a given path
 */
function safePathLookup(obj: any, path: string) {
    const parts = path.split(".");
    let current = obj;

    for (const part of parts) {
        if (BLOCKED_KEYS.has(part)) return undefined;
        if (current === null || current === undefined) return undefined;
        current = current[part];
    }
    return current;
}


export async function resolveConfig(
    config: any,
    context: Record<string, any>,
    options: {
        variables?: Record<string, string>;
        vault?: IVaultResolver;
    }
): Promise<any> {
    // 1. Handle Strings (The actual template resolution)
    if (typeof config === "string") {
        return await resolveTemplate(config, context, options);
    }

    // 2. Handle Arrays (Recursive)
    if (Array.isArray(config)) {
        return await Promise.all(
            config.map(v => resolveConfig(v, context, options))
        );
    }

    // 3. Handle Objects (Recursive)
    if (config && typeof config === "object") {
        const result: any = {};
        for (const key of Object.keys(config)) {
            // Pass the entire options object down
            result[key] = await resolveConfig(config[key], context, options);
        }
        return result;
    }

    return config;
}


export async function resolveTemplate(
    template: string,
    context: Record<string, any>,
    options?: {
        variables?: Record<string, string>;
        vault?: IVaultResolver;
    }
) {
    if (!template || typeof template !== "string" || !template.includes("{{")) {
        return template;
    }

    // --- 1. RAW INJECTION CHECK ---
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

    // --- 2. STRING INTERPOLATION ---
    // If there is surrounding text, we treat it as a string
    const matches = Array.from(template.matchAll(TEMPLATE_REGEX));
    let resolvedString = template;

    for (const match of matches) {
        const [fullMatch, path] = match;
        const resolvedValue = await extractValue(path!, context, options.variables);

        if (resolvedValue !== undefined && resolvedValue !== null) {
            const stringified = typeof resolvedValue === "object"
                ? JSON.stringify(resolvedValue)
                : String(resolvedValue);
            console.warn(`[Template Engine] Could not resolve: ${path}. Falling back to raw string.`);

            resolvedString = resolvedString?.replaceAll(fullMatch, stringified);
        } else {
            console.warn(`[Template Engine] Could not resolve: ${path}`);
        }
    }

    return resolvedString;
}

/**
 * Helper to handle the logic of where to pull data from
 */
async function extractValue(path: string, context: Record<string, any>, options?: { variables?: Record<string, string>; vault?: IVaultResolver }) {
    const segments = path.split(".").filter(Boolean);
    const namespace = segments[0];
    const keyOrPath = segments.slice(1).join(".");

    try {
        switch (namespace) {
            case "Vault":
                if (!options?.vault) {
                    console.warn("[Template Engine] Vault namespace used but no VaultService provided.");
                    return undefined;
                }
                return await options.vault.resolve(keyOrPath);
            case "Global":
                return options.variables?.[keyOrPath];
            default:
                // Standard node data lookup (e.g., node_1.output)
                return safePathLookup(context, path);
        }
    } catch (err) {
        console.error(`[Template Engine] Resolution error for ${path}:`, err);
        return undefined;
    }
}


/**
 * Creates a standardized NodeExecutionResult with type enforcement.
 */
export const createExecutionResult = (
    status: NodeExecutionResult['status'],
    payload: any,
    startTime: number,
    error?: ExecutionError
): NodeExecutionResult => {
    const metrics: ExecutionMetrics = {
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
        status: status as 'failed' | 'timeout' | 'skipped',
        data: null,
        error: error || { message: 'Unknown error occurred', code: 'UNKNOWN_ERROR' },
        metrics,
    };
};