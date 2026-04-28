import { NodeConfigSchema } from "@neuron/shared";
import { buildSharedNodeSchema } from "@neuron/nodes-sdk";

export const RESPOND_NODE_SCHEMA: NodeConfigSchema = {
    sections: [
        buildSharedNodeSchema()[0],
        {
            id: "response-status",
            title: "Response Status",
            description: "Set the HTTP status and basic response behavior.",
            layout: "grid",
            fields: [
                {
                    id: "statusCode",
                    type: "template",
                    path: "statusCode",
                    label: "Status Code",
                    placeholder: "200",
                    required: true,
                    description: "Supports dynamic values (e.g., {{node.status}})."
                },
                {
                    id: "attachContext",
                    type: "switch",
                    path: "attachContext",
                    label: "Attach Workflow Context",
                    description: "Includes global context data in the response object."
                }
            ]
        },
        {
            id: "response-headers",
            title: "HTTP Headers",
            description: "Custom headers to be sent back to the requester.",
            layout: "column",
            fields: [
                {
                    id: "headers",
                    type: "object",
                    path: "headers",
                    label: "Response Headers",
                    fields: [
                        {
                            id: "header-key",
                            type: "text",
                            path: "key",
                            label: "Header Name",
                            placeholder: "Content-Type"
                        },
                        {
                            id: "header-value",
                            type: "template",
                            path: "value",
                            label: "Value",
                            placeholder: "application/json"
                        }
                    ]
                }
            ]
        },
        {
            id: "response-body",
            title: "Response Body",
            description: "The data payload to be returned.",
            layout: "column",
            fields: [
                {
                    id: "body",
                    type: "template",
                    path: "body",
                    label: "Body Content",
                    placeholder: "{\n  \"status\": \"success\",\n  \"data\": {{transform_node.output}}\n}",
                    required: true
                }
            ]
        },
        {
            id: "response-options",
            title: "Advanced Options",
            description: "Fine-tune the response delivery and formatting.",
            layout: "grid",
            collapsible: true,
            defaultCollapsed: true,
            fields: [
                {
                    id: "minify",
                    type: "switch",
                    path: "options.minify",
                    label: "Minify Body",
                    description: "Strip whitespace from JSON responses."
                },
                {
                    id: "includeTraceId",
                    type: "switch",
                    path: "options.includeTraceId",
                    label: "Include Trace ID",
                    description: "Append the execution ID to the response headers."
                },
                {
                    id: "errorOnEmpty",
                    type: "switch",
                    path: "options.errorOnEmpty",
                    label: "Error on Empty",
                    description: "Throw an exception if the body is null or undefined."
                }
            ]
        },
        ...buildSharedNodeSchema().slice(1)
    ]
};