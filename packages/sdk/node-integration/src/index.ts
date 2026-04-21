import { createNode } from "@neuron/nodes-sdk";
import { BaseNodeConfig, getBaseConfig } from "@neuron/shared";
import { Layers } from "lucide-react";
import { executor } from "./execution";

export interface IntegrationNodeConfig extends BaseNodeConfig {
    connectionId: string;
    integrationId: string;
    resource: string;
    action: string;
    parameters: Record<string, any>;
}

export const integrationNode = createNode<IntegrationNodeConfig>({
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
        icon: Layers,

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