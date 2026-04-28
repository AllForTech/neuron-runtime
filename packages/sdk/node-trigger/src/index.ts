import { createNode } from "@neuron/nodes-sdk";
import { BaseNodeConfig, getBaseConfig } from "@neuron/shared";


export interface TriggerNodeConfig extends BaseNodeConfig {
    triggerType: "manual" | "webhook" | "schedule";
    cron?: string;
    webhook?: {
        method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'ALL';
        path?: string;
    };
    webhookData?: {
        body: any;
        query: Record<string, any>;
        headers: Record<string, any>;
    };
}

export const triggerNode = createNode<TriggerNodeConfig>({
    type: "Trigger.Webhook",

    template: {
        key: "trigger",
        label: "Workflow Trigger",
        description: `
            The starting point for your automation. This node listens for an external signal 
            to begin execution. Supported types include 'Manual' for dashboard-initiated runs, 
            'Webhook' for receiving real-time data from external services via HTTP, 
            and 'Schedule' for recurring, time-based operations.
        `.trim(),
        category: "Trigger",
        icon: "Zap",

        defaultConfig: {
            triggerType: "manual",
            ...getBaseConfig("Workflow Entry Point"),
        },
    }
});