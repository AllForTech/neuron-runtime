"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.triggerNode = void 0;
const nodes_sdk_1 = require("@neuron/nodes-sdk");
const shared_1 = require("@neuron/shared");
const lucide_react_1 = require("lucide-react");
const execution_1 = require("./execution");
exports.triggerNode = (0, nodes_sdk_1.createNode)({
    type: "trigger",
    template: {
        key: "trigger",
        label: "Workflow Trigger",
        description: `
            The starting point for your automation. This node listens for an external signal 
            to begin execution. Supported types include 'Manual' for dashboard-initiated runs, 
            'Webhook' for receiving real-time data from external services via HTTP, 
            and 'Schedule' for recurring, time-based operations.
        `.trim(),
        category: "Core",
        icon: lucide_react_1.Zap,
        defaultConfig: {
            triggerType: "manual",
            ...(0, shared_1.getBaseConfig)("Workflow Entry Point"),
        },
    },
    executor: execution_1.executor
});
