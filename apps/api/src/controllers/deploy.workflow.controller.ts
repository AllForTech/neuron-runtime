import {
    createExecution,
    deleteDeploymentByWorkflowId, getALLDeploymentByWorkflowId,
    getDeploymentById,
    getDeploymentByWorkflowId,
    saveDeployWorkflowData, updateExecutionStatus
} from "@neuron/db";
import {supabase} from "@neuron/auth";
import {NewDeployedWorkflow} from "@neuron/db";
import {encryptSecret} from "@neuron/shared/server";
import {deployPayloadSchema} from "../schemas/deployment";
import {executeWorkflow} from "@/engine/execution";
import {DeployedExecutionService} from "../application/index.js";


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

        const parsed = deployPayloadSchema.safeParse(req.body);

        if (!parsed.success) {
            return res.status(400).json({
                error: "Invalid deployment payload",
            });
        }

        const { name, nodes, edges, secretKey, private: isPrivate } = parsed.data;
        const encryptedKey = isPrivate && secretKey
            ? encryptSecret(secretKey)
            : null;

        const data: NewDeployedWorkflow = {
            userId,
            workflowId,
            name: name ?? "Deploy",
            nodes,
            edges,
            secretKey: encryptedKey,
            private: isPrivate ?? true,
            isActive: true
        };

        console.log("[Neuron] Deployment validated", {
            workflowId,
            nodeCount: nodes.length,
            edgeCount: edges.length,
        });

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

        const userId = req.user.id;
        const deployment = await getDeploymentByWorkflowId(workflowId, userId);

        console.log("fetching deployed Workflow with date: ", deployment);

        if (!deployment) {
            return res.status(404).json({
                success: false,
                message: "No active deployment found for this workflow."
            });
        }

        return res.status(200).json({
            id: deployment.id,
            name: deployment.name,
            private: deployment.private,
            isActive: deployment.isActive,
            createdAt: deployment.createdAt,
            updatedAt: deployment.updatedAt,
        });
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

        const userId = req.user.id;
        const deployment = await getALLDeploymentByWorkflowId(workflowId, userId);

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
        const userId = req.user.id;
        // We call your existing service function
        const deleted = await deleteDeploymentByWorkflowId(workflowId, userId);

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
        // The engine wrapper is the single orchestration entry; collaborators
        // are composed there per deployment owner/workflow at execution time.
        const service = new DeployedExecutionService({
            executeWorkflow: (command) => executeWorkflow(command, command.request),
            getDeploymentById,
            createExecution,
            updateExecutionStatus
        });

        return await service.execute(req, res, deploymentId);
    } catch (error) {
        console.error("[Neuron Kernel Error]:", error);
        return res.status(500).json({
            success: false,
            error: "Internal Orchestration Failure",
            message: "The execution engine encountered a fatal hydration error."
        });
    }
};
