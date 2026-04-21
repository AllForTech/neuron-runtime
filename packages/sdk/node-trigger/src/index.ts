import { createNode } from "@neuron/nodes-sdk";
import { BaseNodeConfig, getBaseConfig } from "@neuron/shared";
import { Zap } from "lucide-react";
import { executor } from "./execution";

/**
 * Configuration for the entry point of a workflow.
 */
export interface TriggerNodeConfig extends BaseNodeConfig {
    triggerType: "manual" | "webhook" | "schedule";
}

export const triggerNode = createNode<TriggerNodeConfig>({
    type: "trigger",

    template: {
        key: "trigger",
        label: "Workflow Trigger",
        description: `
            The starting point for your automation. This node listens for an external signal 
            to begin execution. Supported types include 'Manual' for dashboard-initiated runs, 
            'Webhook' for receiving real-time data from external services via HTTP, 
            and 'Schedule' for recurring, time-based operations.
        `.trim(),
        category: "Core",
        icon: Zap,

        defaultConfig: {
            triggerType: "manual",
            ...getBaseConfig("Workflow Entry Point"),
        },
    },

    executor
});