import {NodeExecutionConfig, WorkflowNode} from "../types";

export function convertNodeToDBSchema(node: WorkflowNode) {
    return {
        id: node.id,
        type: node.type,
        config: node.config,
        positionX: node.position.x,
        positionY: node.position.y,
    }
}


export const getBaseConfig = (label: string) => ({
    meta: {
        label,
        description: '',
    },
    executionConfig: {
        retry: {
            enabled: false,
            maxAttempts: 3,
            delayMs: 1000,
            strategy: 'fixed' as const,
        },
        timeout: { enabled: true, durationMs: 30000 },
        errorHandling: { continueOnError: false },
    } as NodeExecutionConfig,
});