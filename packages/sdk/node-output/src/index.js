"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.outputNode = void 0;
const nodes_sdk_1 = require("@neuron/nodes-sdk");
const shared_1 = require("@neuron/shared");
const lucide_react_1 = require("lucide-react");
const execution_1 = require("./execution");
exports.outputNode = (0, nodes_sdk_1.createNode)({
    type: "outputNode",
    template: {
        key: "outputNode",
        label: "Data Formatter",
        description: `
            Transforms internal execution data into highly structured and formatted outputs. 
            Whether you need to generate a Markdown report, a minified JSON payload for 
            a webhook, or a clean HTML table for an email, this node provides the 
            necessary templating and syntax tools. It defines how the final 'answer' 
            of your workflow is presented and delivered to the end-user or downstream system.
        `.trim(),
        category: "Network",
        icon: lucide_react_1.FileJson,
        defaultConfig: {
            label: "Formatted Output",
            template: "",
            format: {
                type: "json",
                minify: false,
                syntaxHighlight: true,
            },
            delivery: {
                mode: "stored_result",
                isPrimary: false,
            },
            includeMetadata: true,
            ...(0, shared_1.getBaseConfig)("Final Presentation Layer"),
        },
    },
    executor: execution_1.executor
});
