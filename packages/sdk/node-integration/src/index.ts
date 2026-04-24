import { createNode } from "@neuron/nodes-sdk";
import { BaseNodeConfig, getBaseConfig } from "@neuron/shared";
import { executor } from "./execution/index.js";

export interface IntegrationNodeConfig extends BaseNodeConfig {
    connectionId: string;
    integrationId: string;
    resource: string;
    action: string;
    parameters: Record<string, any>;
}

export const integrationNode = createNode<IntegrationNodeConfig>({
    type: "Integration.Service",

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
        category: "Integration",
        icon: "Layers",

        defaultConfig: {
            connectionId: "",
            integrationId: "",
            resource: "",
            action: "",
            parameters: {},
            ...getBaseConfig("Third-Party Connector"),
        },
    },

    executor
});