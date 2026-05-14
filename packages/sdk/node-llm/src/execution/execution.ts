import { NodeExecutor, NodeExecutorContext, ExecutorOutput } from "@neuron/shared";
import { LLMNodeConfig } from "../index.js";
import { parseZodSchema } from "../utils/utils.js";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { generateText, Output } from "ai";

const defaultModel = "gemini-2.5-flash" as const;

export const llmNodeExecutor: NodeExecutor = async ({
                                                 config,
                                             }: NodeExecutorContext): Promise<ExecutorOutput> => {

    const {
        systemPrompt,
        userPrompt,
        temperature,
        apiKey,
        jsonMode,
        outputSchema,
        provider,
        model
    } = config as LLMNodeConfig;

    if (!apiKey || apiKey.includes("{{")) {
        throw new Error("AI Execution Error: API Key resolution failed.");
    }

    const google = createGoogleGenerativeAI({ apiKey });

    const options: any = {
        model: google(defaultModel),
        prompt: userPrompt,
        system: systemPrompt,
        temperature: temperature,
    };

    if (jsonMode && outputSchema) {
        const dynamicZodSchema = parseZodSchema(outputSchema);

        options.output = Output.object({
            schema: dynamicZodSchema
        });
    }

    const { text, output, usage, finishReason } = await generateText(options);

    return {
        success: true,
        output: {
            content: jsonMode ? output : text,
            usage: {
                promptTokens: usage.inputTokens,
                completionTokens: usage.outputTokens,
                totalTokens: usage.totalTokens,
            },
            finishReason
        }
    };
}