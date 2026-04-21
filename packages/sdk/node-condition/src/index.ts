import { createNode } from "@neuron/nodes-sdk";
import { BaseNodeConfig, getBaseConfig } from "@neuron/shared";
import { Split } from "lucide-react";
import { executor } from "./execution";

export interface ConditionNodeConfig extends BaseNodeConfig {
    leftValue: string;
    operator: "==" | "!=" | ">" | "<" | "contains" | "exists";
    rightValue: string;
}

export const conditionNode = createNode<ConditionNodeConfig>({
    type: "condition",

    template: {
        key: "condition",
        label: "Condition Gate",
        description: `
            Directs the workflow flow by evaluating a logical expression between two values. 
            This node allows you to compare incoming data—such as checking if a user's ID exists, 
            comparing a numeric balance, or verifying if a string contains a specific keyword. 
            Depending on whether the result is true or false, the execution will proceed down 
            the corresponding output path.
        `.trim(),
        category: "Logic",
        icon: Split,

        defaultConfig: {
            leftValue: "",
            operator: "==",
            rightValue: "",
            ...getBaseConfig("Binary Logical Fork"),
        },
    },

    executor
});