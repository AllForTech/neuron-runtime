import {relations} from "drizzle-orm";
import {workspaces} from "./workspaceSchema.js";
import {workflows} from "./workflowSchema.js";

export * from "./workspaceSchema.js";
export * from "./workflowSchema.js";
export * from "./workflowVersionSchema.js";
export * from "./executionSchema.js";
export * from "./executionLogSchema.js";
export * from "./authSchema.js";
export * from "./workflowNodes.js";
export * from "./workflowEdges.js";
export * from "./vaultSecrets.js";
export * from "./globalVariablesSchema.js";
export * from "./deployedWorkflows.js";


export const workspacesRelations = relations(workspaces, ({ many }) => ({
    workflows: many(workflows),
}));

export const workflowsRelations = relations(workflows, ({ one }) => ({
    workspace: one(workspaces, {
        fields: [workflows.workspaceId],
        references: [workspaces.id],
    }),
}));