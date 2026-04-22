"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createNode = createNode;
function createNode(node) {
    if (!node.type)
        throw new Error("Missing node type");
    if (!node.executor)
        throw new Error("Missing executor");
    if (!node.template)
        throw new Error("Missing template");
    return node;
}
