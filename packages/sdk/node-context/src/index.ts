import { createNode } from "@neuron/nodes-sdk";
import { BaseNodeConfig, getBaseConfig } from "@neuron/shared";
import { executor } from "./execution/index.js";

export interface ContextNodeConfig extends BaseNodeConfig {
    label: string;
    fields: Record<string, any>;
}

export const contextNode = createNode<ContextNodeConfig>({
    type: "Utility.Context",

    template: {
        key: "contextNode",
        label: "Context Memory",
        description: `
            Acts as a centralized data repository for storing and retrieving information 
            across the entire execution lifecycle. The Context Node allows you to define 
            a global state (e.g., 'currentUser' or 'orderTotal') that can be updated and 
            read by any other node in the workflow. This is essential for long-running 
            automations where information gathered at the start needs to be preserved for 
            final processing or conditional logic.
        `.trim(),
        category: "Utility",
        icon: "Database",

        defaultConfig: {
            label: "Global State",
            fields: {},
            ...getBaseConfig("Execution Memory Store"),
        },
    },

    executor
});