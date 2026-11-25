import type {Response} from "express";
import type {WorkflowExecutionResult} from "../execute-workflow.use-case.js";

/**
 * Projects workflow execution outcomes to HTTP responses.
 * Preserves the frozen wire/status/body contracts for both execution paths.
 */
export class HttpExecutionProjector {
    static projectDeployedSuccess(res: Response, finalContext: WorkflowExecutionResult) {
        if (finalContext.response) {
            const {status, body, headers} = finalContext.response;
            if (headers) res.set(headers);
            return res.status(status || 200).json(body);
        }

        return res.status(200).json({
            success: true,
            message: "Workflow executed successfully.",
            data: finalContext.nodesContext
        });
    }

    static projectDeployedExecutionError(res: Response, execError: any) {
        return res.status(500).json({
            success: false,
            error: "Internal Workflow Execution Error",
            message: execError.message
        });
    }

    static projectInternalAccepted(res: Response, workflowId: string) {
        return res.status(202).json({message: "Execution started", workflowId});
    }
}
