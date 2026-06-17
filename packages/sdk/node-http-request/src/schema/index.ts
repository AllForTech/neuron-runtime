import { NodeConfigSchema } from "@neuron/shared";
import { buildSharedNodeSchema } from "@neuron/nodes-sdk";

export const HTTP_REQUEST_NODE_SCHEMA: NodeConfigSchema = {
    sections: [
        buildSharedNodeSchema()[0],
        {
            id: "request-settings",
            title: "Request Configuration",
            description: "Configure the outgoing HTTP request parameters.",
            layout: "column",
            fields: [
                {
                    id: "method",
                    type: "select",
                    path: "method",
                    label: "HTTP Method",
                    required: true,
                    options: [
                        { label: "GET", value: "GET" },
                        { label: "POST", value: "POST" },
                        { label: "PUT", value: "PUT" },
                        { label: "DELETE", value: "DELETE" }
                    ]
                },
                {
                    id: "url",
                    type: "template",
                    path: "url",
                    label: "URL",
                    placeholder: "https://api.example.com/v1/resource",
                    required: true
                }
            ]
        },
        {
            id: "headers-config",
            title: "Headers",
            description: "Custom HTTP headers for the request.",
            layout: "column",
            fields: [
                {
                    id: "headers",
                    type: "keyvalue",
                    valueType: "template",
                    path: "headers",
                    label: "Request Headers",
                    placeholder: {
                        key: "Content-Type",
                        value: "application/json"
                    }
                }
            ]
        },
        {
            id: "body-config",
            title: "Request Body",
            description: "Data to be sent with POST, PUT, or DELETE requests.",
            layout: "column",
            hidden: (values) => values.method === "GET",
            fields: [
                {
                    id: "body",
                    type: "template",
                    path: "body",
                    label: "Body Payload",
                    placeholder: "{\n  \"id\": \"{{node_id.data}}\"\n}",
                    description: "JSON or text body. You can use {{ to inject variables."
                }
            ]
        },
        ...buildSharedNodeSchema().slice(1)
    ]
};