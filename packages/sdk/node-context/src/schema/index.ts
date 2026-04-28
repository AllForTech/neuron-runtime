import { NodeConfigSchema } from "@neuron/shared";
import { buildSharedNodeSchema } from "@neuron/nodes-sdk";

export const CONTEXT_NODE_SCHEMA: NodeConfigSchema = {
    sections: [
        buildSharedNodeSchema()[0],
        {
            id: "context-management",
            title: "Global Context Settings",
            description: "Define and manage static variables accessible across the entire workflow.",
            layout: "column",
            fields: [
                {
                    id: "fields",
                    type: "object",
                    path: "fields",
                    label: "Context Variables",
                    description: "Add key-value pairs to initialize the workflow state.",
                    fields: [
                        {
                            id: "field-key",
                            type: "text",
                            path: "key",
                            label: "Variable Name",
                            placeholder: "e.g. global_threshold"
                        },
                        {
                            id: "field-value",
                            type: "template",
                            path: "value",
                            label: "Initial Value",
                            placeholder: "Enter value or {{variable}}"
                        }
                    ]
                }
            ]
        },
        ...buildSharedNodeSchema().slice(1)
    ]
};