import {ExecutionSignal, NodeType} from "@neuron/shared";
import {WorkflowEdge} from "@neuron/db";

export function getEdgeTargets(
    type: NodeType,
    nodeId: string,
    edges: WorkflowEdge[],
    output: any,
    signal: ExecutionSignal
): string[] {
    // 1. Logic Nodes (Binary Condition)
    if (type === "Logic.Condition") {
        const branch = output ? "true" : "false";
        return edges
            .filter(e => e.source === nodeId && e.sourceHandle === branch)
            .map(e => e.target);
    }

    // 2. Logic Nodes (Multi-choice Decision)
    if (type === "Logic.Decision") {
        const matched = Array.isArray(output) ? output : [];
        return edges
            .filter(e => e.source === nodeId && matched.includes(e.sourceHandle))
            .map(e => e.target);
    }

    // 3. Handle Failure Signals (error, timeout, retry_exhausted)
    if (signal !== "success") {
        const targets = edges.filter(e => e.source === nodeId && e.sourceHandle === signal);

        // FALLBACK: If no specific handle (e.g. timeout) is connected,
        // try to find a general 'error' handle.
        if (targets.length === 0 && signal !== "error") {
            return edges
                .filter(e => e.source === nodeId && e.sourceHandle === "error")
                .map(e => e.target);
        }

        return targets.map(e => e.target);
    }

    // 4. Handle Success
    return edges
        .filter(e =>
            e.source === nodeId &&
            (!e.sourceHandle || e.sourceHandle === "success")
        )
        .map(e => e.target);
}