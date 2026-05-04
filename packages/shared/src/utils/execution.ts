import type {ExecutionStatus} from "../types";


type KeyValuePair = { key: string; value: any };


export function isFinalStatus(status: ExecutionStatus): boolean {
    return status === "success" || status === "failed"
}

export function isRunning(status: ExecutionStatus): boolean {
    return status === "running"
}

export function validateAgainstSchema(payload: any, schema: any) {
    // Logic: Iterate through outputSchema.fields and check if payload keys exist/match types
    // If mismatch found, throw error to be caught by the engine's error handler
    schema.fields.forEach((field: any) => {
        if (field.required && payload[field.key] === undefined) {
            throw new Error(`Schema Violation: Missing required field '${field.key}'`);
        }
    });
}

export function getContentType(format: string) {
    const types: Record<string, string> = {
        json: "application/json",
        markdown: "text/markdown",
        html: "text/html",
        text: "text/plain"
    };
    return types[format] || "text/plain";
}

/**
 * Transforms UI-based key-value arrays or raw values into
 * standard objects for HTTP headers or bodies.
 */
export const transformToObject = (
    input: any,
    options: { isHeader?: boolean; stringify?: boolean } = {}
): any => {
    // 1. Handle Key-Value Arrays (Common in your UI)
    if (Array.isArray(input)) {
        const entries = input
            .filter((item): item is KeyValuePair =>
                item && typeof item === 'object' && 'key' in item && !!item.key?.trim()
            )
            .map(item => [item.key.trim(), item.value]);

        const result = Object.fromEntries(entries);

        return options.stringify ? JSON.stringify(result) : result;
    }

    // 2. Handle Objects/Primitives
    if (input && typeof input === 'object') {
        return options.stringify ? JSON.stringify(input) : input;
    }

    // 3. Fallback for strings/null
    return input ?? (options.isHeader ? {} : undefined);
};