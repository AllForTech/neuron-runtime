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

       const data: NewDeployedWorkflow = {
           userId,
           workflowId,
           name: body?.name ?? "Deploy",
           nodes: body.nodes,
           edges: body.edges,
           secretKey: body.secretKey,
           private: body.private,
           isActive: true
       }

       console.log("Deploying Workflow...");

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
    const workflowId = req.params.workflowId;
    // const apiKey = req.workflowKey;

    // TODO: WorkflowId is the deployment id, fix for feature improvement and readability

    try {

        const deployment = await getDeploymentById(workflowId)

        if (!deployment) {
            return res.status(404).json({
                success: false,
                error: "Target Not Found",
                message: "No active workflow matches the provided security payload."
            });
        }

        console.log(`[Neuron] Initializing execution for: ${deployment.id}`);

        // Sync to execution table
        const execution = await createExecution({
            workflowId: deployment.workflowId as string,
            userId: deployment.userId  as string,
        })

        if (!execution) {
            return res.status(500).json({
                success: false,
                error: "Execution Error",
                message: "Fail to create execution.",
            });
        }

        // await neuronEngine.run(deployment.nodes, deployment.edges);
        executeWorkflow({
            executionId: execution.id,
            workflowId: deployment.workflowId as string,
            graph: {
                nodes: deployment.nodes as WorkflowNode[],
                edges: deployment.edges as WorkflowEdge[],
            },
            userId: deployment.userId  as string,
        }, req)
            .then(async (finalContext) => {
                console.log(`Workflow ${deployment.workflowId} finished.`);

                // Update status (Success)
                await updateExecutionStatus({
                    executionId: execution.id,
                    status: "success",
                    userId: deployment.userId as string,
                    result: finalContext.response,
                }, deployment.workflowId)

                if (finalContext.response){
                    const { status, body, headers } = finalContext.response;

                    if (headers) {
                        res.set(headers);
                    }

                    return res.status(status || 200).json(body);
                }else {
                    return res.status(200).json({
                        success: true,
                        message: "workflow executed successfully.",
                        context: finalContext,
                    });
                }
            })
            .catch(async err => {
                console.error(`Workflow ${deployment.workflowId} failed:`, err);

                // Update status (Failed)
                await updateExecutionStatus({
                    executionId: execution.id,
                    status: "failed",
                    userId: deployment.userId as string,
                    result: err?.message ?? err,
                }, deployment.workflowId)

                return res.status(500).json({
                    success: false,
                    error: "Internal Workflow Execution Error",
                    message: err.message
                });
            });

    } catch (error) {
        console.error("[Neuron Error]:", error);
        return res.status(500).json({
            success: false,
            error: "Internal Orchestration Failure",
            message: "The kernel encountered an error during key hydration."
        });
    }
};