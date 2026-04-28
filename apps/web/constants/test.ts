import {NodeConfigSchema} from "@neuron/shared";
import {getValueAtPath} from "@/lib/config/path";

export const MOCK_CONFIG_SCHEMA: NodeConfigSchema = {
    sections: [
        {
            id: "general_settings",
            title: "General Configuration",
            description: "Core settings for the node execution",
            layout: "column",
            fields: [
                {
                    id: "node_name",
                    type: "text",
                    path: "metadata.name",
                    label: "Internal Label",
                    placeholder: "Enter node name...",
                    defaultValue: "New AI Node"
                },
                {
                    id: "provider",
                    type: "select",
                    path: "provider",
                    label: "Service Provider",
                    defaultValue: "openai",
                    options: [
                        { label: "OpenAI", value: "openai", description: "Use GPT-4o or GPT-3.5" },
                        { label: "Anthropic", value: "anthropic", description: "Use Claude 3.5 Sonnet" },
                        { label: "Custom API", value: "custom", description: "Connect to a private LLM" }
                    ]
                }
            ]
        },
        {
            id: "advanced_logic",
            title: "Advanced Logic & Visibility",
            collapsible: true,
            fields: [
                {
                    id: "enable_retry",
                    type: "switch",
                    path: "retry.enabled",
                    label: "Enable Auto-Retry",
                    defaultValue: false
                },
                {
                    id: "retry_count",
                    type: "number",
                    path: "retry.maxAttempts",
                    label: "Max Attempts",
                    min: 1,
                    max: 10,
                    defaultValue: 3,
                    // VISIBILITY CHECK: Only show if enable_retry is true
                    hidden: (values) => !getValueAtPath(values, "retry.enabled")
                },
                {
                    id: "custom_endpoint",
                    type: "text",
                    path: "custom.url",
                    label: "Custom API URL",
                    placeholder: "https://your-proxy.com/v1",
                    // VISIBILITY CHECK: Only show if provider is 'custom'
                    hidden: (values) => getValueAtPath(values, "provider") !== "custom"
                }
            ]
        },
        {
            id: "headers_section",
            title: "Request Headers",
            description: "Define dynamic headers for the outgoing request",
            fields: [
                {
                    id: "headers_list",
                    type: "array",
                    path: "headers",
                    label: "Headers",
                    itemLabel: "Header Pair",
                    defaultItem: { key: "", value: "" },
                    fields: [
                        {
                            id: "h_key",
                            type: "text",
                            path: "key", // Path is relative to the array item index
                            label: "Key",
                            placeholder: "Content-Type"
                        },
                        {
                            id: "h_val",
                            type: "text",
                            path: "value",
                            label: "Value",
                            placeholder: "application/json"
                        }
                    ]
                }
            ]
        },
        {
            id: "payload_settings",
            title: "Payload Construction",
            fields: [
                {
                    id: "body_config",
                    type: "object",
                    path: "body",
                    label: "JSON Body Settings",
                    fields: [
                        {
                            id: "body_type",
                            type: "select",
                            path: "type",
                            label: "Format",
                            defaultValue: "json",
                            options: [
                                { label: "JSON", value: "json" },
                                { label: "Form Data", value: "form" }
                            ]
                        },
                        {
                            id: "raw_json",
                            type: "textarea",
                            path: "raw",
                            label: "Raw Content",
                            hidden: (values) => getValueAtPath(values, "body.type") !== "json"
                        }
                    ]
                }
            ]
        }
    ]
};