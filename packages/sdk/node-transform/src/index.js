"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.transformNode = void 0;
const nodes_sdk_1 = require("@neuron/nodes-sdk");
const shared_1 = require("@neuron/shared");
const lucide_react_1 = require("lucide-react");
const execution_1 = require("./execution");
exports.transformNode = (0, nodes_sdk_1.createNode)({
    type: "transform",
    template: {
        key: "transform",
        label: "Data Transformer",
        description: `
            Provides a sandboxed environment to execute custom JavaScript logic for data 
            manipulation. Use this node when standard logic gates are insufficient—such as 
            complex array mapping, custom date formatting, or deep object merging. 
            The code has access to the current execution context and must return the 
            transformed data structure for the next step.
        `.trim(),
        category: "Logic",
        icon: lucide_react_1.Code2,
        defaultConfig: {
            code: "// Write your transformation logic here\nreturn inputs;",
            ...(0, shared_1.getBaseConfig)("Custom Code Sandbox"),
        },
    },
    executor: execution_1.executor
});
