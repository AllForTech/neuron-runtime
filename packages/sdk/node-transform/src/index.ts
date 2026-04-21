import { createNode } from "@neuron/nodes-sdk";
import { BaseNodeConfig, getBaseConfig } from "@neuron/shared";
import { Code2 } from "lucide-react";
import { executor } from "./execution";

export interface TransformNodeConfig extends BaseNodeConfig {
    code: string;
}

export const transformNode = createNode<TransformNodeConfig>({
    type: "transform",

    template: {
        key: "transform",
        label: "Data Transformer",
        description: `
            Provides a sandboxed environment to execute custom JavaScript logic for data 
            manipulation. Use this node when standard logic gates are insufficient—such as 
            complex array mapping, custom date formatting, or deep object merging. 
            The code has access to the current execution context and must return the 
            transformed data structure for the next step.
        `.trim(),
        category: "Logic",
        icon: Code2,

        defaultConfig: {
            code: "// Write your transformation logic here\nreturn inputs;",
            ...getBaseConfig("Custom Code Sandbox"),
        },
    },

    executor
});