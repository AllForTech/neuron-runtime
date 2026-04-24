import { createNode } from "@neuron/nodes-sdk";
import { BaseNodeConfig, getBaseConfig } from "@neuron/shared";
import { executor } from "./execution/index.js";

export interface TransformNodeConfig extends BaseNodeConfig {
    code: string;
}

export const transformNode = createNode<TransformNodeConfig>({
    type: "Utility.Transform",

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
        category: "Utility",
        icon: "Code2",

        defaultConfig: {
            code: "// Write your transformation logic here\nreturn inputs;",
            ...getBaseConfig("Custom Code Sandbox"),
        },
    },

    executor
});