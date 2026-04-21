import {NodeExecutorContext, validateAgainstSchema} from "@neuron/shared";
import {OutputNodeConfig} from "../index";

export const executor = async ({
                                   nodeType,
                                   config,
                                   input,
                               }: NodeExecutorContext) => {

    const {
        template,
        format,
        delivery,
        includeMetadata,
        outputSchema,
        label,
    } = config as OutputNodeConfig;

    let processedPayload: any = template;

    // 1. CONTENT-TYPE HIERARCHY & SERIALIZATION
    try {
        switch (format.type) {
            case "json":
                // Parse the resolved template to ensure it's a valid JS Object
                processedPayload = typeof template === 'string' ? JSON.parse(template) : template;

                if (outputSchema) {
                    validateAgainstSchema(processedPayload, outputSchema);
                }

                // Apply Minification if requested
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
                // For document types, we ensure it's a clean string
                processedPayload = String(template).trim();

                // If metadata is requested for a document, we append it as a comment
                if (includeMetadata) {
                    const metaString = `\n`;
                    processedPayload += metaString;
                }
                break;
        }
    } catch (e: any) {
        // Production Safety: Don't crash the engine, but flag the error in the output
        throw new Error(`Serialization Error in [${label}]: ${e.message}`);
    }

    // 2. TELEMETRY INJECTION (For JSON objects)
    if (includeMetadata && format.type === "json") {
        try {
            const jsonObj = typeof processedPayload === 'string' ? JSON.parse(processedPayload) : processedPayload;
            jsonObj._telemetry = {
                timestamp: new Date().toISOString(),
                statusCode: delivery.statusCode || 200,
                isPrimary: delivery.isPrimary
            };
            processedPayload = format.minify ? JSON.stringify(jsonObj) : JSON.stringify(jsonObj, null, 2);
        } catch { /* Fail silently if payload was modified to string already */ }
    }

    // 3. STANDARDIZED RETURN FOR ENGINE SINK
    console.log(processedPayload);
    // return {
    //     content: processedPayload,
    //     contentType: getContentType(format.type),
    //     metadata: {
    //         label,
    //         isPrimary: delivery.isPrimary,
    //         statusCode: delivery.statusCode || 200,
    //         deliveryMode: delivery.mode,
    //         schemaValid: true // Flag for the UI/Jaguar logs
    //     }
    // };
    return processedPayload;
}