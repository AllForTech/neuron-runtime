import {LLMNode} from "@neuron/shared";
import {createGoogleGenerativeAI} from "@ai-sdk/google";
import {generateText} from "ai";

export const llmNodeExecutor = async ({ node }: { node: LLMNode }) => {
    const {
        model,
        systemPrompt,
        userPrompt,
        temperature,
        apiKey,
        maxTokens
    } = node.config;

    // 1. Validation
    console.log("LLM node Config: ", node);
    if (!apiKey || apiKey.includes("{{")) {
        throw new Error("Google LLM Error: API Key not resolved.");
    }

    const google = createGoogleGenerativeAI({
        apiKey: apiKey
    });

    // 3. Generate Text
    const { text, usage, finishReason } = await generateText({
        model: google('gemini-2.5-flash'),
        prompt: userPrompt,
        system: systemPrompt,
        // maxOutputTokens: maxTokens,
        temperature: temperature,
    });

    return {
        content: text,
        usage: {
            promptTokens: usage.inputTokens,
            completionTokens: usage.outputTokens,
            totalTokens: usage.totalTokens,
        },
        finishReason
    };
}