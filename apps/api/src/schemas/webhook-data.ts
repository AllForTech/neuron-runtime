/**
 * Removes credential-bearing keys from untrusted webhook data before it is
 * stored on the trigger node config or emitted through execution logs.
 *
 * Key comparison is case/format insensitive: `apiKey`, `API-KEY`, `api_key`
 * and `apikey` are all treated as the same credential field.
 */

const BENIGN_SUFFIX = /(?:type|count|length|size|name)$/;

const CREDENTIAL_KEY =
    /(?:^|_)(?:api_?key|x_api_key|x_neuron_key|authorization|auth|token|access_token|refresh_token|secret|secret_key|client_secret|private_key|password|passwd|passphrase|passcode|credentials?|cookie|set_cookie|bearer|session|session_id|session_key|session_token|pin|signature)(?:_|$)/;

function normalizeKey(key: string): string {
    return key
        .replace(/([A-Z]+)([A-Z][a-z])/g, "$1_$2")
        .replace(/([a-z0-9])([A-Z])/g, "$1_$2")
        .replace(/[^A-Za-z0-9]+/g, "_")
        .replace(/^_+|_+$/g, "")
        .toLowerCase();
}

function isCredentialField(key: string): boolean {
    const normalized = normalizeKey(key);
    if (!normalized || BENIGN_SUFFIX.test(normalized)) return false;
    return CREDENTIAL_KEY.test(normalized);
}

/** Deep clone that drops credential-like keys at any nesting level. */
export function filterCredentialFields<T>(value: T, seen: WeakSet<object> = new WeakSet()): T {
    if (Array.isArray(value)) {
        if (seen.has(value)) return [] as T;
        seen.add(value);
        return value.map((item) => filterCredentialFields(item, seen)) as T;
    }

    if (value && typeof value === "object") {
        if (seen.has(value)) return {} as T;
        seen.add(value);
        const result: Record<string, unknown> = {};
        for (const [key, entry] of Object.entries(value)) {
            if (isCredentialField(key)) continue;
            result[key] = filterCredentialFields(entry, seen);
        }
        return result as T;
    }

    return value;
}

function asRecord(value: unknown): Record<string, unknown> {
    return value && typeof value === "object" && !Array.isArray(value)
        ? (value as Record<string, unknown>)
        : {};
}

/** Build the trigger webhook payload from request data with credentials removed. */
export function sanitizeWebhookData(req?: {
    body?: unknown;
    query?: unknown;
    headers?: unknown;
}): { body: Record<string, unknown>; query: Record<string, unknown>; headers: Record<string, unknown> } {
    return {
        body: asRecord(filterCredentialFields(req?.body)),
        query: asRecord(filterCredentialFields(req?.query)),
        headers: asRecord(filterCredentialFields(req?.headers)),
    };
}
