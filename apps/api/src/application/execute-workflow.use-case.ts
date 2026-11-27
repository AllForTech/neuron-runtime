import {logger, NODE_KIND} from "@neuron/shared";
import {Runtime} from "@neuron/runtime";
import type {IVaultResolver, WorkflowEventSink, WorkflowVariableSource} from "@neuron/shared";
import {sanitizeWebhookData} from "../schemas/webhook-data.js";

/** Domain-level result of one orchestrated workflow execution. */
export type WorkflowExecutionResult = {
    nodesContext: Record<string, any>;
    globalVariables: Record<string, string>;
    response: {
        status: number;
        headers?: Record<string, string>;
        body?: Record<string, any>;
    } | null;
};

export interface ExecuteWorkflowCommand {
    executionId: string;
    workflowId: string;
    graph: {
        nodes: any[];
        edges: any[];
    };
    userId: string;
    request?: any;
}

export interface RuntimeCollaborators {
    vault: IVaultResolver;
    variables: WorkflowVariableSource;
    events: WorkflowEventSink;
}

export interface ExecuteWorkflowUseCaseDeps {
    collaborators: RuntimeCollaborators;
}

/**
 * Single orchestration path for workflow execution. Controllers provide
 * transport concerns; adapters provide persistence/realtime collaborators;
 * projectors translate outcomes to wire/HTTP contracts.
 */
export class ExecuteWorkflowUseCase {
    constructor(private readonly deps: ExecuteWorkflowUseCaseDeps) {}

    async execute(command: ExecuteWorkflowCommand): Promise<WorkflowExecutionResult> {
        const triggerNode = command.graph.nodes.find(n => n.type === NODE_KIND.TRIGGER_WEBHOOK);

        if (triggerNode) {
            triggerNode.config = {
                ...(triggerNode.config ?? {}),
                webhookData: sanitizeWebhookData(command.request)
            };
        }

        const runtime = new Runtime({
            executionId: command.executionId,
            workflowId: command.workflowId,
            graph: command.graph,
            userId: command.userId,
            ...this.deps.collaborators
        });

        const result = await runtime.execute();

        logger.info("Runtime", `Execution Result for ${command.executionId}`, {
            workflowId: command.workflowId,
            status: result
        });

        return result as WorkflowExecutionResult;
    }
}
