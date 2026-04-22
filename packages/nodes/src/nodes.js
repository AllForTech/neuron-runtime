"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.nodeCatalog = exports.nodeRegistry = void 0;
const registry_1 = require("./registry");
const node_http_request_1 = require("@neuron/node-http-request");
const node_trigger_1 = require("@neuron/node-trigger");
const node_debug_1 = require("@neuron/node-debug");
const node_respond_1 = require("@neuron/node-respond");
const node_condition_1 = require("@neuron/node-condition");
const node_llm_1 = require("@neuron/node-llm");
const node_transform_1 = require("@neuron/node-transform");
const node_decision_1 = require("@neuron/node-decision");
const node_integration_1 = require("@neuron/node-integration");
const node_context_1 = require("@neuron/node-context");
const node_output_1 = require("@neuron/node-output");
const installedNodes = [
    node_trigger_1.triggerNode,
    node_http_request_1.httpNode,
    node_debug_1.debugNode,
    node_respond_1.respondNode,
    node_condition_1.conditionNode,
    node_llm_1.llmNode,
    node_transform_1.transformNode,
    node_decision_1.decisionNode,
    node_integration_1.integrationNode,
    node_context_1.contextNode,
    node_output_1.outputNode
];
exports.nodeRegistry = new registry_1.NodeRegistry();
installedNodes.forEach((node) => {
    exports.nodeRegistry.register(node);
});
exports.nodeCatalog = installedNodes.map((node) => node.template);
__exportStar(require("./types"), exports);
