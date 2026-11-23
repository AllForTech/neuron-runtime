import type {
  GlobalVariable,
  WorkflowDefinition,
} from '@neuron/shared';
import type { EditorUIState } from '../../constants/editor-panel';

/**
 * Domain state types for the editor stores.
 *
 * These are deliberately structural: they mirror the values the editor needs
 * without importing database row types. Adapters translate persisted/provider
 * rows into these shapes at the boundary.
 */

export type NodeStatus = 'idle' | 'running' | 'success' | 'error';

export type SaveStatus = 'idle' | 'saving' | 'saved' | 'error' | 'retrying';

export type BootstrapStatus = 'idle' | 'loading' | 'ready' | 'error';

export interface WorkflowMetadata {
  id: string;
  name: string;
  description: string;
  status: string;
  userId: string;
}

export interface WorkflowDeploymentRecord {
  id: string;
  [key: string]: unknown;
}

export interface WorkflowExecution {
  id: string;
  workflowId: string;
  userId: string;
  workflowVersionId?: string | null;
  status: 'pending' | 'running' | 'success' | 'failed';
  startedAt: string;
  finishedAt?: string | null;
  result?: unknown;
}

export interface WorkflowExecutionLog {
  id: string;
  executionId: string;
  nodeId: string;
  nodeType: string;
  nodeLabel: string;
  status: 'pending' | 'running' | 'success' | 'error';
  input: unknown;
  output?: unknown;
  error?: string | null;
  startedAt: string;
  finishedAt?: string | null;
  durationMs?: number | null;
  order: number;
  createdAt: string;
}

export interface GraphState {
  workflowId: string;
  graph: WorkflowDefinition;
  workflow: WorkflowMetadata;
  globalVariables: Record<string, GlobalVariable>;
  deployment: Record<string, WorkflowDeploymentRecord> | null;
  isDirty: boolean;
}

export interface RuntimeState {
  nodeStatus: Record<string, NodeStatus>;
  nodeOutputs: Record<string, unknown> | null;
  nodeErrors: Record<string, string> | null;
  activeEdges: Record<string, boolean>;
  executions: Record<string, WorkflowExecution>;
  logs: Record<string, WorkflowExecutionLog>;
}

export interface UIState extends EditorUIState {
  selectedNodeId: string | null;
  selectedHandle: string | null;
  isDeployWorkflowDialogOpen: boolean;
}

export interface SessionState {
  /** Realtime channel identity; `workflow_<runId>` is preserved by the adapter. */
  runId: string;
  bootstrapStatus: BootstrapStatus;
  isWorkflowLoading: boolean;
  isWorkflowSaving: boolean;
  saveStatus: SaveStatus;
  retryCount: number;
  isRunning: boolean;
  isDeploying: boolean;
  isLogsLoading: boolean;
  lastError: string | null;
}

/**
 * Action strings preserved from the existing editor enums. They are kept as
 * literals here so transitions never import the web constants barrel (which
 * pulls UI components into a pure module).
 */
export const GRAPH_ACTIONS = {
  SET_WORKFLOW_ID: 'SET_WORKFLOW_ID',
  SET_GRAPH: 'SET_GRAPH',
  ADD_NODE: 'ADD_NODE',
  UPDATE_NODE: 'UPDATE_NODE',
  UPDATE_NODE_POSITION: 'UPDATE_NODE_POSITION',
  DELETE_NODE: 'DELETE_NODE',
  ADD_EDGE: 'ADD_EDGE',
  DELETE_EDGE: 'DELETE_EDGE',
  UPDATE_EDGE: 'UPDATE_EDGE',
  UPDATE_GLOBAL_VARS: 'UPDATE_GLOBAL_VARS',
  SET_DEPLOYMENT: 'SET_DEPLOYMENT',
  UPDATE_DEPLOYMENT: 'UPDATE_DEPLOYMENT',
  UPDATE_DIRTY_STATE: 'UPDATE_DIRTY_STATE',
} as const;

export const RUNTIME_ACTIONS = {
  SET_NODE_STATUS: 'SET_NODE_STATUS',
  SET_EDGE_ACTIVE: 'SET_EDGE_ACTIVE',
  SET_EXECUTIONS: 'SET_EXECUTIONS',
  ADD_EXECUTION: 'ADD_EXECUTION',
  UPDATE_EXECUTION: 'UPDATE_EXECUTION',
  SET_LOGS: 'SET_LOGS',
  ADD_LOG: 'ADD_LOG',
  UPDATE_LOGS: 'UPDATE_LOGS',
  RESET_FLOW_VISUALS: 'RESET_FLOW_VISUALS',
  CLEAR_RUNTIME: 'CLEAR_RUNTIME',
  NODE_EXECUTION_START: 'NODE_EXECUTION_START',
  NODE_EXECUTION_SUCCESS: 'NODE_EXECUTION_SUCCESS',
  NODE_EXECUTION_ERROR: 'NODE_EXECUTION_ERROR',
  RESET_NODE_STATUS: 'RESET_NODE_STATUS',
} as const;

export type GraphActionType = (typeof GRAPH_ACTIONS)[keyof typeof GRAPH_ACTIONS];
export type RuntimeActionType = (typeof RUNTIME_ACTIONS)[keyof typeof RUNTIME_ACTIONS];

/**
 * Realtime dispatch carries arbitrary string action types. The dispatcher
 * routes known strings and ignores unknown ones without altering the envelope.
 */
export interface ActionEnvelope {
  type: string;
  [key: string]: unknown;
}
