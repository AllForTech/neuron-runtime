import { Router } from "express";
import { authenticate } from "../middleware/supabaseAuth";

import {
    createExecutionLogController,
    updateExecutionLogController,
    getExecutionLogsController,
    deleteExecutionLogsController,
} from "../controllers/execution.logs.controller";

const router = Router();

router.post("/", authenticate, createExecutionLogController);
router.patch("/:logId", authenticate, updateExecutionLogController);
router.get("/:executionId", authenticate, getExecutionLogsController);
router.delete("/:executionId", authenticate, deleteExecutionLogsController);

export default router;