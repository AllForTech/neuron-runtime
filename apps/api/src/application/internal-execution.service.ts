import {HttpExecutionProjector} from "./projectors/http-execution.projector.js";
import type {ExecuteWorkflowFn} from "./deployed-execution.service.js";

export interface InternalExecutionDeps {
    executeWorkflow: ExecuteWorkflowFn;
    createExecution: (input: {workflowId: string; userId: string}) => Promise<{id: string} | null | undefined>;
    updateExecutionStatus: (
        params: {executionId: string; userId: string; status: "success" | "failed"; result?: any},
        workflowId?: string
    ) => Promise<any>;
}

export interface InternalExecutionCommand {
    workflowId: string;
    userId: string;
    graph: {nodes: any[]; edges: any[]};
    request: any;
}

export class InternalExecutionService {
    constructor(private readonly deps: InternalExecutionDeps) {}

    async start(command: InternalExecutionCommand) {
        const execution = await this.deps.createExecution({
            workflowId: command.workflowId,
            userId: command.userId,
        });

        if (!execution) {
            return {ok: false as const, reason: "execution_create_failed" as const};
        }

        void this.deps.executeWorkflow({
            executionId: execution.id,
            workflowId: command.workflowId,
            graph: command.graph,
            userId: command.userId,
            request: command.request,
        })
            .then(async finalContext => {
                await this.deps.updateExecutionStatus({
                    executionId: execution.id,
                    status: "success",
                    userId: command.userId,
                    result: finalContext,
                }, command.workflowId);
            })
            .catch(async err => {
                console.error(`Workflow ${command.workflowId} failed`, err);
                await this.deps.updateExecutionStatus({
                    executionId: execution.id,
                    status: "failed",
                    userId: command.userId,
                    result: err?.message ?? err,
                }, command.workflowId);
            });

        return {ok: true as const, executionId: execution.id};
    }

    projectAccepted(res: any, workflowId: string) {
        return HttpExecutionProjector.projectInternalAccepted(res, workflowId);
    }
}
