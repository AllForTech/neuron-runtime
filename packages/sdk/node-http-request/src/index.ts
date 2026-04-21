import { createNode } from "@neuron/nodes-sdk";
import { BaseNodeConfig, getBaseConfig } from "@neuron/shared";
import { Globe } from "lucide-react";
import { executor } from "./executor";

/**
 * Configuration for making standardized REST API calls.
 */
export interface HttpNodeConfig extends BaseNodeConfig {
    url: string;
    method: "GET" | "POST" | "PUT" | "DELETE";
    headers?: Record<string, string>;
    body?: Record<string, any>;
}

export const httpNode = createNode<HttpNodeConfig>({
    type: "httpNode",

    template: {
        key: "httpNode",
        label: "HTTP Request",
        description: `
            The fundamental bridge between Neuron and the external web. This node enables 
            your workflow to communicate with any third-party REST API by sending 
            standardized HTTP requests (GET, POST, etc.). It supports custom headers 
            for authentication, dynamic body payloads for data submission, and provides 
            a structured response object that can be utilized by downstream nodes 
            for processing, storage, or transformation.
        `.trim(),
        category: "Network",
        icon: Globe,

        defaultConfig: {
            url: "",
            method: "GET",
            headers: {
                "Accept": "application/json",
                "Content-Type": "application/json"
            },
            body: {},
            ...getBaseConfig("External API Communication"),
        },
    },

    executor
});