import { WorkflowEdge } from "@neuron/db";
import { ExecutionSignal, NodeType } from "@neuron/shared";

export function getEdgeTargets(
    type: NodeType,
    nodeId: string,
    edges: WorkflowEdge[],
    output: any,
    signal: ExecutionSignal
): string[] {

    if (type === "Logic.Condition") {
        const branch = output ? "true" : "false";

        return edges
            .filter(e =>
                e.source === nodeId &&
                e.sourceHandle === branch
            )
            .map(e => e.target);
    }

    if (type === "Logic.Decision") {
        const matched = Array.isArray(output) ? output : [];

        return edges
            .filter(e =>
                e.source === nodeId &&
                matched.includes(e.sourceHandle)
            )
            .map(e => e.target);
    }

    if (signal !== "success") {
        return edges
            .filter(e =>
                e.source === nodeId &&
                e.sourceHandle === signal
            )
            .map(e => e.target);
    }

    return edges
        .filter(e =>
            e.source === nodeId &&
            (!e.sourceHandle || e.sourceHandle === "success")
        )
        .map(e => e.target);
}