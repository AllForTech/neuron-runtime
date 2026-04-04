
import {
    createExecutionLog,
    updateExecutionLog,
    getExecutionLogsByExecutionId,
    deleteExecutionLogsByExecutionId,
} from "../services/repository/execution.logs.repository";

/**
 * Create execution log (usually internal, but exposed if needed)
 */
export async function createExecutionLogController(req: any, res: any) {
    try {
        const userId = req.user.id;

        const {
            executionId,
            workflowId,
            nodeId,
            nodeType,
            nodeLabel,
            input,
            order,
        } = req.body;

        if (!executionId || !workflowId || !nodeId || !nodeType || !nodeLabel) {
            return res.status(400).json({ message: "Missing required fields" });
        }

        const log = await createExecutionLog({
            executionId,
            workflowId,
            userId,
            nodeId,
            nodeType,
            nodeLabel,
            status: "running",
            input: input || {},
            startedAt: new Date(),
            order: order ?? 0,
        });

        return res.status(201).json(log);
    } catch (err) {
        return res.status(500).json({ message: "Failed to create execution log" });
    }
}

/**
 * Update execution log (mark success/error)
 */
export async function updateExecutionLogController(req: any, res: any) {
    try {
        const userId = req.user.id;
        const { logId } = req.params;

        const { status, output, error, finishedAt, durationMs } = req.body;

        const updated = await updateExecutionLog(logId, {
            status,
            output,
            error,
            finishedAt: finishedAt ? new Date(finishedAt) : new Date(),
            durationMs,
        });

        if (!updated) {
            return res.status(404).json({ message: "Execution log not found" });
        }

        return res.status(200).json(updated);
    } catch (err) {
        return res.status(500).json({ message: "Failed to update execution log" });
    }
}

/**
 * Get logs for a specific execution (MAIN ONE YOU NEED)
 */
export async function getExecutionLogsController(req: any, res: any) {
    try {
        const userId = req.user.id;
        const { executionId } = req.params;

        if (!executionId) {
            return res.status(400).json({ message: "Execution ID is required" });
        }

        const logs = await getExecutionLogsByExecutionId(userId, executionId);

        return res.status(200).json(logs);
    } catch (err) {
        return res.status(500).json({ message: "Failed to fetch execution logs" });
    }
}

/**
 * Delete logs for an execution (cleanup)
 */
export async function deleteExecutionLogsController(req: any, res: any) {
    try {
        const userId = req.user.id;
        const { executionId } = req.params;

        if (!executionId) {
            return res.status(400).json({ message: "Execution ID is required" });
        }

        await deleteExecutionLogsByExecutionId(userId, executionId);

        return res.status(200).json({ message: "Execution logs deleted" });
    } catch (err) {
        return res.status(500).json({ message: "Failed to delete execution logs" });
    }
}