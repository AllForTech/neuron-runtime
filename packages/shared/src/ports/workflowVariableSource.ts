/**
 * Supplies workflow-scoped variables to the execution engine.
 *
 * Owned by the domain; implemented at the edge by an adapter that reads the
 * persistence store. The engine never learns where the values come from.
 */
export interface WorkflowVariableSource {
    getForWorkflow(workflowId: string): Promise<Record<string, string>>;
}
