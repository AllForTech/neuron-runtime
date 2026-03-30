import {WorkflowNode} from "@neuron/shared";

export function convertNodeToDBSchema(node: WorkflowNode) {
    return {
        id: node.id,
        type: node.type,
        config: node.config,
        positionX: node.position.x,
        positionY: node.position.y,
    }
}