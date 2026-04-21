import { createNode } from "@neuron/nodes-sdk";
import { BaseNodeConfig, getBaseConfig } from "@neuron/shared";
import { Terminal } from "lucide-react";
import { executor } from "./execution";

export interface DebugNodeConfig extends BaseNodeConfig {
    message: string;
}

export const debugNode = createNode<DebugNodeConfig>({
    type: "debug",

    template: {
        key: "debug",
        label: "Debug Log",
        description: `
            A specialized utility for developers to inspect the state of a workflow in real-time. 
            The Debug Node allows you to log custom messages or specific object properties to 
            the execution feed, making it invaluable for troubleshooting complex data piping 
            and ensuring variable interpolation is functioning as expected.
        `.trim(),
        category: "Utility",
        icon: Terminal,

        defaultConfig: {
            message: "Debugging execution state...",
            ...getBaseConfig("Data Inspector"),
        },
    },

    executor
});