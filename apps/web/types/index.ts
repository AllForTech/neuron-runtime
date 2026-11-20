import type {
  WorkflowActionType,
  WorkflowEditorActionType,
} from '@/constants';
import type {
  DeployedWorkflow,
  Workflow as WorkflowTable,
} from '@neuron/db';
import type {
  GlobalVariable,
  WorkflowDefinition,
  WorkflowEdge,
  WorkflowNode,
} from '@neuron/shared';

export type ExecutionLogStatus = 'pending' | 'running' | 'success' | 'error';

export interface ExecutionLog {
  id: string;

  executionId: string;

  nodeId: string;
  nodeType: string;
  nodeLabel: string;

  status: ExecutionLogStatus;

  input: unknown;
  output?: unknown | null;
  error?: string | null;

  startedAt: string; // ISO string
  finishedAt?: string | null;

  durationMs?: number | null;

  order: number;

  createdAt: string; // ISO string
}

export interface Execution<TResult = unknown> {
  id: string;

  workflowId: string;
  userId: string;

  workflowVersionId?: string | null;

  status: 'pending' | 'running' | 'success' | 'failed';

  startedAt: string;
  finishedAt?: string | null;

  result?: TResult | null;
}

export enum ExecutionStatus {
  IDLE = 'idle',
  RUNNING = 'running',
  SUCCESS = 'success',
  ERROR = 'error',
  FAILED = 'failed',
}

export interface RuntimeState {
  nodeStatus: Record<string, ExecutionStatus>;
  activeEdges: Record<string, boolean>;
  executions: Record<string, Execution>;
  logs: Record<string, ExecutionLog>;
}

export enum RuntimeActionType {
  SET_NODE_STATUS = 'SET_NODE_STATUS',
  SET_EDGE_ACTIVE = 'SET_EDGE_ACTIVE',
  SET_EXECUTIONS = 'SET_EXECUTIONS',
  ADD_EXECUTION = 'ADD_EXECUTION',
  UPDATE_EXECUTION = 'UPDATE_EXECUTION',
  SET_LOGS = 'SET_LOGS',
  ADD_LOG = 'ADD_LOG',
  UPDATE_LOGS = 'UPDATE_LOGS',
  RESET_FLOW_VISUALS = 'RESET_FLOW_VISUALS',
  CLEAR_RUNTIME = 'CLEAR_RUNTIME',
}

export type RuntimeAction =
  | {
      type: RuntimeActionType.SET_NODE_STATUS;
      nodeId: string;
      status: ExecutionStatus;
    }
  | {
      type: RuntimeActionType.SET_EDGE_ACTIVE;
      edgeId: string;
      isActive: boolean;
    }
  | {
      type: RuntimeActionType.SET_EXECUTIONS;
      payload: Record<string, Execution>;
    }
  | { type: RuntimeActionType.ADD_EXECUTION; execution: Execution }
  | {
      type: RuntimeActionType.UPDATE_EXECUTION;
      executionId: string;
      payload: Partial<Execution>;
    }
  | { type: RuntimeActionType.ADD_LOG; payload: ExecutionLog }
  | { type: RuntimeActionType.SET_LOGS; payload: Record<string, ExecutionLog> }
  | {
      type: RuntimeActionType.UPDATE_LOGS;
      id: string;
      payload: Partial<ExecutionLog>;
    }
  | { type: RuntimeActionType.RESET_FLOW_VISUALS }
  | { type: RuntimeActionType.CLEAR_RUNTIME };

/** Actions accepted by the workflows list reducer. */
export type WorkflowAction =
  | { type: WorkflowActionType.SET_WORKFLOWS; payload: WorkflowTable[] }
  | { type: WorkflowActionType.ADD_WORKFLOW; payload: WorkflowTable }
  | { type: WorkflowActionType.UPDATE_WORKFLOW; id: string; payload: Partial<WorkflowTable> }
  | { type: WorkflowActionType.DELETE_WORKFLOW; id: string }
  | { type: WorkflowActionType.UPDATE_STATUS; id: string; status: WorkflowTable['status'] };

/** Actions accepted by the workflow editor graph reducer. */
export type WorkflowEditorAction =
  | { type: WorkflowEditorActionType.SET_WORKFLOW_ID; workflowId: string }
  | { type: WorkflowEditorActionType.SET_GRAPH; payload: WorkflowDefinition }
  | { type: WorkflowEditorActionType.ADD_NODE; payload: WorkflowNode }
  | { type: WorkflowEditorActionType.UPDATE_NODE; id: string; payload: Record<string, unknown> }
  | { type: WorkflowEditorActionType.UPDATE_NODE_POSITION; id: string; position: { x: number; y: number } }
  | { type: WorkflowEditorActionType.DELETE_NODE; id: string }
  | { type: WorkflowEditorActionType.ADD_EDGE; payload: WorkflowEdge }
  | { type: WorkflowEditorActionType.DELETE_EDGE; id: string }
  | { type: WorkflowEditorActionType.UPDATE_EDGE; id: string; payload: Partial<WorkflowEdge> }
  | { type: WorkflowEditorActionType.RESET_NODE_STATUS }
  | { type: WorkflowEditorActionType.NODE_EXECUTION_START; nodeId: string }
  | { type: WorkflowEditorActionType.NODE_EXECUTION_SUCCESS; nodeId: string; output: unknown }
  | { type: WorkflowEditorActionType.NODE_EXECUTION_ERROR; nodeId: string; error: string }
  | { type: WorkflowEditorActionType.UPDATE_GLOBAL_VARS; payload: Record<string, GlobalVariable> }
  | { type: WorkflowEditorActionType.SET_DEPLOYMENT; payload: Record<string, DeployedWorkflow> | null }
  | { type: WorkflowEditorActionType.UPDATE_DEPLOYMENT; payload: DeployedWorkflow }
  | { type: WorkflowEditorActionType.UPDATE_DIRTY_STATE; state?: boolean }
  | { type: WorkflowEditorActionType.SET_EXECUTIONS; payload: Record<string, Execution> };
