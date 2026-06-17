import {
    createExecution,
    deleteDeploymentByWorkflowId, getALLDeploymentByWorkflowId,
    getDeploymentById,
    getDeploymentByWorkflowId,
    saveDeployWorkflowData, updateExecutionStatus
} from "@neuron/db";
import {supabase} from "@neuron/auth";
import {NewDeployedWorkflow, WorkflowEdge, WorkflowNode} from "@neuron/db";
import {executeWorkflow} from "@/engine/execution";
import {decryptSecret, encryptSecret} from "@neuron/shared/server";
import {timingSafeEqual} from "node:crypto";


export const deployWorkflowController = async (req: any, res: any) => {
   try {
       console.log("[Neuron] Deploying Workflow...");
       const authHeader = req.headers.authorization;

       if (!authHeader || !authHeader.startsWith("Bearer ")) {
           return res.status(401).json({
               error: "Missing or invalid authorization token",
           });
       }

       const token = authHeader.replace("Bearer ", "");

       // 2️⃣ Validate user
       const {
           data: { user },
           error: authError,
       } = await supabase.auth.getUser(token);

       if (authError || !user) {
           return res.status(401).json({
               error: "Unauthorized",
           });
       }

       const userId = user.id;

       const { workflowId } = req.params as any;

       if (!workflowId) {
           return res.status(400).json({
               error: "Workflow ID is required",
           });
       }

       const body = req.body;

       const encryptedKey = body.private && body?.secretKey
           ? encryptSecret(body.secretKey)
           : null;

       const data: NewDeployedWorkflow = {
           userId,
           workflowId,
           name: body?.name ?? "Deploy",
           nodes: body.nodes,
           edges: body.edges,
           secretKey: encryptedKey,
           private: body.private,
           isActive: true
       }

       console.log("Deploying Workflow...", data);

       const deployment = await saveDeployWorkflowData(workflowId, data);

       return res.status(200).json(deployment);
   }catch (e: any) {

       console.log(e);
       return res.status(500).json({
           error: "Internal server error",
           message: e.message,
       });
   }
}


export const getDeploymentController = async (req: any, res: any) => {
    try {
        console.log("[Neuron] Deployments...");
        const { workflowId } = req.params as any;

        if (!workflowId) {
            return res.status(400).json({
                error: "Workflow ID is required",
            });
        }

        const deployment = await getDeploymentByWorkflowId(workflowId);

        console.log("fetching deployed Workflow with date: ", deployment);

        return res.status(200).json(deployment ? {
            id: deployment.id,
            name: deployment.name,
            private: deployment.private,
            isActive: deployment.isActive,
            createdAt: deployment.createdAt,
            updatedAt: deployment.updatedAt,
        } : null);
    }catch (e: any) {

        console.log(e);
        return res.status(500).json({
            error: "Internal server error",
            message: e.message,
        });
    }
}

export const getAllDeploymentController = async (req: any, res: any) => {
    try {
        console.log("[Neuron] Deployments...");
        const { workflowId } = req.params as any;

        if (!workflowId) {
            return res.status(400).json({
                error: "Workflow ID is required",
            });
        }

        const deployment = await getALLDeploymentByWorkflowId(workflowId);

        console.log("fetching  all deployed Workflows with date: ", deployment);

        return res.status(200).json(deployment ?? []);

    }catch (e: any) {

        console.log(e);
        return res.status(500).json({
            error: "Internal server error",
            message: e.message,
        });
    }
}


export const deleteDeploymentController = async (req: any, res: any) => {
    const { workflowId } = req.params;

    try {
        // We call your existing service function
        const deleted = await deleteDeploymentByWorkflowId(workflowId);

        if (!deleted) {
            return res.status(404).json({
                success: false,
                message: "No active deployment found for this workflow."
            });
        }

        return res.status(200).json({
            success: true,
            message: "Orchestration terminated successfully.",
            data: deleted
        });
    } catch (error) {
        console.error("[Neuron Delete Error]:", error);
        return res.status(500).json({
            success: false,
            message: "Internal Kernel Error while dismantling deployment."
        });
    }
};


export const executeDeployedWorkflowController = async (req: any, res: any) => {
    const { deploymentId } = req.params as any;

    try {
        const deployment = await getDeploymentById(deploymentId);

        if (!deployment) {
            return res.status(404).json({
                success: false,
                error: "Target Not Found",
                message: "No active workflow matches the provided ID."
            });
        }

        // --- AUTHENTICATION LAYER ---
        if (deployment.private) {
            const providedKey = req.headers['x-neuron-key'] || req.query.api_key;

            if (!providedKey || typeof providedKey !== 'string') {
                return res.status(401).json({
                    success: false,
                    error: "Authentication Required",
                    message: "Missing 'X-Neuron-Key' header."
                });
            }

            try {
                const decryptedMaster = decryptSecret(deployment.secretKey!);

                // Use Timing Safe Comparison to prevent side-channel attacks
                const isMatch = timingSafeEqual(
                    Buffer.from(providedKey),
                    Buffer.from(decryptedMaster)
                );

                if (!isMatch) throw new Error("Mismatch");
            } catch (authError) {
                return res.status(403).json({
                    success: false,
                    error: "Invalid Identity",
                    message: "The provided secret key is incorrect or tampered with."
                });
            }
        }

        // --- EXECUTION ORCHESTRATION ---
        const execution = await createExecution({
            workflowId: deployment.workflowId!,
            userId: deployment.userId!,
        });

        if (!execution) throw new Error("Failed to initialize execution record");

        try {
            const finalContext = await executeWorkflow({
                executionId: execution.id,
                workflowId: deployment.workflowId!,
                graph: {
                    nodes: deployment.nodes as WorkflowNode[],
                    edges: deployment.edges as WorkflowEdge[],
                },
                userId: deployment.userId!,
            }, req);

            // Update status (Success)
            await updateExecutionStatus({
                executionId: execution.id,
                status: "success",
                userId: deployment.userId!,
                result: finalContext.response?.body ?? "Executed",
            }, deployment.workflowId);

            // Professional Response Handling
            if (finalContext.response) {
                const { status, body, headers } = finalContext.response;
                if (headers) res.set(headers);
                return res.status(status || 200).json(body);
            }

            return res.status(200).json({
                success: true,
                message: "Workflow executed successfully.",
                data: finalContext.nodesContext
            });

        } catch (execError: any) {
            // Update status (Failed)
            await updateExecutionStatus({
                executionId: execution.id,
                status: "failed",
                userId: deployment.userId!,
                result: execError.message,
            }, deployment.workflowId);

            return res.status(500).json({
                success: false,
                error: "Internal Workflow Execution Error",
                message: execError.message
            });
        }

    } catch (error) {
        console.error("[Neuron Kernel Error]:", error);
        return res.status(500).json({
            success: false,
            error: "Internal Orchestration Failure",
            message: "The execution engine encountered a fatal hydration error."
        });
    }
};