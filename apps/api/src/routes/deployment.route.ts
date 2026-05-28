import {Router} from "express";
import {executeDeployedWorkflowController} from "@/controllers/deploy.workflow.controller";

const router = Router();

router.get("/:deploymentId", executeDeployedWorkflowController);

export default router;