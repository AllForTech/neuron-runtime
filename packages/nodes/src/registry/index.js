"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NodeRegistry = void 0;
class NodeRegistry {
    constructor() {
        this.nodes = new Map();
    }
    register(node) {
        if (this.nodes.has(node.type)) {
            throw new Error(`Node "${node.type}" already registered`);
        }
        this.nodes.set(node.type, node);
    }
    get(type) {
        const node = this.nodes.get(type);
        if (!node)
            throw new Error(`Node "${type}" not found`);
        return node;
    }
    has(type) {
        return this.nodes.has(type);
    }
    getAll() {
        return Array.from(this.nodes.values());
    }
}
exports.NodeRegistry = NodeRegistry;
