import {LogLevel, LogPayload} from "../types/index.js";

const IS_BROWSER = false;
const IS_PROD = process.env.NODE_ENV === 'production';

const REDACTED = '[REDACTED]';

/** Field names whose values are credentials and must never be logged. */
const BENIGN_SECRET_SUFFIXES =
    /(?:count|type|at|started|flow|consent|ui|policy|manager|data)$/i;

function isSecretField(key: string): boolean {
    const normalized = key
        .replace(/([A-Z]+)([A-Z][a-z])/g, "$1_$2")
        .replace(/([a-z0-9])([A-Z])/g, "$1_$2")
        .replace(/[-\s]+/g, "_")
        .toLowerCase();

    if (BENIGN_SECRET_SUFFIXES.test(normalized)) return false;

    return /(?:^|_)(?:pass(?:word|wd|phrase|code)?|pwd|secret(?:_?value)?|token|api_?key|secret_?key|private_?key|access_?token|refresh_?token|auth(?:orization|_?token|_?header)?|credentials?|client_?secret|bearer|cookie|session(?:_(?:id|key|token))?|pin|key)(?:_|$)/.test(normalized);
}

/** Value patterns that look like prefixed secrets or bearer credentials. */
const SECRET_VALUE =
    /(?:\bnrn_(?:live|test)_[A-Za-z0-9]+|\bsk[-_](?:live[-_]|test[-_])?[A-Za-z0-9]+|\bBearer\s+[A-Za-z0-9._~+/=-]+|\bgh[pousr]_[A-Za-z0-9]+|\bAKIA[0-9A-Z]{16})/g;

function sanitizeString(value: unknown): string {
    return String(value).replace(SECRET_VALUE, REDACTED);
}

function sanitizeError(error: Error, seen: WeakSet<object>): Error {
    if (seen.has(error)) return new Error(REDACTED);
    seen.add(error);

    const sanitized = new Error(sanitizeString(error.message));
    sanitized.name = error.name;
    if (error.stack) {
        sanitized.stack = sanitizeString(error.stack);
    }
    const props: Record<string, unknown> = {};
    for (const [key, entry] of Object.entries(error)) {
        props[key] = isSecretField(key) ? REDACTED : sanitizeValue(entry, seen);
    }
    return Object.assign(sanitized, props);
}

function sanitizeValue(value: unknown, seen: WeakSet<object> = new WeakSet()): unknown {
    if (typeof value === 'string') return sanitizeString(value);
    if (value instanceof Error) return sanitizeError(value, seen);
    if (Array.isArray(value)) return value.map((item) => sanitizeValue(item, seen));

    if (value && typeof value === 'object') {
        if (seen.has(value)) return REDACTED;
        seen.add(value);
        const result: Record<string, unknown> = {};
        for (const [key, entry] of Object.entries(value)) {
            result[key] = isSecretField(key) ? REDACTED : sanitizeValue(entry, seen);
        }
        return result;
    }

    return value;
}

/**
 * Universal logging utility for the Neuron monorepo.
 * Automatically adapts formatting for Browser, Node.js, and Production environments.
 * All message, context and error values pass through secret redaction before emission.
 */
class Logger {
    private readonly defaultModule = "Runtime";

    private getTimestamp(): string {
        return new Date().toISOString();
    }

    /**
     * Internal formatter to handle multi-environment output logic.
     */
    private format(level: LogLevel, message: string, payload: LogPayload) {
        const { module, context, error } = payload;
        const timestamp = this.getTimestamp();
        const safeMessage = sanitizeString(message);
        const safeContext = context ? sanitizeValue(context) as Record<string, any> : context;
        const safeError = error ? sanitizeValue(error) : error;

        if (IS_PROD) {
            // Production: Clean JSON for log aggregators
            const output = JSON.stringify({
                timestamp,
                level,
                module,
                message: safeMessage,
                context: safeContext,
                error: safeError instanceof Error ? safeError.message : safeError,
            });
            console[level](output);
            return;
        }

        if (IS_BROWSER) {
            // Browser: Utilize DevTools styling
            const colors = {
                info: '#3b82f6',
                warn: '#f59e0b',
                error: '#ef4444',
                debug: '#8b5cf6'
            };

            console.groupCollapsed(
                `%cNEURON%c ${timestamp} %c${level.toUpperCase()}%c [${module}] ${safeMessage}`,
                "background: #000; color: #fff; padding: 2px 5px; border-radius: 3px; font-weight: bold;",
                "color: gray; font-weight: normal;",
                `color: ${colors[level]}; font-weight: bold;`,
                "color: inherit; font-weight: bold;"
            );
            if (safeContext) console.log("Context:", safeContext);
            if (safeError) console.error("Error Detail:", safeError);
            console.groupEnd();
        } else {
            // Node.js: ANSI Color coding for terminal clarity
            const styles = {
                reset: "\x1b[0m",
                dim: "\x1b[2m",
                bold: "\x1b[1m",
                info: "\x1b[34m",
                warn: "\x1b[33m",
                error: "\x1b[31m",
                debug: "\x1b[35m"
            };

            console.log(
                `${styles.dim}${timestamp}${styles.reset} ` +
                `${styles[level]}${styles.bold}${level.toUpperCase().padEnd(5)}${styles.reset} ` +
                `${styles.bold}NEURON${styles.reset} ` +
                `${styles.dim}[${module}]${styles.reset} ` +
                `${safeMessage}`
            );
            if (safeContext) console.dir(safeContext, { depth: null, colors: true });
            if (safeError) console.error(safeError);
        }
    }

    /** Logs general application events */
    info(module = this.defaultModule, message: string, context?: Record<string, any>) {
        this.format('info', message, { module, context });
    }

    /** Logs recoverable issues or warnings */
    warn(module = this.defaultModule, message: string, context?: Record<string, any>) {
        this.format('warn', message, { module, context });
    }

    /** Logs critical failures and exceptions */
    error(module = this.defaultModule, message: string, error?: any, context?: Record<string, any>) {
        this.format('error', message, { module, error, context });
    }

    /** Logs detailed information for troubleshooting */
    debug(module = this.defaultModule, message: string, context?: Record<string, any>) {
        this.format('debug', message, { module, context });
    }
}

export const logger = new Logger();
