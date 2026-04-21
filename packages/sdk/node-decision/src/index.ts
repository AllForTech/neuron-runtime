import { createNode } from "@neuron/nodes-sdk";
import { BaseNodeConfig, getBaseConfig } from "@neuron/shared";
import { GitBranch } from "lucide-react";
import { executor } from "./execution";

interface DecisionRule {
    id: string;
    operator: "==" | "!=" | ">" | "<" | "includes" | "exists";
    value: string;
    transforms: string[];
    label: string;
}

export interface DecisionNodeConfig extends BaseNodeConfig {
    input: string;
    inputTransforms: string[];
    rules: DecisionRule[];
    includeDefault: boolean;
}

export const decisionNode = createNode<DecisionNodeConfig>({
    type: "decisionNode",

    template: {
        key: "decisionNode",
        label: "Multi-Route Switch",
        description: `
            Functions as a 'Switch' statement for your workflow, allowing for complex 
            multi-path routing based on defined rules. Unlike the binary Condition Gate, 
            the Decision Node evaluates an input against multiple cases and directs the 
            execution to the first matching branch. This is ideal for handling 
            different categories of API requests or status-based logic.
        `.trim(),
        category: "Logic",
        icon: GitBranch,

        defaultConfig: {
            input: "",
            inputTransforms: [],
            rules: [],
            includeDefault: true,
            ...getBaseConfig("Advanced Multi-Path Router"),
        },
    },

    executor
});