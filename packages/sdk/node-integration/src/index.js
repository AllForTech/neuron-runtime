"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.integrationNode = void 0;
const nodes_sdk_1 = require("@neuron/nodes-sdk");
const shared_1 = require("@neuron/shared");
const lucide_react_1 = require("lucide-react");
const execution_1 = require("./execution");
exports.integrationNode = (0, nodes_sdk_1.createNode)({
    type: "integrationNode",
    template: {
        key: "integrationNode",
        label: "Service Integration",
        description: `
            Enables seamless connectivity with popular third-party platforms and internal 
            services. This node simplifies complex API interactions by providing a 
            pre-configured interface for specific actions—such as sending a Slack message, 
            creating a Stripe customer, or fetching Discord user data. It handles 
            authentication and parameter mapping automatically, allowing you to focus on 
            workflow logic rather than API documentation.
        `.trim(),
        category: "Integrations",
        icon: lucide_react_1.Layers,
        defaultConfig: {
            connectionId: "",
            integrationId: "",
            resource: "",
            action: "",
            parameters: {},
            ...(0, shared_1.getBaseConfig)("Third-Party Connector"),
        },
    },
    executor: execution_1.executor
});
