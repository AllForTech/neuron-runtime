"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.decisionNode = void 0;
const nodes_sdk_1 = require("@neuron/nodes-sdk");
const shared_1 = require("@neuron/shared");
const lucide_react_1 = require("lucide-react");
const execution_1 = require("./execution");
exports.decisionNode = (0, nodes_sdk_1.createNode)({
    type: "decisionNode",
    template: {
        key: "decisionNode",
        label: "Multi-Route Switch",
        description: `
            Functions as a 'Switch' statement for your workflow, allowing for complex 
            multi-path routing based on defined rules. Unlike the binary Condition Gate, 
            the Decision Node evaluates an input against multiple cases and directs the 
            execution to the first matching branch. This is ideal for handling 
            different categories of API requests or status-based logic.
        `.trim(),
        category: "Logic",
        icon: lucide_react_1.GitBranch,
        defaultConfig: {
            input: "",
            inputTransforms: [],
            rules: [],
            includeDefault: true,
            ...(0, shared_1.getBaseConfig)("Advanced Multi-Path Router"),
        },
    },
    executor: execution_1.executor
});
