"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getBaseConfig = void 0;
exports.convertNodeToDBSchema = convertNodeToDBSchema;
function convertNodeToDBSchema(node) {
    return {
        id: node.id,
        type: node.type,
        config: node.config,
        positionX: node.position.x,
        positionY: node.position.y,
    };
}
const getBaseConfig = (label) => ({
    meta: {
        label,
        description: '',
    },
    executionConfig: {
        retry: {
            enabled: false,
            maxAttempts: 3,
            delayMs: 1000,
            strategy: 'fixed',
        },
        timeout: { enabled: true, durationMs: 30000 },
        errorHandling: { continueOnError: false },
    },
});
exports.getBaseConfig = getBaseConfig;
