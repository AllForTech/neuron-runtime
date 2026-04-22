"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NodeRunner = void 0;
const utils_1 = require("../utils");
class NodeRunner {
    constructor(registry) {
        this.registry = registry;
    }
    async run(node, resolvedConfig) {
        const startTime = performance.now();
        try {
            const hasNode = this.registry.has(node.type);
            if (!hasNode) {
                throw new Error(`[Runtime] Error: Node type ${node.type} not found in Node Registry.`);
            }
            const definition = this.registry.get(node.type);
            // 2. Execute via SDK Definition
            const result = await definition.executor({
                nodeType: node.type,
                config: node.config,
                input: resolvedConfig,
            });
            return (0, utils_1.createExecutionResult)('success', result.output, startTime);
        }
        catch (err) {
            return (0, utils_1.createExecutionResult)('failed', null, startTime, {
                message: err.message,
                code: 'NODE_RUN_ERROR',
            });
        }
    }
}
exports.NodeRunner = NodeRunner;
