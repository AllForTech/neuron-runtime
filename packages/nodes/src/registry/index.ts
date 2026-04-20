import {NodeDefinition, NodeType} from '@neuron/shared';
import {INodeRegistry} from "../types";

export class NodeRegistry implements INodeRegistry {
    private nodes = new Map<string, NodeDefinition>();

    register(node: NodeDefinition) {
        if (this.nodes.has(node.type)) {
            throw new Error(`Node "${node.type}" already registered`);
        }

        this.nodes.set(node.type, node);
    }

    get(type: NodeType): NodeDefinition {
        const node = this.nodes.get(type);
        if (!node) throw new Error(`Node "${type}" not found`);
        return node;
    }

    has(type: NodeType): boolean {
        return this.nodes.has(type);
    }

    getAll() {
        return Array.from(this.nodes.values());
    }
}