"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.debugNode = void 0;
const nodes_sdk_1 = require("@neuron/nodes-sdk");
const shared_1 = require("@neuron/shared");
const lucide_react_1 = require("lucide-react");
const execution_1 = require("./execution");
exports.debugNode = (0, nodes_sdk_1.createNode)({
    type: "debug",
    template: {
        key: "debug",
        label: "Debug Log",
        description: `
            A specialized utility for developers to inspect the state of a workflow in real-time. 
            The Debug Node allows you to log custom messages or specific object properties to 
            the execution feed, making it invaluable for troubleshooting complex data piping 
            and ensuring variable interpolation is functioning as expected.
        `.trim(),
        category: "Utility",
        icon: lucide_react_1.Terminal,
        defaultConfig: {
            message: "Debugging execution state...",
            ...(0, shared_1.getBaseConfig)("Data Inspector"),
        },
    },
    executor: execution_1.executor
});
