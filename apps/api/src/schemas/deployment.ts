import { z } from "zod";

const MAX_NODES = 500;
const MAX_EDGES = 2_000;

const nodeSchema = z.looseObject({
    id: z.string().min(1),
    type: z.string().min(1),
    config: z.record(z.string(), z.unknown()).optional(),
});

const edgeSchema = z.looseObject({
    id: z.string().min(1),
    source: z.string().min(1),
    target: z.string().min(1),
});

/**
 * Boundary validation for the body of a workflow deployment request.
 *
 * Graph objects are intentionally loose: the editor adds presentation fields
 * (positions, handles, React Flow metadata) that the runtime ignores but that
 * must survive persistence unchanged. Only the identity/structure required to
 * execute a graph is enforced here.
 */
export const deployPayloadSchema = z
    .object({
        name: z.string().min(1).max(200).optional(),
        private: z.boolean().optional(),
        secretKey: z.string().min(1).max(4096).optional(),
        nodes: z.array(nodeSchema).min(1).max(MAX_NODES),
        edges: z.array(edgeSchema).max(MAX_EDGES).default([]),
    })
    .superRefine((payload, ctx) => {
        if (payload.private === true && !payload.secretKey) {
            ctx.addIssue({
                code: "custom",
                path: ["secretKey"],
                message: "A secret key is required for a private deployment",
            });
        }

        const nodeIds = new Set(payload.nodes.map((node) => node.id));
        payload.edges.forEach((edge, index) => {
            if (!nodeIds.has(edge.source) || !nodeIds.has(edge.target)) {
                ctx.addIssue({
                    code: "custom",
                    path: ["edges", index],
                    message: "Edge references a node that is not part of the graph",
                });
            }
        });
    });

export type DeployPayload = z.infer<typeof deployPayloadSchema>;
