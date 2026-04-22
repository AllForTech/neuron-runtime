"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.safeTask = safeTask;
exports.safeParseJSON = safeParseJSON;
/**
 * A sleek, type-safe wrapper for async operations.
 * Returns [data, error, loading] for clean array destructuring.
 */
async function safeTask(task, options = {}) {
    const { retry = 0, timeout, customErrorMessage } = options;
    let attempts = 0;
    const execute = async () => {
        try {
            // Handle Timeout logic
            const promise = timeout
                ? Promise.race([
                    task(),
                    new Promise((_, reject) => setTimeout(() => reject(new Error("Operation timed out")), timeout))
                ])
                : task();
            const data = await promise;
            return [data, null, false];
        }
        catch (err) {
            if (attempts < retry) {
                attempts++;
                return execute();
            }
            const finalError = err instanceof Error ? err : new Error(String(err));
            if (customErrorMessage) {
                finalError.message = customErrorMessage;
            }
            return [null, finalError, false];
        }
    };
    return execute();
}
function safeParseJSON(value) {
    try {
        if (typeof value === "string") {
            return JSON.parse(value);
        }
        return value;
    }
    catch {
        return null;
    }
}
