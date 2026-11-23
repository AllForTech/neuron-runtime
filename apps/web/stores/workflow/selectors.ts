import type {
  GlobalVariable,
  NodeType,
  WorkflowDefinition,
  WorkflowEdge,
} from '@neuron/shared';
import type {
  GraphState,
  NodeStatus,
  RuntimeState,
  SessionState,
  UIState,
  WorkflowExecution,
  WorkflowExecutionLog,
} from './types';

/**
 * Pure selectors. All functions are referentially stable module exports so
 * they can be reused directly with Zustand's hook API (which memoizes the
 * selector reference).
 */

export const selectNodeStatus =
  (nodeId: string) =>
  (state: RuntimeState): NodeStatus =>
    state.nodeStatus[nodeId] ?? 'idle';

export const selectNodeError =
  (nodeId: string) =>
  (state: RuntimeState): string | undefined =>
    state.nodeErrors?.[nodeId];

export const selectNodeOutput =
  (nodeId: string) =>
  (state: RuntimeState): unknown =>
    state.nodeOutputs?.[nodeId];

export const selectActiveEdges = (state: RuntimeState): Record<string, boolean> =>
  state.activeEdges;

export const selectRuntimeLogs = (state: RuntimeState): WorkflowExecutionLog[] =>
  Object.values(state.logs);

export const selectExecutions = (state: RuntimeState): WorkflowExecution[] =>
  Object.values(state.executions);

export const selectIsDirty = (state: GraphState): boolean => state.isDirty;

export const selectGlobalVariables = (
  state: GraphState
): Record<string, GlobalVariable> => state.globalVariables;

export const selectGraph = (state: GraphState): WorkflowDefinition => state.graph;

export const selectUiFlags = (state: UIState) => ({
  activeLeftPanel: state.activeLeftPanel,
  activeRightPanel: state.activeRightPanel,
  selectedNodeId: state.selectedNodeId,
  selectedHandle: state.selectedHandle,
  isDeployWorkflowDialogOpen: state.isDeployWorkflowDialogOpen,
});

export const selectSessionFlags = (state: SessionState) => ({
  bootstrapStatus: state.bootstrapStatus,
  isWorkflowLoading: state.isWorkflowLoading,
  isWorkflowSaving: state.isWorkflowSaving,
  saveStatus: state.saveStatus,
  retryCount: state.retryCount,
  isRunning: state.isRunning,
  isDeploying: state.isDeploying,
  isLogsLoading: state.isLogsLoading,
  lastError: state.lastError,
});

export interface ReactFlowNodeView {
  id: string;
  position: { x: number; y: number };
  type: NodeType;
  data: Record<string, unknown>;
  selected: boolean;
}

export interface ReactFlowEdgeView extends WorkflowEdge {
  type: 'default';
  animated: boolean;
  style: {
    stroke: string;
    strokeWidth: number;
    transition: string;
    opacity: number;
  };
}

/**
 * Derives the canvas view from the graph plus the two slice-owned inputs.
 * The stroke values are the pre-existing editor values and are intentionally
 * unchanged in this migration phase.
 */
export function deriveReactFlowView(
  graph: WorkflowDefinition,
  selectedNodeId: string | null,
  activeEdges: Record<string, boolean>
): { nodes: ReactFlowNodeView[]; edges: ReactFlowEdgeView[] } {
  const nodes = Object.values(graph.nodes).map((node) => ({
    id: node.id,
    position: { x: node.position.x, y: node.position.y },
    type: node.type,
    data: { ...(node.config as unknown as Record<string, unknown>), label: node.type },
    selected: selectedNodeId === node.id,
  }));

  const edges = Object.values(graph.edges).map((edge) => {
    const isActive = !!activeEdges[edge.id];
    return {
      ...edge,
      type: 'default' as const,
      animated: isActive,
      style: {
        stroke: isActive ? '#ffffff' : '#c8c8c8',
        strokeWidth: isActive ? 5 : 4,
        transition: 'stroke 0.4s ease, stroke-width 0.4s ease',
        opacity: 1,
      },
    };
  });

  return { nodes, edges };
}
