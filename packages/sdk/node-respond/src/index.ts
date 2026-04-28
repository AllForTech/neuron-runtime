import { createNode } from "@neuron/nodes-sdk";
import { BaseNodeConfig, getBaseConfig } from "@neuron/shared";
import {RESPOND_NODE_SCHEMA} from "./schema";

export interface RespondNodeConfig extends BaseNodeConfig {
    statusCode: number | string;
    headers: Record<string, string>;
    body: Record<string, any> | string;
    options: {
        minify: boolean;
        includeTraceId: boolean;
        errorOnEmpty: boolean;
    };
    sourceNodeId?: string;
    attachContext: boolean;
}

export const respondNode = createNode<RespondNodeConfig>({
    type: "Network.Respond",

    template: {
        key: "respondNode",
        label: "HTTP Response",
        description: `
            Finalizes the current execution by returning a structured HTTP response to the caller. 
            This node is typically used in Webhook-triggered workflows to send back status codes, 
            JSON payloads, or custom headers. It marks the termination of the request-response 
            lifecycle and can optionally attach the full execution context for tracing.
        `.trim(),
        category: "Network",
        icon: "Send",

        defaultConfig: {
            statusCode: 200,
            headers: { "Content-Type": "application/json" },
            body: { success: true },
            options: {
                minify: false,
                includeTraceId: true,
                errorOnEmpty: false,
            },
            attachContext: false,
            ...getBaseConfig("Terminal Response"),
        },
    },

    schema: RESPOND_NODE_SCHEMA
});