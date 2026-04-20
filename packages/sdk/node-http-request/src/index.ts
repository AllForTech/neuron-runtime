import { createNode } from "@neuron/nodes-sdk";
import {BaseNodeConfig, getBaseConfig} from "@neuron/shared";
import { Globe } from "lucide-react";
import {executor} from "./executor";

export interface HttpNodeConfig extends BaseNodeConfig {
    url: string;
    method: "GET" | "POST";
    headers?: Record<string, string>;
    body?: Record<string, any>;
}

export const httpNode = createNode<HttpNodeConfig>({
    type: "httpNode",

    template: {
        key: "httpNode",
        label: "HTTP Request",
        description: "Make an external API request",
        category: "Network",
        icon: Globe,

        defaultConfig: {
            url: "",
            method: "GET",
            headers: {},
            body: {},
            ...getBaseConfig('External API Call'),
        },
    },

    executor
});