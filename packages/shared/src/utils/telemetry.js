"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createContextEntry = void 0;
const createContextEntry = (node, output, startTime) => {
    const endTime = performance.now();
    const durationMs = endTime - startTime;
    // Automatic unit scaling for professional UI display
    const latency = durationMs < 1000
        ? `${durationMs.toFixed(2)}ms`
        : `${(durationMs / 1000).toFixed(3)}s`;
    return {
        metadata: {
            nodeType: node.type,
            executedAt: new Date().toISOString(),
            latency,
            durationMs: parseFloat(durationMs.toFixed(4)),
        },
        payload: output,
    };
};
exports.createContextEntry = createContextEntry;
