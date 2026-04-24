import {NodeCategory, NodeExecutionConfig, NodeType, WorkflowNode} from "../types/index.js";

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


export const getCategory = (type: NodeType): NodeCategory => {
    return type.split('.')[0] as NodeCategory;
};


export const isNodeType = {
    trigger: (type: NodeType) => type.startsWith('Trigger.'),
    http: (type: NodeType) => type === 'Network.Http',
    respond: (type: NodeType) => type === 'Network.Respond',
    condition: (type: NodeType) => type === 'Logic.Condition',
    decision: (type: NodeType) => type === 'Logic.Decision',
    llm: (type: NodeType) => type === 'AI.Llm',
    transform: (type: NodeType) => type === 'Utility.Transform',
    debug: (type: NodeType) => type === 'Utility.Debug',
    context: (type: NodeType) => type === 'Utility.Context',
    output: (type: NodeType) => type === 'Utility.Output',
    integration: (type: NodeType) => type === 'Integration.Service',
};