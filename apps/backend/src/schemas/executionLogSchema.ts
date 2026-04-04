import {
    pgTable,
    uuid,
    text,
    timestamp,
    jsonb,
    integer,
    index
} from "drizzle-orm/pg-core";
import {workflows} from "./workflowSchema";
import {users} from "./authSchema";
import {executions} from "./executionSchema";

export const executionLogs = pgTable("execution_logs", {
    id: uuid("id")
        .primaryKey()
        .unique()
        .defaultRandom(),

    executionId: uuid("execution_id")
        .notNull()
        .references(() => executions.id),

    workflowId: uuid("workflow_id")
        .notNull()
        .references(() => workflows.id),

    userId: uuid('user_id')
        .notNull()
        .references(() => users.id, { onDelete: 'cascade' }),

    nodeId: text("node_id").notNull(),
    nodeType: text("node_type").notNull(),
    nodeLabel: text("node_label").notNull(),

    status: text("status").$type<"pending" | "running" | "success" | "error">().default("pending").notNull(),

    input: jsonb("input").$type<any>().notNull(),
    output: jsonb("output").$type<any>(),
    error: text("error"),

    startedAt: timestamp("started_at", { withTimezone: true }).notNull(),
    finishedAt: timestamp("finished_at", { withTimezone: true }),
    durationMs: integer("duration_ms"),

    order: integer("order").notNull(),

    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => {
    return {
        executionIdx: index("execution_logs_execution_id_idx").on(table.executionId),
        workflowIdx: index("execution_logs_workflow_id_idx").on(table.workflowId),
        userIdx: index("execution_logs_user_id_idx").on(table.userId),
        nodeIdx: index("execution_logs_node_id_idx").on(table.nodeId),
    };
});