"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.findNode = findNode;
exports.getNextNodes = getNextNodes;
exports.findTriggerNode = findTriggerNode;
function findNode(nodes, nodeId) {
    return nodes.find((node) => node.id === nodeId);
}
function getNextNodes(edges, currentNodeId) {
    return edges.filter((edge) => edge.source === currentNodeId).map((edge) => edge.target);
}
function findTriggerNode(nodes) {
    return nodes.find((node) => node.type === "trigger");
}
