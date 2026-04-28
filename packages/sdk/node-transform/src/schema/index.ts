import { NodeConfigSchema } from "@neuron/shared";
import { buildSharedNodeSchema } from "@neuron/nodes-sdk";

export const TRANSFORM_NODE_SCHEMA: NodeConfigSchema = {
    sections: [
        buildSharedNodeSchema()[0],
        {
            id: "transform-settings",
            title: "Data Transformation",
            description: "Write custom TypeScript/JavaScript code to manipulate data within the workflow.",
            layout: "column",
            fields: [
                {
                    id: "code",
                    type: "code",
                    path: "code",
                    label: "Script",
                    placeholder: "// Example: return { ...input, status: 'processed' };",
                    required: true,
                    description: "Access incoming data via the 'input' variable. Return the modified object."
                }
            ]
        },
        ...buildSharedNodeSchema().slice(1)
    ]
};