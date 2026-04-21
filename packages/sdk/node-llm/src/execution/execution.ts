import {NodeExecutorContext} from "@neuron/shared";
import {LLMNodeConfig} from "../index";
import {parseZodSchema} from "../utils/utils";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import {generateText, Output} from "ai";

const defaultModel = "gemini-2.5-flash" as const;

export const executor = async ({
                                   nodeType,
                                   config,
                                   input,
                               }: NodeExecutorContext) => {

    const {
        model,
        systemPrompt,
        userPrompt,
        temperature,
        apiKey,
        jsonMode,
        outputSchema
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

        console.log(">>>>>>>>>>> Dynamic Zod Schema:", dynamicZodSchema);

        options.output = Output.object({
            schema: dynamicZodSchema
        });
    }

    const { text, output, usage, finishReason } = await generateText(options);

    return {
        // Return the object if in JSON mode, otherwise fallback to text
        content: jsonMode ? output : text,
        usage: {
            promptTokens: usage.inputTokens,
            completionTokens: usage.outputTokens,
            totalTokens: usage.totalTokens,
        },
        finishReason
    };
}