import { NodeConfigSchema } from "@neuron/shared";
import { buildSharedNodeSchema } from "@neuron/nodes-sdk";

export const INTEGRATION_NODE_SCHEMA: NodeConfigSchema = {
    sections: [
        buildSharedNodeSchema()[0],
        {
            id: "integration-auth",
            title: "Connection Details",
            description: "Select the service and authorization to use for this action.",
            layout: "grid",
            fields: [
                {
                    id: "integrationId",
                    type: "select",
                    path: "integrationId",
                    label: "Service",
                    required: true,
                    options: [
                        { label: "Slack", value: "slack" },
                        { label: "Google Drive", value: "google_drive" },
                        { label: "GitHub", value: "github" },
                        { label: "Asana", value: "asana" }
                    ]
                },
                {
                    id: "connectionId",
                    type: "select",
                    path: "connectionId",
                    label: "Account Connection",
                    required: true,
                    description: "Choose your linked account.",
                    options: [
                        { label: "Slack", value: "slack" },
                        { label: "Google Drive", value: "google_drive" },
                        { label: "GitHub", value: "github" },
                        { label: "Asana", value: "asana" }
                    ]
                }
            ]
        },
        {
            id: "action-settings",
            title: "Action Configuration",
            description: "Specify the exact resource and operation to perform.",
            layout: "grid",
            fields: [
                {
                    id: "resource",
                    type: "text",
                    path: "resource",
                    label: "Resource",
                    placeholder: "e.g. Channel, File, Repository",
                    required: true
                },
                {
                    id: "action",
                    type: "text",
                    path: "action",
                    label: "Action",
                    placeholder: "e.g. SendMessage, Upload, CreateIssue",
                    required: true
                }
            ]
        },
        {
            id: "parameters-config",
            title: "Parameters",
            description: "Provide the necessary inputs for this integration action.",
            layout: "column",
            fields: [
                {
                    id: "parameters",
                    type: "object",
                    path: "parameters",
                    label: "Input Parameters",
                    fields: [
                        {
                            id: "param-key",
                            type: "text",
                            path: "key",
                            label: "Parameter Name"
                        },
                        {
                            id: "param-value",
                            type: "template",
                            path: "value",
                            label: "Value",
                            placeholder: "Enter value or {{variable}}"
                        }
                    ]
                }
            ]
        },
        ...buildSharedNodeSchema().slice(1)
    ]
};