import {executions} from "../../schemas";
import {db} from "../../db/client";
import {and, eq} from "drizzle-orm";
import { sql } from "drizzle-orm";
import type {ExecutionStatus} from "../../types/types";

type CreateExecutionInput = {
    workflowId: string;
    workflowVersionId?: string;
    userId: string;
};

export async function createExecution(input: CreateExecutionInput) {
    const [execution] = await db
        .insert(executions)
        .values({
            workflowId: input.workflowId,
            workflowVersionId: input.workflowVersionId,
            userId: input.userId,
            status: "running",
        })
        .returning();

    return execution;
}

export async function getExecutionsByUser(userId: string) {
    return await db.query.executions.findMany({
        where: eq(executions.userId, userId),
        with: {
            workflow: true,
            logs: true,
        },
        orderBy: (exec, { desc }) => [desc(exec.startedAt)],
    });
}


export async function getExecutionsByWorkflow(userId: string, workflowId: string) {
    return await db.query.executions.findMany({
        where: and(
            eq(executions.userId, userId),
            eq(executions.workflowId, workflowId)
        ),
        with: {
            logs: true,
        },
        orderBy: (exec, { desc }) => [desc(exec.startedAt)],
    });
}


export async function getExecutionById(userId: string, executionId: string) {
    return await db.query.executions.findFirst({
        where: and(
            eq(executions.id, executionId),
            eq(executions.userId, userId)
        ),
        with: {
            workflow: true,
            logs: true,
        },
    });
}


export async function updateExecutionStatus(params: {
    executionId: string;
    userId: string;
    status: "pending" | "running" | "success" | "failed";
    finishedAt?: Date;
    result?: any;
}) {
    const [updated] = await db
        .update(executions)
        .set({
            status: params.status,
            finishedAt: params.finishedAt,
            result: params.result,
        })
        .where(
            and(
                eq(executions.id, params.executionId),
                eq(executions.userId, params.userId)
            )
        )
        .returning();

    return updated;
}


export async function deleteExecution(userId: string, executionId: string) {
    const [deleted] = await db
        .delete(executions)
        .where(
            and(
                eq(executions.id, executionId),
                eq(executions.userId, userId)
            )
        )
        .returning();

    return deleted;
}


export async function deleteExecutionsByWorkflow(userId: string, workflowId: string) {
    return db
        .delete(executions)
        .where(
            and(
                eq(executions.userId, userId),
                eq(executions.workflowId, workflowId)
            )
        );
}


export async function getExecutionMetrics(userId: string) {
    const [metrics] = await db
        .select({
            total: sql<number>`count(*)`,
            success: sql<number>`count(*) filter (where status = 'success')`,
            failed: sql<number>`count(*) filter (where status = 'failed')`,
            running: sql<number>`count(*) filter (where status = 'running')`,
        })
        .from(executions)
        .where(eq(executions.userId, userId));

    return metrics;
}


export async function getRecentExecutions(userId: string, limit = 20) {
    return await db.query.executions.findMany({
        where: eq(executions.userId, userId),
        orderBy: (exec, { desc }) => [desc(exec.startedAt)],
        limit,
    });
}




