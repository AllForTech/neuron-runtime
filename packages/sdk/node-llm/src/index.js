"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.llmNode = void 0;
const nodes_sdk_1 = require("@neuron/nodes-sdk");
const shared_1 = require("@neuron/shared");
const lucide_react_1 = require("lucide-react");
const execution_1 = require("./execution");
exports.llmNode = (0, nodes_sdk_1.createNode)({
    type: "llmNode",
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
        category: "Intelligence",
        icon: lucide_react_1.BrainCircuit,
        defaultConfig: {
            provider: "openai",
            model: "gpt-4o",
            systemPrompt: "You are a helpful assistant.",
            userPrompt: "",
            temperature: 0.7,
            maxTokens: 1000,
            apiKey: "",
            jsonMode: true,
            ...(0, shared_1.getBaseConfig)("AI Content Engine"),
        },
    },
    executor: execution_1.executor
});
