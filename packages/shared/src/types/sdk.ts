import {BaseNode, BaseNodeConfig, NodeType, WorkflowNode} from "./nodes";

export interface NodeExecutorContext {
    nodeType: NodeType;
    config: BaseNodeConfig;
    input: any;
}

export type NodeExecutor = (
    ctx: NodeExecutorContext
) => Promise<ExecutorOutput>;

export type ExecutorOutput = {
    success: boolean;
    error?: string | null;
    output: any | null;
}

export interface NodeDefinition<TConfig = any> {
    type: NodeType;

    executor: NodeExecutor;

    template: {
        key: string;
        label: string;
        description: string;
        category: string;
        icon: any;

        defaultConfig: TConfig;
    };
}