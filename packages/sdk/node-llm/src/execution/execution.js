"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.executor = void 0;
const utils_1 = require("../utils/utils");
const google_1 = require("@ai-sdk/google");
const ai_1 = require("ai");
const defaultModel = "gemini-2.5-flash";
const executor = async ({ config, }) => {
    const { systemPrompt, userPrompt, temperature, apiKey, jsonMode, outputSchema } = config;
    if (!apiKey || apiKey.includes("{{")) {
        throw new Error("AI Execution Error: API Key resolution failed.");
    }
    const google = (0, google_1.createGoogleGenerativeAI)({ apiKey });
    const options = {
        model: google(defaultModel),
        prompt: userPrompt,
        system: systemPrompt,
        temperature: temperature,
    };
    if (jsonMode && outputSchema) {
        const dynamicZodSchema = (0, utils_1.parseZodSchema)(outputSchema);
        options.output = ai_1.Output.object({
            schema: dynamicZodSchema
        });
    }
    const { text, output, usage, finishReason } = await (0, ai_1.generateText)(options);
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
};
exports.executor = executor;
