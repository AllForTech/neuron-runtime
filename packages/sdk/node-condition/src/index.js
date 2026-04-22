"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.conditionNode = void 0;
const nodes_sdk_1 = require("@neuron/nodes-sdk");
const shared_1 = require("@neuron/shared");
const lucide_react_1 = require("lucide-react");
const execution_1 = require("./execution");
exports.conditionNode = (0, nodes_sdk_1.createNode)({
    type: "condition",
    template: {
        key: "condition",
        label: "Condition Gate",
        description: `
            Directs the workflow flow by evaluating a logical expression between two values. 
            This node allows you to compare incoming data—such as checking if a user's ID exists, 
            comparing a numeric balance, or verifying if a string contains a specific keyword. 
            Depending on whether the result is true or false, the execution will proceed down 
            the corresponding output path.
        `.trim(),
        category: "Logic",
        icon: lucide_react_1.Split,
        defaultConfig: {
            leftValue: "",
            operator: "==",
            rightValue: "",
            ...(0, shared_1.getBaseConfig)("Binary Logical Fork"),
        },
    },
    executor: execution_1.executor
});
