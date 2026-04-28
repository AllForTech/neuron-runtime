import { NodeConfigSchema } from "@neuron/shared";
import { buildSharedNodeSchema } from "@neuron/nodes-sdk";

export const CONDITION_NODE_SCHEMA: NodeConfigSchema = {
    sections: [
        buildSharedNodeSchema()[0],
        {
            id: "condition-settings",
            title: "Logic Configuration",
            description: "Define the binary condition to evaluate. If true, the workflow follows the 'true' path.",
            layout: "grid",
            fields: [
                {
                    id: "leftValue",
                    type: "template",
                    path: "leftValue",
                    label: "Variable / Value",
                    placeholder: "{{node.output}}",
                    required: true
                },
                {
                    id: "operator",
                    type: "select",
                    path: "operator",
                    label: "Operator",
                    required: true,
                    options: [
                        { label: "Equals (==)", value: "==" },
                        { label: "Not Equals (!=)", value: "!=" },
                        { label: "Greater Than (>)", value: ">" },
                        { label: "Less Than (<)", value: "<" },
                        { label: "Contains", value: "contains" },
                        { label: "Exists", value: "exists" }
                    ]
                },
                {
                    id: "rightValue",
                    type: "template",
                    path: "rightValue",
                    label: "Comparison Value",
                    placeholder: "e.g. success",
                    hidden: (values) => values.operator === "exists"
                }
            ]
        },
        ...buildSharedNodeSchema().slice(1)
    ]
};