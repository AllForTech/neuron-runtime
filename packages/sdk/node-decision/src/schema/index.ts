import { NodeConfigSchema } from "@neuron/shared";
import { buildSharedNodeSchema } from "@neuron/nodes-sdk";

export const DECISION_NODE_SCHEMA: NodeConfigSchema = {
    sections: [
        buildSharedNodeSchema()[0],
        {
            id: "decision-input",
            title: "Input Configuration",
            description: "Specify the data point to evaluate against your rules.",
            layout: "column",
            fields: [
                {
                    id: "input",
                    type: "template",
                    path: "input",
                    label: "Evaluation Input",
                    placeholder: "{{trigger.body.category}}",
                    required: true,
                    description: "The value that will be checked against each rule."
                }
            ]
        },
        {
            id: "decision-rules",
            title: "Routing Rules",
            description: "Define logic branches. The workflow will follow the first matching rule.",
            layout: "column",
            fields: [
                {
                    id: "rules",
                    type: "array",
                    path: "rules",
                    itemLabel: "Rule",
                    fields: [
                        {
                            id: "label",
                            type: "text",
                            path: "label",
                            label: "Rule Label",
                            placeholder: "e.g. Is High Priority"
                        },
                        {
                            id: "operator",
                            type: "select",
                            path: "operator",
                            label: "Operator",
                            options: [
                                { label: "Equals (==)", value: "==" },
                                { label: "Not Equals (!=)", value: "!=" },
                                { label: "Greater Than (>)", value: ">" },
                                { label: "Less Than (<)", value: "<" },
                                { label: "Includes", value: "includes" },
                                { label: "Exists", value: "exists" }
                            ]
                        },
                        {
                            id: "value",
                            type: "template",
                            path: "value",
                            label: "Comparison Value",
                            placeholder: "urgent",
                            hidden: (values: any) => values.operator === "exists"
                        }
                    ]
                },
                {
                    id: "includeDefault",
                    type: "switch",
                    path: "includeDefault",
                    label: "Include Default Path",
                    description: "Add an 'Otherwise' output for when no rules match."
                }
            ]
        },
        ...buildSharedNodeSchema().slice(1)
    ]
};