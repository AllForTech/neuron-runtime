import { NodeDefinition } from "@neuron/shared";

export function createNode<TConfig>(
    node: NodeDefinition<TConfig>
): NodeDefinition<TConfig> {
    if (!node.type) throw new Error("Missing node type");
    if (!node.template) throw new Error("Missing template");

    return node;
}