import { Router } from "express";
import {
    addNodeController,
    createWorkflowController, deleteWorkflowController,
    executeWorkflowController,
    getWorkflowController,
    getWorkflowFullStateController,
    saveWorkflowGraphController,
} from "@/controllers/workflow.controllers";
import {
    createWorkspaceController,
    getWorkspacesController,
    updateWorkspaceController,
    deleteWorkspaceController,
    assignWorkflowToWorkspaceController
} from "@/controllers/workspace.controller";
import { authenticate } from "@/middleware/supabaseAuth";
import {
    deleteDeploymentController,
    deployWorkflowController, getAllDeploymentController,
    getDeploymentController
} from "@/controllers/deploy.workflow.controller";

const router = Router();

// --- Global Middleware ---
// Protects all routes defined below this line
router.use(authenticate);

// --- Core Workflows ---
router.get("/", getWorkflowController as any);
router.post("/", createWorkflowController as any);
router.delete("/:workflowId", deleteWorkflowController as any);

// --- Graph & State Management ---
router.get("/:workflowId/graph", getWorkflowFullStateController as any);
router.post("/:workflowId/graph", saveWorkflowGraphController as any);
router.post("/:workflowId/nodes", addNodeController as any);

// --- Execution & Deployment ---
router.get("/execute/:workflowId", executeWorkflowController as any);
router.post("/deploy/:workflowId", deployWorkflowController);
router.get("/deploy/:workflowId", getDeploymentController);
router.delete("/deploy/:workflowId", deleteDeploymentController);
router.get("/deploy/all/:workflowId", getAllDeploymentController);

// --- Workspace / Grouping Management ---
router.get("/workspaces", getWorkspacesController as any);
router.post("/workspaces", createWorkspaceController as any);
router.patch("/workspaces/:id", updateWorkspaceController as any);
router.delete("/workspaces/:id", deleteWorkspaceController as any);

// Drag & Drop action
router.post("/workspaces/assign-workflow", assignWorkflowToWorkspaceController as any);

export default router;