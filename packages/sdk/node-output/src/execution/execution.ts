import { NodeExecutor, NodeExecutorContext, ExecutorOutput, validateAgainstSchema } from "@neuron/shared";
import { OutputNodeConfig } from "../index.js";

export const executor: NodeExecutor = async ({
                                                 config,
                                             }: NodeExecutorContext): Promise<ExecutorOutput> => {
    const {
        template,
        format,
        delivery,
        includeMetadata,
        outputSchema,
        label,
    } = config as OutputNodeConfig;

    let processedPayload: any = template;

    try {
        switch (format.type) {
            case "json":
                processedPayload = typeof template === 'string' ? JSON.parse(template) : template;

                if (outputSchema) {
                    validateAgainstSchema(processedPayload, outputSchema);
                }

                if (format.minify) {
                    processedPayload = JSON.stringify(processedPayload);
                } else if (typeof processedPayload === 'object') {
                    processedPayload = JSON.stringify(processedPayload, null, 2);
                }
                break;

            case "markdown":
                processedPayload = template;
                break;

            case "html":
            case "text":
                processedPayload = String(template).trim();

                if (includeMetadata) {
                    processedPayload += `\n`;
                }
                break;
        }
    } catch (e: any) {
        throw new Error(`Serialization Error in [${label}]: ${e.message}`);
    }

    if (includeMetadata && format.type === "json") {
        try {
            const jsonObj = typeof processedPayload === 'string' ? JSON.parse(processedPayload) : processedPayload;
            jsonObj._telemetry = {
                timestamp: new Date().toISOString(),
                statusCode: delivery.statusCode || 200,
                isPrimary: delivery.isPrimary
            };
            processedPayload = format.minify ? JSON.stringify(jsonObj) : JSON.stringify(jsonObj, null, 2);
        } catch { }
    }

    return {
        success: true,
        output: {
            content: processedPayload,
            format: format.type,
            isPrimary: delivery.isPrimary
        }
    };
}