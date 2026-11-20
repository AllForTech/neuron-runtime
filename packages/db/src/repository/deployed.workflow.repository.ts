import {DeployedWorkflow, NewDeployedWorkflow} from "../types/index.js";
import {db} from "../client.js";
import {deployedWorkflows} from "../schemas/index.js";
import {and, desc, eq} from "drizzle-orm";


export async function getDeploymentById(id: string): Promise<Partial<DeployedWorkflow>> {

    const [deployment] = await db
        .select({
            id: deployedWorkflows.id,
            nodes: deployedWorkflows.nodes,
            edges: deployedWorkflows.edges,
            userId: deployedWorkflows.userId,
            secretKey: deployedWorkflows.secretKey,
            private: deployedWorkflows.private,
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
    const [newDeployment] = await db
        .insert(deployedWorkflows)
        .values({
            ...data,
            workflowId,
            createdAt: new Date(),
            updatedAt: new Date(),
        })
        .returning();

    return newDeployment;
}


export async function getDeploymentsByUserId(userId: string) {
    return await db.query.deployedWorkflows.findMany({
        where: eq(deployedWorkflows.userId, userId),
        orderBy: (d: any, { desc }: {desc: any}) => [desc(d.createdAt)]
    })
}

/**
 * Get single deployment by workflowId
 */
export async function getDeploymentByWorkflowId(workflowId: string, userId: string) {
    return await db.query.deployedWorkflows.findFirst({
        where: and(
            eq(deployedWorkflows.workflowId, workflowId),
            eq(deployedWorkflows.userId, userId)
        )
    })
}

/**
 * Get all deployments by workflowId
 */
export async function getALLDeploymentByWorkflowId(workflowId: string, userId: string) {
    return await db.query.deployedWorkflows.findMany({
        where: and(
            eq(deployedWorkflows.workflowId, workflowId),
            eq(deployedWorkflows.userId, userId)
        ),
        orderBy: [desc(deployedWorkflows.createdAt)]
    })
}


export async function deleteDeploymentByWorkflowId(workflowId: string, userId: string) {
    const result = await db
        .delete(deployedWorkflows)
        .where(
            and(
                eq(deployedWorkflows.workflowId, workflowId),
                eq(deployedWorkflows.userId, userId)
            )
        )
        .returning()

    return result[0] ?? null
}

/**
 * Deactivate deployment (set active = false)
 */
export async function deactivateDeployment(workflowId: string, userId: string) {
    const [updated] = await db
        .update(deployedWorkflows)
        .set({
            isActive: false,
            updatedAt: new Date()
        })
        .where(
            and(
                eq(deployedWorkflows.workflowId, workflowId),
                eq(deployedWorkflows.userId, userId)
            )
        )
        .returning()

    return updated ?? null
}

/**
 * Activate deployment (optional but useful)
 */
export async function activateDeployment(workflowId: string, userId: string) {
    const [updated] = await db
        .update(deployedWorkflows)
        .set({
            isActive: true,
            updatedAt: new Date()
        })
        .where(
            and(
                eq(deployedWorkflows.workflowId, workflowId),
                eq(deployedWorkflows.userId, userId)
            )
        )
        .returning()

    return updated ?? null
}