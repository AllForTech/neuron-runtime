import {DeployedWorkflow, NewDeployedWorkflow} from "../types/index.js";
import {db} from "../client.js";
import {deployedWorkflows} from "../schemas/index.js";
import {and, eq} from "drizzle-orm";


export async function getDeploymentById(id: string): Promise<Partial<DeployedWorkflow>> {

    const [deployment] = await db
        .select({
            id: deployedWorkflows.id,
            nodes: deployedWorkflows.nodes,
            edges: deployedWorkflows.edges,
            userId: deployedWorkflows.userId,
            secretKey: deployedWorkflows.secretKey,
            isPrivate: deployedWorkflows.private,
            isActive: deployedWorkflows.isActive,
            workflowId: deployedWorkflows.workflowId,
        })
        .from(deployedWorkflows)
        .where(
            and(
                eq(deployedWorkflows.id, id),
                eq(deployedWorkflows.isActive, true)
            )
        )
        .limit(1);

    return deployment as Partial<DeployedWorkflow>;
}

export async function saveDeployWorkflowData(workflowId: string, data: any) {
    return db.transaction(async (tx) => {
        return tx
            .insert(deployedWorkflows)
            .values({
                ...data,
                workflowId,
                updatedAt: new Date(),
            })
            .onConflictDoUpdate({
                target: deployedWorkflows.workflowId,
                set: {
                    nodes: data.nodes,
                    edges: data.edges,
                    name: data.name,
                    secretKey: data.secretKey,
                    private: data.private,
                    isActive: data.isActive,
                    updatedAt: new Date(),
                },
            })
            .returning();
    });
}


export async function getDeploymentsByUserId(userId: string) {
    return await db.query.deployedWorkflows.findMany({
        where: eq(deployedWorkflows.userId, userId),
        orderBy: (d: any, { desc }: {desc: any}) => [desc(d.createdAt)]
    })
}

/**
 * Get deployment by workflowId
 */
export async function getDeploymentByWorkflowId(workflowId: string) {
    return await db.query.deployedWorkflows.findFirst({
        where: eq(deployedWorkflows.workflowId, workflowId)
    })
}


export async function deleteDeploymentByWorkflowId(workflowId: string) {
    const result = await db
        .delete(deployedWorkflows)
        .where(eq(deployedWorkflows.workflowId, workflowId))
        .returning()

    return result[0] ?? null
}

/**
 * Deactivate deployment (set active = false)
 */
export async function deactivateDeployment(workflowId: string) {
    const [updated] = await db
        .update(deployedWorkflows)
        .set({
            isActive: false,
            updatedAt: new Date()
        })
        .where(eq(deployedWorkflows.workflowId, workflowId))
        .returning()

    return updated ?? null
}

/**
 * Activate deployment (optional but useful)
 */
export async function activateDeployment(workflowId: string) {
    const [updated] = await db
        .update(deployedWorkflows)
        .set({
            isActive: true,
            updatedAt: new Date()
        })
        .where(eq(deployedWorkflows.workflowId, workflowId))
        .returning()

    return updated ?? null
}