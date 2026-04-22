import { createNode } from "@neuron/nodes-sdk";
import { BaseNodeConfig, getBaseConfig } from "@neuron/shared";
import { FileJson } from "lucide-react";
import { executor } from "./execution";

export interface OutputNodeConfig extends BaseNodeConfig {
    label: string;
    template: string;
    format: {
        type: "json" | "markdown" | "text" | "html" | "csv";
        minify?: boolean;
        syntaxHighlight?: boolean;
    };
    delivery: {
        mode: "webhook_response" | "stored_result" | "notification";
        isPrimary: boolean;
        statusCode?: number;
    };
    includeMetadata: boolean;
}

export const outputNode = createNode<OutputNodeConfig>({
    type: "Utility.Output",

    template: {
        key: "outputNode",
        label: "Data Formatter",
        description: `
            Transforms internal execution data into highly structured and formatted outputs. 
            Whether you need to generate a Markdown report, a minified JSON payload for 
            a webhook, or a clean HTML table for an email, this node provides the 
            necessary templating and syntax tools. It defines how the final 'answer' 
            of your workflow is presented and delivered to the end-user or downstream system.
        `.trim(),
        category: "Utility",
        icon: FileJson,

        defaultConfig: {
            label: "Formatted Output",
            template: "",
            format: {
                type: "json",
                minify: false,
                syntaxHighlight: true,
            },
            delivery: {
                mode: "stored_result",
                isPrimary: false,
            },
            includeMetadata: true,
            ...getBaseConfig("Final Presentation Layer"),
        },
    },

    executor
});