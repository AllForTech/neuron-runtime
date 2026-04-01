import { Router } from "express";
import { authenticate } from "../middleware/supabaseAuth";

import {
    createExecutionController,
    getExecutionsController,
    getExecutionsByWorkflowController,
    getExecutionByIdController,
    updateExecutionStatusController,
    deleteExecutionController,
    deleteExecutionsByWorkflowController,
    getExecutionMetricsController,
    getRecentExecutionsController,
} from "../controllers/execution.controller";

const router = Router();

/**
 * Core execution operations
 */
router.post("/", authenticate, createExecutionController);
router.get("/", authenticate, getExecutionsController);

/**
 * Dashboard / analytics
 */
router.get("/metrics", authenticate, getExecutionMetricsController);
router.get("/recent", authenticate, getRecentExecutionsController);

/**
 * Workflow scoped executions
 */
router.get("/workflow/:workflowId", authenticate, getExecutionsByWorkflowController);
router.delete("/workflow/:workflowId", authenticate, deleteExecutionsByWorkflowController);

/**
 * Single execution
 */
router.get("/:executionId", authenticate, getExecutionByIdController);
router.patch("/:executionId/status", authenticate, updateExecutionStatusController);
router.delete("/:executionId", authenticate, deleteExecutionController);

export default router;