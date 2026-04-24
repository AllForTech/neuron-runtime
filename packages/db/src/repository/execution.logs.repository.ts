
import { eq, and, asc } from "drizzle-orm";
import {NewExecutionLog} from "../types/index.js";
import {executionLogs} from "../schemas/index.js";
import {db} from "../client.js";

export async function createExecutionLog(data: NewExecutionLog) {
    const [log] = await db.insert(executionLogs).values(data as any).returning();
    return log;
}


export async function updateExecutionLog(
    id: string,
    data: Partial<NewExecutionLog>
) {
    const [updated] = await db
        .update(executionLogs)
        .set(data)
        .where(eq(executionLogs.id, id))
        .returning();

    return updated;
}


export async function getExecutionLogsByExecutionId(
    userId: string,
    executionId: string
) {
    return db
        .select()
        .from(executionLogs)
        .where(
            and(
                eq(executionLogs.executionId, executionId),
                eq(executionLogs.userId, userId)
            )
        )
        .orderBy(asc(executionLogs.order));
}


export async function deleteExecutionLogsByExecutionId(
    userId: string,
    executionId: string
) {
    return db
        .delete(executionLogs)
        .where(
            and(
                eq(executionLogs.executionId, executionId),
                eq(executionLogs.userId, userId)
            )
        );
}