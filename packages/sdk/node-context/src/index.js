"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.contextNode = void 0;
const nodes_sdk_1 = require("@neuron/nodes-sdk");
const shared_1 = require("@neuron/shared");
const lucide_react_1 = require("lucide-react");
const execution_1 = require("./execution");
exports.contextNode = (0, nodes_sdk_1.createNode)({
    type: "contextNode",
    template: {
        key: "contextNode",
        label: "Context Memory",
        description: `
            Acts as a centralized data repository for storing and retrieving information 
            across the entire execution lifecycle. The Context Node allows you to define 
            a global state (e.g., 'currentUser' or 'orderTotal') that can be updated and 
            read by any other node in the workflow. This is essential for long-running 
            automations where information gathered at the start needs to be preserved for 
            final processing or conditional logic.
        `.trim(),
        category: "Core",
        icon: lucide_react_1.Database,
        defaultConfig: {
            label: "Global State",
            fields: {},
            ...(0, shared_1.getBaseConfig)("Execution Memory Store"),
        },
    },
    executor: execution_1.executor
});
