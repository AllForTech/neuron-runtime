import { executions, workflows } from '@neuron/client';
import { db } from '../../../lib/db/workflow.db';
import { createClient } from '../../../lib/supabase/client';
import { createWorkflowDraftAdapter } from '../adapters/workflowDraft';
import { graphStore } from '../graphStore';
import { runtimeStore } from '../runtimeStore';
import { sessionStore } from '../sessionStore';
import {
  createWorkflowCommands,
  type ExecutionClientPort,
  type WorkflowClientPort,
} from './workflowCommands';
import { reportError } from './workflowErrorReporting';

/**
 * Commands are stateless orchestration, and every production port is already a
 * module singleton. One binding serves the editor route and, until T-124, the
 * temporary context shim; the injectable factory remains the unit-test seam.
 */
async function defaultGetAccessToken(): Promise<string> {
  const supabase = createClient();
  const { data, error } = await supabase.auth.getSession();
  if (error || !data.session) throw new Error('No active session found');
  return data.session.access_token;
}

export const workflowCommands = createWorkflowCommands({
  graph: graphStore,
  runtime: runtimeStore,
  session: sessionStore,
  workflowClient: workflows as unknown as WorkflowClientPort,
  executionsClient: executions as unknown as ExecutionClientPort,
  getAccessToken: defaultGetAccessToken,
  draft: createWorkflowDraftAdapter(db.drafts),
  onError: reportError,
});

export const loadGraph = workflowCommands.loadGraph;
export const saveGraph = workflowCommands.saveGraph;
export const runWorkflow = workflowCommands.runWorkflow;
export const deployWorkflow = workflowCommands.deployWorkflow;
export const deleteDeployment = workflowCommands.deleteDeployment;
export const getExecutionLogs = workflowCommands.getExecutionLogs;
