import { WorkflowNode } from "@neuron/db";
import { INodeRegistry } from "@neuron/nodes";
import { NodeExecutionResult } from "../types";
import { BaseNodeConfig, NodeType } from "@neuron/shared";
import { createExecutionResult } from "../utils";

export class NodeRunner {
    constructor(
        private registry: INodeRegistry,
    ) {}

    public async run(
        node: WorkflowNode,
        resolvedConfig: Record<string, any>
    ): Promise<NodeExecutionResult> {
        const startTime = performance.now();

        try {
            const hasNode = this.registry.has(node.type as NodeType);

            if (!hasNode) {
                throw new Error(`[Runtime] Error: Node type ${node.type} not found in Node Registry.`);
            }
            const definition = this.registry.get(node.type as NodeType);

            // 2. Execute via SDK Definition
            const output = await definition.executor({
                nodeType: node.type as NodeType,
                config: node.config as BaseNodeConfig,
                input: resolvedConfig,
            });

            return createExecutionResult('success', output, startTime);
        } catch (err: any) {
            return createExecutionResult('failed', null, startTime, {
                message: err.message,
                code: 'NODE_RUN_ERROR',
            });
        }
    }
}