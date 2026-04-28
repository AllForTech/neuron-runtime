import {NodeDefinition, NodeExecutor, NodeType} from "@neuron/shared";

export interface INodeRegistry {
    register(node: NodeDefinition): void;
    get(type: NodeType): NodeDefinition;
    getAll(): NodeDefinition[];
    has(type: NodeType): boolean;
}

// export interface INodeExecutors {
//     register(executor: NodeExecutor): void;
//     get(type: NodeType): NodeDefinition;
//     getAll(): NodeDefinition[];
//     has(type: NodeType): boolean;
// }