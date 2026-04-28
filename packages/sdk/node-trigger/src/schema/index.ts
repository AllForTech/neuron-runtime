import { NodeConfigSchema } from "@neuron/shared";
import { buildSharedNodeSchema } from "@neuron/nodes-sdk";

export const TRIGGER_NODE_SCHEMA: NodeConfigSchema = {
    sections: [
        buildSharedNodeSchema()[0],
        {
            id: "trigger-settings",
            title: "Trigger Configuration",
            description: "Define how this workflow is initiated.",
            layout: "column",
            fields: [
                {
                    id: "triggerType",
                    type: "select",
                    path: "triggerType",
                    label: "Trigger Source",
                    required: true,
                    options: [
                        { label: "Manual", value: "manual", description: "Trigger via UI or API call" },
                        { label: "Webhook", value: "webhook", description: "Trigger via HTTP request" },
                        { label: "Schedule (Cron)", value: "schedule", description: "Trigger at specific intervals" }
                    ]
                },
                {
                    id: "cron",
                    type: "text",
                    path: "cron",
                    label: "Cron Expression",
                    placeholder: "*/5 * * * *",
                    description: "Standard crontab format for scheduled execution.",
                    hidden: (values) => values.triggerType !== "schedule",
                    required: true
                }
            ]
        },
        {
            id: "webhook-config",
            title: "Webhook Endpoint",
            description: "Configuration for incoming HTTP requests.",
            layout: "grid",
            hidden: (values) => values.triggerType !== "webhook",
            fields: [
                {
                    id: "webhook-method",
                    type: "select",
                    path: "webhook.method",
                    label: "Method",
                    required: true,
                    options: [
                        { label: "GET", value: "GET" },
                        { label: "POST", value: "POST" },
                        { label: "PUT", value: "PUT" },
                        { label: "DELETE", value: "DELETE" },
                        { label: "ALL", value: "ALL" }
                    ]
                },
                {
                    id: "webhook-path",
                    type: "text",
                    path: "webhook.path",
                    label: "Custom Path",
                    placeholder: "my-endpoint-name"
                }
            ]
        },
        {
            id: "webhook-payload",
            title: "Expected Payload",
            description: "Define the structure of data sent to this webhook.",
            layout: "column",
            hidden: (values) => values.triggerType !== "webhook",
            fields: [
                {
                    id: "webhook-body",
                    type: "code",
                    path: "webhookData.body",
                    label: "Sample Body (JSON)",
                    placeholder: "{ \"key\": \"value\" }"
                }
            ]
        },
        ...buildSharedNodeSchema().slice(1)
    ]
};