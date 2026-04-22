"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.respondNode = void 0;
const nodes_sdk_1 = require("@neuron/nodes-sdk");
const shared_1 = require("@neuron/shared");
const lucide_react_1 = require("lucide-react");
const execution_1 = require("./execution");
exports.respondNode = (0, nodes_sdk_1.createNode)({
    type: "respondNode",
    template: {
        key: "respondNode",
        label: "HTTP Response",
        description: `
            Finalizes the current execution by returning a structured HTTP response to the caller. 
            This node is typically used in Webhook-triggered workflows to send back status codes, 
            JSON payloads, or custom headers. It marks the termination of the request-response 
            lifecycle and can optionally attach the full execution context for tracing.
        `.trim(),
        category: "Network",
        icon: lucide_react_1.Send,
        defaultConfig: {
            statusCode: 200,
            headers: { "Content-Type": "application/json" },
            body: { success: true },
            options: {
                minify: false,
                includeTraceId: true,
                errorOnEmpty: false,
            },
            attachContext: false,
            ...(0, shared_1.getBaseConfig)("Terminal Response"),
        },
    },
    executor: execution_1.executor
});
