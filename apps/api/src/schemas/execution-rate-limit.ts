import type { Options } from "express-rate-limit";

/**
 * Fixed-window policy for the unauthenticated public execution route.
 * Header emission is disabled so successful responses keep their frozen wire
 * shape; only an exceeded window produces the 429 response.
 */
export const publicExecutionRateLimit: Partial<Options> = {
    windowMs: 60_000,
    max: 60,
    message: { error: "Too many execution requests. Please wait a moment." },
    legacyHeaders: false,
    standardHeaders: false,
};
