export function resolveNextNodes({
                                     node,
                                     output,
                                     edges,
                                     outgoing
                                 }: any): string[] {

    if (node.type === "condition") {
        const branch = output ? "true" : "false";

        return edges
            .filter((e: any) =>
                e.source === node.id && e.sourceHandle === branch
            )
            .map((e: any) => e.target);
    }

    if (node.type === "decisionNode") {
        const matched = Array.isArray(output) ? output : [];

        return edges
            .filter((e: any) =>
                e.source === node.id &&
                matched.includes(e.sourceHandle)
            )
            .map((e: any) => e.target);
    }

    return outgoing[node.id] || [];
}