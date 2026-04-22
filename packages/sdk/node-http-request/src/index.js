"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.httpNode = void 0;
const nodes_sdk_1 = require("@neuron/nodes-sdk");
const shared_1 = require("@neuron/shared");
const lucide_react_1 = require("lucide-react");
const executor_1 = require("./executor");
exports.httpNode = (0, nodes_sdk_1.createNode)({
    type: "httpNode",
    template: {
        key: "httpNode",
        label: "HTTP Request",
        description: `
            The fundamental bridge between Neuron and the external web. This node enables 
            your workflow to communicate with any third-party REST API by sending 
            standardized HTTP requests (GET, POST, etc.). It supports custom headers 
            for authentication, dynamic body payloads for data submission, and provides 
            a structured response object that can be utilized by downstream nodes 
            for processing, storage, or transformation.
        `.trim(),
        category: "Network",
        icon: lucide_react_1.Globe,
        defaultConfig: {
            url: "",
            method: "GET",
            headers: {
                "Accept": "application/json",
                "Content-Type": "application/json"
            },
            body: {},
            ...(0, shared_1.getBaseConfig)("External API Communication"),
        },
    },
    executor: executor_1.executor
});
