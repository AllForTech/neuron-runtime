import { NodeConfigSchema } from "@neuron/shared";
import { buildSharedNodeSchema } from "@neuron/nodes-sdk";

export const LLM_NODE_SCHEMA: NodeConfigSchema = {
    sections: [
        buildSharedNodeSchema()[0],
        {
            id: "model-settings",
            title: "Model Configuration",
            description: "Select your AI provider and tune the generation parameters.",
            layout: "column",
            fields: [
                {
                    id: "provider",
                    type: "select",
                    path: "provider",
                    label: "Provider",
                    required: true,
                    options: [
                        { label: "OpenAI", value: "openai" },
                        { label: "Anthropic", value: "anthropic" },
                        { label: "Mistral", value: "mistral" },
                        { label: "Groq", value: "groq" }
                    ]
                },
                {
                    id: "model",
                    type: "text",
                    path: "model",
                    label: "Model ID",
                    placeholder: "gpt-4o or claude-3-5-sonnet",
                    required: true
                },
                {
                    id: "apiKey",
                    type: "template",
                    path: "apiKey",
                    label: "API Key",
                    placeholder: "sk-...",
                    description: "Your provider API key. Stored securely."
                },
                {
                    id: "jsonMode",
                    type: "switch",
                    path: "jsonMode",
                    label: "JSON Mode",
                    description: "Force the model to output valid JSON."
                }
            ]
        },
        {
            id: "output-schema",
            title: "Output Schema",
            description: "Define the output schema of the Ai respond.",
            layout: "dialog",
            hidden: (values) => values.jsonMode === true,
            fields: [
                {
                    id: "outputSchema",
                    type: "template",
                    path: "outputSchema",
                    label: "Respond Schema",
                    placeholder: "Use json or zod schema",
                    description: "Provide an output schema for the Ai respond.",
                }
            ]
        },
        {
            id: "prompt-settings",
            title: "Prompts",
            description: "Define the personality and instructions for the AI.",
            layout: "dialog",
            fields: [
                {
                    id: "systemPrompt",
                    type: "template",
                    path: "systemPrompt",
                    label: "System Instructions",
                    placeholder: "You are a helpful assistant...",
                    description: "High-level instructions to guide the model's behavior."
                },
                {
                    id: "userPrompt",
                    type: "template",
                    path: "userPrompt",
                    label: "User Prompt",
                    placeholder: "Summarize this: {{previous_node.output}}",
                    required: true,
                    description: "The specific request or data sent to the AI."
                }
            ]
        },
        {
            id: "advanced-settings",
            title: "Sampling Parameters",
            description: "Fine-tune the output randomness and length.",
            layout: "grid",
            collapsible: true,
            defaultCollapsed: true,
            fields: [
                {
                    id: "temperature",
                    type: "number",
                    path: "temperature",
                    label: "Temperature",
                    min: 0,
                    max: 2,
                    step: 0.1,
                    defaultValue: 0.7
                },
                {
                    id: "maxTokens",
                    type: "number",
                    path: "maxTokens",
                    label: "Max Tokens",
                    min: 1,
                    max: 128000,
                    defaultValue: 2048
                }
            ]
        },
        ...buildSharedNodeSchema().slice(1)
    ]
};