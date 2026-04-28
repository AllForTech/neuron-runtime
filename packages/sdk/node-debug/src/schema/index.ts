import { NodeConfigSchema } from "@neuron/shared";
import { buildSharedNodeSchema } from "@neuron/nodes-sdk";

export const DEBUG_NODE_SCHEMA: NodeConfigSchema = {
    sections: [
        buildSharedNodeSchema()[0],
        {
            id: "debug-settings",
            title: "Debug Configuration",
            description: "Log specific data or messages to the execution console.",
            layout: "column",
            fields: [
                {
                    id: "message",
                    type: "template",
                    path: "message",
                    label: "Log Message",
                    placeholder: "Execution reached this point with data: {{previous_node.output}}",
                    required: true,
                    description: "The message that will appear in the workflow logs. Supports dynamic variables."
                }
            ]
        },
        ...buildSharedNodeSchema().slice(1)
    ]
};