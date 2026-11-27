import {timingSafeEqual} from "node:crypto";
import type {Response} from "express";
import {decryptSecret} from "@neuron/shared/server";
import {HttpExecutionProjector} from "./projectors/http-execution.projector.js";
import type {ExecuteWorkflowCommand, WorkflowExecutionResult} from "./execute-workflow.use-case.js";

export interface DeploymentRecord {
    id: string;
    workflowId?: string | null;
    userId?: string | null;
    private: boolean;
    secretKey?: string | null;
    nodes: any;
    edges: any;
}

export interface ExecutionRecord {
    id: string;
}

export type ExecuteWorkflowFn = (command: ExecuteWorkflowCommand) => Promise<WorkflowExecutionResult>;

export interface DeployedExecutionDeps {
    executeWorkflow: ExecuteWorkflowFn;
    getDeploymentById: (id: string) => Promise<Partial<DeploymentRecord> | null | undefined>;
    createExecution: (input: {workflowId: string; userId: string}) => Promise<ExecutionRecord | null | undefined>;
    updateExecutionStatus: (
        params: {executionId: string; userId: string; status: "success" | "failed"; result?: any},
        workflowId?: string
    ) => Promise<any>;
}

export class DeployedExecutionService {
    constructor(private readonly deps: DeployedExecutionDeps) {}

    async execute(req: any, res: Response, deploymentId: string) {
        const deployment = await this.deps.getDeploymentById(deploymentId);

        if (!deployment) {
            return res.status(404).json({
                success: false,
                error: "Target Not Found",
                message: "No active workflow matches the provided ID."
            });
        }

        if (deployment.private) {
            const providedKey = req.headers['x-neuron-key'];

            if (!providedKey || typeof providedKey !== 'string') {
                return res.status(401).json({
                    success: false,
                    error: "Authentication Required",
                    message: "Missing 'X-Neuron-Key' header."
                });
            }

            try {
                const decryptedMaster = decryptSecret(deployment.secretKey!);
                const isMatch = timingSafeEqual(
                    Buffer.from(providedKey),
                    Buffer.from(decryptedMaster)
                );
                if (!isMatch) throw new Error("Mismatch");
            } catch {
                return res.status(403).json({
                    success: false,
                    error: "Invalid Identity",
                    message: "The provided secret key is incorrect or tampered with."
                });
            }
        }

        const execution = await this.deps.createExecution({
            workflowId: deployment.workflowId!,
            userId: deployment.userId!,
        });

        if (!execution) throw new Error("Failed to initialize execution record");

        const command: ExecuteWorkflowCommand = {
            executionId: execution.id,
            workflowId: deployment.workflowId!,
            graph: {
                nodes: deployment.nodes as any[],
                edges: deployment.edges as any[],
            },
            userId: deployment.userId!,
            request: req
        };

        try {
            const finalContext = await this.deps.executeWorkflow(command);

            await this.deps.updateExecutionStatus({
                executionId: execution.id,
                status: "success",
                userId: deployment.userId!,
                result: finalContext.response?.body ?? "Executed",
            }, deployment.workflowId!);

            return HttpExecutionProjector.projectDeployedSuccess(res, finalContext);
        } catch (execError: any) {
            await this.deps.updateExecutionStatus({
                executionId: execution.id,
                status: "failed",
                userId: deployment.userId!,
                result: execError.message,
            }, deployment.workflowId!);

            return HttpExecutionProjector.projectDeployedExecutionError(res, execError);
        }
    }
}
