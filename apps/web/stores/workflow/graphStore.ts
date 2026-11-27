import { create } from 'zustand';
import type { GlobalVariable, WorkflowDefinition, WorkflowEdge, WorkflowNode } from '@neuron/shared';
import type {
  ActionEnvelope,
  GraphState,
  WorkflowDeploymentRecord,
  WorkflowMetadata,
} from './types';
import {
  addEdge as addEdgeTransition,
  addNode as addNodeTransition,
  createInitialGraphState,
  deleteEdge as deleteEdgeTransition,
  deleteNode as deleteNodeTransition,
  graphReducer,
  resetGraph as resetGraphTransition,
  setDeployment as setDeploymentTransition,
  setGraph as setGraphTransition,
  setWorkflowId as setWorkflowIdTransition,
  setWorkflowMetadata as setWorkflowMetadataTransition,
  updateDeployment as updateDeploymentTransition,
  updateDirtyState as updateDirtyStateTransition,
  updateEdge as updateEdgeTransition,
  updateGlobalVars as updateGlobalVarsTransition,
  updateNode as updateNodeTransition,
  updateNodePosition as updateNodePositionTransition,
} from './transitions/graph';

export interface GraphStore extends GraphState {
  setWorkflowId: (workflowId: string) => void;
  setGraph: (graph: WorkflowDefinition) => void;
  setWorkflowMetadata: (workflow: WorkflowMetadata) => void;
  addNode: (node: WorkflowNode) => void;
  updateNode: (id: string, payload: Record<string, unknown>) => void;
  updateNodePosition: (id: string, position: { x: number; y: number }) => void;
  deleteNode: (id: string) => void;
  addEdge: (edge: WorkflowEdge) => void;
  deleteEdge: (id: string) => void;
  updateEdge: (id: string, payload: Partial<WorkflowEdge>) => void;
  updateGlobalVars: (globalVariables: Record<string, GlobalVariable>) => void;
  setDeployment: (deployment: Record<string, WorkflowDeploymentRecord> | null) => void;
  updateDeployment: (deployment: WorkflowDeploymentRecord) => void;
  updateDirtyState: (dirty?: boolean) => void;
  markClean: () => void;
  resetGraph: () => void;
  dispatch: (action: ActionEnvelope) => void;
}

/** Single owner of workflow graph, global variables, deployment and metadata. */
export const graphStore = create<GraphStore>()((set) => ({
  ...createInitialGraphState(),
  setWorkflowId: (workflowId) => set((s) => setWorkflowIdTransition(s, workflowId)),
  setGraph: (graph) => set((s) => setGraphTransition(s, graph)),
  setWorkflowMetadata: (workflow) =>
    set((s) => setWorkflowMetadataTransition(s, workflow)),
  addNode: (node) => set((s) => addNodeTransition(s, node)),
  updateNode: (id, payload) => set((s) => updateNodeTransition(s, id, payload)),
  updateNodePosition: (id, position) =>
    set((s) => updateNodePositionTransition(s, id, position)),
  deleteNode: (id) => set((s) => deleteNodeTransition(s, id)),
  addEdge: (edge) => set((s) => addEdgeTransition(s, edge)),
  deleteEdge: (id) => set((s) => deleteEdgeTransition(s, id)),
  updateEdge: (id, payload) => set((s) => updateEdgeTransition(s, id, payload)),
  updateGlobalVars: (globalVariables) =>
    set((s) => updateGlobalVarsTransition(s, globalVariables)),
  setDeployment: (deployment) =>
    set((s) => setDeploymentTransition(s, deployment)),
  updateDeployment: (deployment) =>
    set((s) => updateDeploymentTransition(s, deployment)),
  updateDirtyState: (dirty) => set((s) => updateDirtyStateTransition(s, dirty)),
  markClean: () => set((s) => updateDirtyStateTransition(s, false)),
  resetGraph: () => set(() => resetGraphTransition()),
  dispatch: (action) => set((s) => graphReducer(s, action)),
}));

/** Stable reference for non-React callers (adapters/commands/bootstrap only). */
export const dispatchGraphAction = (action: ActionEnvelope): void => {
  graphStore.getState().dispatch(action);
};
