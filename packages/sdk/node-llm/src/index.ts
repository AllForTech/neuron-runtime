import { createNode } from "@neuron/nodes-sdk";
import { BaseNodeConfig, getBaseConfig } from "@neuron/shared";
import { BrainCircuit } from "lucide-react";
import { executor } from "./execution";

export interface LLMNodeConfig extends BaseNodeConfig {
    provider: string;
    model: string;
    systemPrompt: string;
    userPrompt: string;
    temperature: number;
    maxTokens: number;
    apiKey: string;
    jsonMode: boolean;
}

export const llmNode = createNode<LLMNodeConfig>({
    type: "AI.Llm",

    template: {
        key: "llmNode",
        label: "AI Processor",
        description: `
            Leverages Large Language Models to analyze, transform, or generate content within 
            your workflow. This node supports multiple providers and allows for complex 
            prompting strategies, including system role definitions and temperature control. 
            Enable 'JSON Mode' to force the AI to return structured data that can be 
            immediately parsed and used by downstream nodes in your automation chain.
        `.trim(),
        category: "AI",
        icon: BrainCircuit,

        defaultConfig: {
            provider: "openai",
            model: "gpt-4o",
            systemPrompt: "You are a helpful assistant.",
            userPrompt: "",
            temperature: 0.7,
            maxTokens: 1000,
            apiKey: "",
            jsonMode: true,
            ...getBaseConfig("AI Content Engine"),
        },
    },

    executor
});