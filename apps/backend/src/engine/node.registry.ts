import type {
    ConditionNode,
    DecisionNode,
    HttpRequestNode, IntegrationNode,
    LLMNode,
    TransformNode,
    TriggerNode
} from "@neuron/shared";
import {createGoogleGenerativeAI} from "@ai-sdk/google";
import {generateText} from "ai";
import {getContentType, validateAgainstSchema} from "../utils/execution";
import {decisionNodeExecutor} from "./node-registrys/decision.node";
import {llmNodeExecutor} from "./node-registrys/llm.node";
import {transformNodeExecutor} from "./node-registrys/transform.node";

export const nodeRegistry: any = {
    trigger: async ({ node }: { node: TriggerNode }) => ({
        timestamp: new Date().toISOString(),
        type: node.config?.triggerType || "manual"
    }),

    httpNode: async ({ node }: { node: HttpRequestNode }) => {
        const { url, method, headers = {}, body } = node.config;

        // Ensure the body is a valid string if it was resolved from an object
        const finalBody = typeof body === 'object' ? JSON.stringify(body) : body;

        const res = await fetch(url, {
            method,
            headers: { "Content-Type": "application/json", ...headers },
            body: method !== "GET" ? finalBody : undefined
        } as any);

        if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);
        return await res.json();
    },

    condition: async ({ node }: { node: ConditionNode }) => {
        const { leftValue, operator, rightValue } = node.config;
        switch (operator) {
            case "==": return leftValue == rightValue;
            case "!=": return leftValue != rightValue;
            case ">":  return Number(leftValue) > Number(rightValue);
            case "<":  return Number(leftValue) < Number(rightValue);
            case "exists": return leftValue !== undefined && leftValue !== null;
            default: return false;
        }
    },

    transform: transformNodeExecutor,

    // --- LLM Node Executor
    llmNode: llmNodeExecutor,
    // --- Decision Node Executor
    decisionNode: decisionNodeExecutor,

    // --- INTEGRATION NODE ---
    integrationNode: async ({ node }: { node: IntegrationNode }) => {
        // const { connectionId, integrationId, resource, action, parameters } = node.config;

        // // 1. Resolve the credentials from the Vault using connectionId
        // const credentials = await vaultService.getCredentials(connectionId);
        //
        // // 2. Fetch the "Action Template" for this specific integration
        // // This would likely be a JSON definition on your backend
        // const requestManifest = await integrationService.buildRequest(
        //     integrationId,
        //     resource,
        //     action,
        //     parameters,
        //     credentials
        // );
        //
        // // 3. Execute the standardized request
        // const response = await fetch(requestManifest.url, {
        //     method: requestManifest.method,
        //     headers: requestManifest.headers,
        //     body: JSON.stringify(requestManifest.body)
        // });
        //
        // if (!response.ok) throw new Error(`${integrationId} Error: ${response.statusText}`);
        // return await response.json();
    },

    // --- OUTPUT NODE ---
    outputNode: async ({ node }: { node: any }) => {
        const {
            template,
            format,
            delivery,
            includeMetadata,
            outputSchema,
            label
        } = node.config;

        let processedPayload: any = template;

        // 1. CONTENT-TYPE HIERARCHY & SERIALIZATION
        try {
            switch (format.type) {
                case "json":
                    // Parse the resolved template to ensure it's a valid JS Object
                    processedPayload = typeof template === 'string' ? JSON.parse(template) : template;

                    // VALIDATION LAYER: If Muhammad defined a schema, we check it here
                    if (outputSchema && outputSchema.fields?.length > 0) {
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
                    nodeId: node.id,
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
    },

    // --- CONTEXT NODE ---
    contextNode: async ({ node }: { node: any }) => {
        // Because of your resolveConfig function, 'node.config.fields'
        // is already a Record<string, any> with real values.
        return node.config.fields || {};
    },

    /**
     * RESPOND NODE: The Terminal Sink
     * This node signals the end of a workflow execution cycle.
     */
    respondNode: async ({ node, inputs }: { node: any, inputs: any }) => {
        const { statusCode, body, headers } = node.config;

        console.log("Respond Node Config received:", node.config);

        return {
            __isTerminal: true,
            status: Number(statusCode) || 200,
            headers: {
                "Content-Type": "application/json",
                ...headers
            },
            body: body
        };
    },
};