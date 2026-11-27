import {
  RUNTIME_ACTIONS,
  type ActionEnvelope,
  type NodeStatus,
  type RuntimeState,
  type WorkflowExecution,
  type WorkflowExecutionLog,
} from '../types';

/**
 * Pure runtime transitions. Execution visuals, executions and logs have a
 * single owner here; the graph store no longer keeps a duplicate copy.
 */

export function createInitialRuntimeState(): RuntimeState {
  return {
    nodeStatus: {},
    nodeOutputs: null,
    nodeErrors: null,
    activeEdges: {},
    executions: {},
    logs: {},
  };
}

export function setNodeStatus(
  state: RuntimeState,
  nodeId: string,
  status: NodeStatus
): RuntimeState {
  return {
    ...state,
    nodeStatus: { ...state.nodeStatus, [nodeId]: status },
  };
}

export function setEdgeActive(
  state: RuntimeState,
  edgeId: string,
  isActive: boolean
): RuntimeState {
  return {
    ...state,
    activeEdges: { ...state.activeEdges, [edgeId]: isActive },
  };
}

export function setExecutions(
  state: RuntimeState,
  executions: Record<string, WorkflowExecution>
): RuntimeState {
  return { ...state, executions };
}

export function addExecution(
  state: RuntimeState,
  execution: WorkflowExecution
): RuntimeState {
  return {
    ...state,
    executions: { [execution.id]: execution, ...state.executions },
  };
}

export function updateExecution(
  state: RuntimeState,
  executionId: string,
  payload: Partial<WorkflowExecution>
): RuntimeState {
  if (!state.executions[executionId]) return state;
  return {
    ...state,
    executions: {
      ...state.executions,
      [executionId]: { ...state.executions[executionId], ...payload },
    },
  };
}

export function setLogs(
  state: RuntimeState,
  logs: Record<string, WorkflowExecutionLog>
): RuntimeState {
  return { ...state, logs };
}

export function addLog(
  state: RuntimeState,
  log: WorkflowExecutionLog
): RuntimeState {
  return { ...state, logs: { ...state.logs, [log.id]: log } };
}

export function updateLogs(
  state: RuntimeState,
  id: string,
  payload: Partial<WorkflowExecutionLog>
): RuntimeState {
  const existing = state.logs[id];
  if (!existing) return state;
  return {
    ...state,
    logs: { ...state.logs, [id]: { ...existing, ...payload } },
  };
}

export function applyNodeExecutionStart(
  state: RuntimeState,
  nodeId: string
): RuntimeState {
  return setNodeStatus(state, nodeId, 'running');
}

export function applyNodeExecutionSuccess(
  state: RuntimeState,
  nodeId: string,
  output: unknown
): RuntimeState {
  return {
    ...state,
    nodeStatus: { ...state.nodeStatus, [nodeId]: 'success' },
    nodeOutputs: { ...state.nodeOutputs, [nodeId]: output },
  };
}

export function applyNodeExecutionError(
  state: RuntimeState,
  nodeId: string,
  error: string
): RuntimeState {
  return {
    ...state,
    nodeStatus: { ...state.nodeStatus, [nodeId]: 'error' },
    nodeErrors: { ...state.nodeErrors, [nodeId]: error },
  };
}

/**
 * Clears node status, errors and outputs only. Active edges and the
 * executions/logs records are intentionally preserved.
 */
export function resetNodeStatus(state: RuntimeState): RuntimeState {
  return { ...state, nodeStatus: {}, nodeErrors: {}, nodeOutputs: null };
}

/**
 * Clears node status and active edges only. Outputs, errors, executions and
 * logs are intentionally preserved. This is a different field set from
 * `resetNodeStatus`.
 */
export function resetFlowVisuals(state: RuntimeState): RuntimeState {
  return { ...state, nodeStatus: {}, activeEdges: {} };
}

/** Runtime reset is full and returns an independent initial state object. */
export function clearRuntime(): RuntimeState {
  return createInitialRuntimeState();
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

/** Boundary reducer for arbitrary string action types from realtime frames. */
export function runtimeReducer(
  state: RuntimeState,
  action: ActionEnvelope
): RuntimeState {
  switch (action.type) {
    case RUNTIME_ACTIONS.SET_NODE_STATUS:
      return typeof action.nodeId === 'string' && typeof action.status === 'string'
        ? setNodeStatus(state, action.nodeId, action.status as NodeStatus)
        : state;
    case RUNTIME_ACTIONS.SET_EDGE_ACTIVE:
      return typeof action.edgeId === 'string' && typeof action.isActive === 'boolean'
        ? setEdgeActive(state, action.edgeId, action.isActive)
        : state;
    case RUNTIME_ACTIONS.SET_EXECUTIONS:
      return isRecord(action.payload)
        ? setExecutions(state, action.payload as Record<string, WorkflowExecution>)
        : state;
    case RUNTIME_ACTIONS.ADD_EXECUTION: {
      const execution = action.execution;
      if (!isRecord(execution) || typeof execution.id !== 'string') return state;
      return addExecution(state, execution as unknown as WorkflowExecution);
    }
    case RUNTIME_ACTIONS.UPDATE_EXECUTION:
      return typeof action.executionId === 'string' && isRecord(action.payload)
        ? updateExecution(
            state,
            action.executionId,
            action.payload as Partial<WorkflowExecution>
          )
        : state;
    case RUNTIME_ACTIONS.SET_LOGS:
      return isRecord(action.payload)
        ? setLogs(state, action.payload as Record<string, WorkflowExecutionLog>)
        : state;
    case RUNTIME_ACTIONS.ADD_LOG: {
      const log = action.payload;
      if (!isRecord(log) || typeof log.id !== 'string') return state;
      return addLog(state, log as unknown as WorkflowExecutionLog);
    }
    case RUNTIME_ACTIONS.UPDATE_LOGS:
      return typeof action.id === 'string' && isRecord(action.payload)
        ? updateLogs(state, action.id, action.payload as Partial<WorkflowExecutionLog>)
        : state;
    case RUNTIME_ACTIONS.NODE_EXECUTION_START:
      return typeof action.nodeId === 'string'
        ? applyNodeExecutionStart(state, action.nodeId)
        : state;
    case RUNTIME_ACTIONS.NODE_EXECUTION_SUCCESS:
      return typeof action.nodeId === 'string'
        ? applyNodeExecutionSuccess(state, action.nodeId, action.output)
        : state;
    case RUNTIME_ACTIONS.NODE_EXECUTION_ERROR:
      return typeof action.nodeId === 'string' && typeof action.error === 'string'
        ? applyNodeExecutionError(state, action.nodeId, action.error)
        : state;
    case RUNTIME_ACTIONS.RESET_NODE_STATUS:
      return resetNodeStatus(state);
    case RUNTIME_ACTIONS.RESET_FLOW_VISUALS:
      return resetFlowVisuals(state);
    case RUNTIME_ACTIONS.CLEAR_RUNTIME:
      return clearRuntime();
    default:
      return state;
  }
}
