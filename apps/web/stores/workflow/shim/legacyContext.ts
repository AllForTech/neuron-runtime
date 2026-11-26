import type { EditorUIState } from '../../../constants/editor-panel';
import {
  deriveReactFlowView,
  type ReactFlowEdgeView,
  type ReactFlowNodeView,
} from '../selectors';
import {
  RUNTIME_ACTIONS,
  type ActionEnvelope,
  type GraphState,
  type RuntimeState,
  type SessionState,
  type UIState,
  type WorkflowExecutionLog,
} from '../types';

/**
 * TEMPORARY (TODO T-124): pure read/model helpers for the legacy
 * `WorkflowEditorContextType` shim. No React, no store access and no I/O lives
 * here so the compatibility surface can be characterized without a DOM.
 */

export type LegacySaveStatus = 'idle' | 'saving' | 'saved' | 'error' | 'retrying';

export interface LegacyEditorRuntime {
  nodeStatus: RuntimeState['nodeStatus'];
  nodeOutputs: RuntimeState['nodeOutputs'];
  nodeErrors: RuntimeState['nodeErrors'];
  activeEdges: RuntimeState['activeEdges'];
  executions: RuntimeState['executions'];
}

export interface LegacyEditorState {
  workflowId: string;
  graph: GraphState['graph'];
  workflow: GraphState['workflow'];
  runtime: LegacyEditorRuntime;
  globalVariables: GraphState['globalVariables'];
  deployment: GraphState['deployment'];
  isDirty: boolean;
}

export interface LegacyRuntimeState {
  nodeStatus: RuntimeState['nodeStatus'];
  activeEdges: RuntimeState['activeEdges'];
  executions: RuntimeState['executions'];
  logs: RuntimeState['logs'];
}

export interface LegacySessionFlags {
  isWorkflowLoading: boolean;
  isWorkflowSaving: boolean;
  saveStatus: LegacySaveStatus;
  retryCount: number;
  isRunning: boolean;
  isDeploying: boolean;
  isLogsLoading: boolean;
}

export interface LegacyGraphSlice {
  workflowId: GraphState['workflowId'];
  graph: GraphState['graph'];
  workflow: GraphState['workflow'];
  globalVariables: GraphState['globalVariables'];
  deployment: GraphState['deployment'];
  isDirty: GraphState['isDirty'];
}

/** Object selector: wrapped with `useShallow` at the only call site. */
export const selectLegacyGraphSlice = (state: GraphState): LegacyGraphSlice => ({
  workflowId: state.workflowId,
  graph: state.graph,
  workflow: state.workflow,
  globalVariables: state.globalVariables,
  deployment: state.deployment,
  isDirty: state.isDirty,
});

/** Object selector: wrapped with `useShallow` at the only call site. */
export const selectLegacyEditorRuntime = (
  state: RuntimeState
): LegacyEditorRuntime => ({
  nodeStatus: state.nodeStatus,
  nodeOutputs: state.nodeOutputs,
  nodeErrors: state.nodeErrors,
  activeEdges: state.activeEdges,
  executions: state.executions,
});

/** Object selector: wrapped with `useShallow` at the only call site. */
export const selectLegacyRuntimeState = (state: RuntimeState): LegacyRuntimeState => ({
  nodeStatus: state.nodeStatus,
  activeEdges: state.activeEdges,
  executions: state.executions,
  logs: state.logs,
});

/** Object selector: wrapped with `useShallow` at the only call site. */
export const selectLegacyEditorUI = (state: UIState): EditorUIState => ({
  activeLeftPanel: state.activeLeftPanel,
  activeRightPanel: state.activeRightPanel,
  leftPanelHistory: state.leftPanelHistory,
  rightPanelHistory: state.rightPanelHistory,
});

/** Object selector: wrapped with `useShallow` at the only call site. */
export const selectLegacySessionFlags = (state: SessionState): LegacySessionFlags => ({
  isWorkflowLoading: state.isWorkflowLoading,
  isWorkflowSaving: state.isWorkflowSaving,
  saveStatus: state.saveStatus,
  retryCount: state.retryCount,
  isRunning: state.isRunning,
  isDeploying: state.isDeploying,
  isLogsLoading: state.isLogsLoading,
});

export function toLegacyEditorState(
  graph: LegacyGraphSlice,
  runtime: LegacyEditorRuntime
): LegacyEditorState {
  return { ...graph, runtime };
}

/**
 * A legacy `workflowEditorDispatch` wrote node visuals into the provider's
 * duplicated `editorState.runtime`. Those strings now belong to runtimeStore;
 * everything else stays on graphStore. The mapping is explicit so the shim
 * cannot silently drop a realtime or component action.
 */
const RUNTIME_RELAYED_ACTIONS: ReadonlySet<string> = new Set([
  RUNTIME_ACTIONS.NODE_EXECUTION_START,
  RUNTIME_ACTIONS.NODE_EXECUTION_SUCCESS,
  RUNTIME_ACTIONS.NODE_EXECUTION_ERROR,
  RUNTIME_ACTIONS.RESET_NODE_STATUS,
  RUNTIME_ACTIONS.SET_EXECUTIONS,
]);

export type LegacyDispatchTarget = 'graph' | 'runtime';

export function routeLegacyWorkflowEditorAction(
  action: ActionEnvelope
): LegacyDispatchTarget {
  return RUNTIME_RELAYED_ACTIONS.has(action.type) ? 'runtime' : 'graph';
}

export interface DispatchLike {
  dispatch: (action: ActionEnvelope) => void;
}

export interface LegacyDispatchers {
  workflowEditorDispatch: (action: ActionEnvelope) => void;
  runtimeDispatch: (action: ActionEnvelope) => void;
  editorUIDispatch: (action: ActionEnvelope) => void;
}

/**
 * Built once per provider instance from stable store actions so dispatch
 * identity survives re-renders (T-007 D2 / dispatch-in-deps components).
 */
export function createLegacyDispatchers(
  graph: DispatchLike,
  runtime: DispatchLike,
  ui: DispatchLike
): LegacyDispatchers {
  return {
    workflowEditorDispatch: (action) => {
      if (routeLegacyWorkflowEditorAction(action) === 'runtime') {
        runtime.dispatch(action);
        return;
      }
      graph.dispatch(action);
    },
    runtimeDispatch: (action) => runtime.dispatch(action),
    editorUIDispatch: (action) => ui.dispatch(action),
  };
}

/** Legacy `logs` was an array; runtimeStore owns the record and this adapts it. */
export function toLegacyLogsRecord(
  logs: WorkflowExecutionLog[]
): Record<string, WorkflowExecutionLog> {
  const record: Record<string, WorkflowExecutionLog> = {};
  for (const log of logs) record[log.id] = log;
  return record;
}

export interface LegacyReactFlowView {
  rfNodes: ReactFlowNodeView[];
  rfEdges: ReactFlowEdgeView[];
}

/** Canvas derivation is shared with the store selectors, unchanged. */
export function deriveLegacyReactFlowView(
  graph: GraphState['graph'],
  selectedNodeId: string | null,
  activeEdges: RuntimeState['activeEdges']
): LegacyReactFlowView {
  const view = deriveReactFlowView(graph, selectedNodeId, activeEdges);
  return { rfNodes: view.nodes, rfEdges: view.edges };
}
