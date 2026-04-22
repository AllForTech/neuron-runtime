"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.logger = void 0;
const IS_BROWSER = typeof window !== 'undefined';
const IS_PROD = process.env.NODE_ENV === 'production';
/**
 * Universal logging utility for the Neuron monorepo.
 * Automatically adapts formatting for Browser, Node.js, and Production environments.
 */
class Logger {
    constructor() {
        this.defaultModule = "Runtime";
    }
    getTimestamp() {
        return new Date().toISOString();
    }
    /**
     * Internal formatter to handle multi-environment output logic.
     */
    format(level, message, payload) {
        const { module, context, error } = payload;
        const timestamp = this.getTimestamp();
        if (IS_PROD) {
            // Production: Clean JSON for log aggregators
            const output = JSON.stringify({ timestamp, level, module, message, context, error: error?.message || error });
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
            console.groupCollapsed(`%cNEURON%c ${timestamp} %c${level.toUpperCase()}%c [${module}] ${message}`, "background: #000; color: #fff; padding: 2px 5px; border-radius: 3px; font-weight: bold;", "color: gray; font-weight: normal;", `color: ${colors[level]}; font-weight: bold;`, "color: inherit; font-weight: bold;");
            if (context)
                console.log("Context:", context);
            if (error)
                console.error("Error Detail:", error);
            console.groupEnd();
        }
        else {
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
            console.log(`${styles.dim}${timestamp}${styles.reset} ` +
                `${styles[level]}${styles.bold}${level.toUpperCase().padEnd(5)}${styles.reset} ` +
                `${styles.bold}NEURON${styles.reset} ` +
                `${styles.dim}[${module}]${styles.reset} ` +
                `${message}`);
            if (context)
                console.dir(context, { depth: null, colors: true });
            if (error)
                console.error(error);
        }
    }
    /** Logs general application events */
    info(module = this.defaultModule, message, context) {
        this.format('info', message, { module, context });
    }
    /** Logs recoverable issues or warnings */
    warn(module = this.defaultModule, message, context) {
        this.format('warn', message, { module, context });
    }
    /** Logs critical failures and exceptions */
    error(module = this.defaultModule, message, error, context) {
        this.format('error', message, { module, error, context });
    }
    /** Logs detailed information for troubleshooting */
    debug(module = this.defaultModule, message, context) {
        this.format('debug', message, { module, context });
    }
}
exports.logger = new Logger();
