import type { GlobalVariable, WorkflowEdge, WorkflowNode } from '@neuron/shared';
import {
  mapDeploymentRows,
  mapExecutionLogRows,
  mapGraphResponse,
  type DeploymentRow,
  type GraphResponseRow,
} from '../../../lib/graphMappers';
import { SAVED_STATUS_RESET_MS } from '../constants';
import { graphStore } from '../graphStore';
import { runtimeStore } from '../runtimeStore';
import { sessionStore } from '../sessionStore';
import type { WorkflowDeploymentRecord, WorkflowExecutionLog } from '../types';
import type { WorkflowDraftAdapter } from '../adapters/workflowDraft';
import { runWithRetry } from './workflowSync';

/**
 * Orchestration boundary for cloud load / save / run / deploy / logs.
 * Network clients, token access and persistence are injected; this module only
 * coordinates store writes and session flags. Store access uses the vanilla
 * `getState()` API because commands never run during React render.
 */

export type ClientResult = [unknown, unknown];

export interface WorkflowClientPort {
  getGraph(workflowId: string, token: string): Promise<ClientResult>;
  saveGraph(
    workflowId: string,
    token: string,
    payload: {
      graph: { nodes: WorkflowNode[]; edges: WorkflowEdge[] };
      globalVariables: GlobalVariable[];
    }
  ): Promise<ClientResult>;
  run(runId: string, token: string): Promise<ClientResult>;
  deploy(workflowId: string, data: unknown, token: string): Promise<ClientResult>;
  getAllDeployment(workflowId: string, token: string): Promise<ClientResult>;
  deleteDeployment(workflowId: string, token: string): Promise<ClientResult>;
}

export interface ExecutionClientPort {
  getLogs(executionId: string, token: string): Promise<ClientResult>;
}

export interface WorkflowCommandDeps {
  graph: typeof graphStore;
  runtime: typeof runtimeStore;
  session: typeof sessionStore;
  workflowClient: WorkflowClientPort;
  executionsClient: ExecutionClientPort;
  getAccessToken: () => Promise<string>;
  draft: WorkflowDraftAdapter;
  onError?: (error: unknown, context: string) => void;
}

export function createWorkflowCommands(deps: WorkflowCommandDeps) {
  const reportError = (error: unknown, context: string): void => {
    deps.session.getState().setError(
      error instanceof Error ? error.message : String(error)
    );
    deps.onError?.(error, context);
  };

  const loadDeployment = async (workflowId: string): Promise<void> => {
    try {
      const token = await deps.getAccessToken();
      const [data, error] = await deps.workflowClient.getAllDeployment(
        workflowId,
        token
      );
      if (error) throw error;
      deps.graph.getState().setDeployment(
        mapDeploymentRows(data as DeploymentRow[] | null | undefined)
      );
    } catch (error) {
      reportError(error, 'loadDeployment');
    }
  };

  return {
    async loadGraph(workflowId: string): Promise<void> {
      deps.session.getState().beginBootstrap();
      try {
        const token = await deps.getAccessToken();
        const [data, error] = await deps.workflowClient.getGraph(workflowId, token);
        if (error) throw error;

        const mapped = mapGraphResponse(data as GraphResponseRow);
        const graph = deps.graph.getState();
        graph.setWorkflowId(workflowId);
        graph.setGraph(mapped.graph);
        graph.updateGlobalVars(mapped.globalVariables);
        deps.runtime.getState().setExecutions(mapped.executions);
        await loadDeployment(workflowId);
        deps.graph.getState().markClean();
        deps.session.getState().completeBootstrap();
      } catch (error) {
        deps.session.getState().failBootstrap(
          error instanceof Error ? error.message : String(error)
        );
        reportError(error, 'loadGraph');
      }
    },

    async saveGraph(workflowId: string): Promise<boolean> {
      const result = await runWithRetry(async (attempt) => {
        const session = deps.session.getState();
        session.setRetryCount(attempt);
        session.setSaveStatus(attempt > 0 ? 'retrying' : 'saving');
        session.setSaving(true);

        const token = await deps.getAccessToken();
        const draft = await deps.draft.get(workflowId);
        if (!draft) {
          deps.session.getState().setSaveStatus('idle');
          return 'no-draft';
        }

        const [, error] = await deps.workflowClient.saveGraph(workflowId, token, {
          graph: {
            nodes: Object.values(draft.graph.nodes),
            edges: Object.values(draft.graph.edges),
          },
          globalVariables: Object.values(draft.globalVariables),
        });
        if (error) throw error;

        await deps.draft.markSynced(workflowId);
        deps.graph.getState().markClean();
        deps.session.getState().setSaveStatus('saved');
        deps.session.getState().setRetryCount(0);
        setTimeout(() => {
          deps.session.getState().setSaveStatus('idle');
        }, SAVED_STATUS_RESET_MS);
        return 'saved';
      });

      deps.session.getState().setSaving(false);
      if (!result.ok) {
        deps.session.getState().setSaveStatus('error');
        reportError(result.error, 'saveGraph');
      }
      return result.ok;
    },

    async runWorkflow(workflowId: string): Promise<boolean> {
      deps.runtime.getState().resetNodeStatus();
      deps.session.getState().setRunning(true);
      try {
        const token = await deps.getAccessToken();
        const [, error] = await deps.workflowClient.run(workflowId, token);
        if (error) throw error;
        return true;
      } catch (error) {
        reportError(error, 'runWorkflow');
        return false;
      } finally {
        deps.session.getState().setRunning(false);
      }
    },

    async deployWorkflow(
      workflowId: string,
      data: { private: boolean; secretKey: string }
    ): Promise<boolean> {
      const state = deps.graph.getState();
      const nodes = Object.values(state.graph.nodes);
      if (nodes.length === 0) return false;

      deps.session.getState().setDeploying(true);
      try {
        const token = await deps.getAccessToken();
        const [deployed, error] = await deps.workflowClient.deploy(
          workflowId,
          {
            ...data,
            name: state.workflow.name || 'Untitled',
            nodes,
            edges: Object.values(state.graph.edges),
          },
          token
        );
        if (error) throw error;
        if (deployed && typeof deployed === 'object' && 'id' in deployed) {
          deps.graph
            .getState()
            .updateDeployment(deployed as WorkflowDeploymentRecord);
        }
        return true;
      } catch (error) {
        reportError(error, 'deployWorkflow');
        return false;
      } finally {
        deps.session.getState().setDeploying(false);
      }
    },

    async deleteDeployment(workflowId: string): Promise<boolean> {
      try {
        const token = await deps.getAccessToken();
        const [, error] = await deps.workflowClient.deleteDeployment(
          workflowId,
          token
        );
        if (error) throw error;
        deps.graph.getState().setDeployment(null);
        return true;
      } catch (error) {
        reportError(error, 'deleteDeployment');
        return false;
      }
    },

    async getExecutionLogs(
      executionId: string
    ): Promise<Record<string, WorkflowExecutionLog>> {
      deps.session.getState().setLogsLoading(true);
      try {
        const token = await deps.getAccessToken();
        const [data, error] = await deps.executionsClient.getLogs(
          executionId,
          token
        );
        if (error) throw error;
        const logs = mapExecutionLogRows(data as WorkflowExecutionLog[] | undefined);
        deps.runtime.getState().setLogs(logs);
        return logs;
      } catch (error) {
        reportError(error, 'getExecutionLogs');
        return {};
      } finally {
        deps.session.getState().setLogsLoading(false);
      }
    },
  };
}
