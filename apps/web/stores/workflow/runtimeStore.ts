import { create } from 'zustand';
import type {
  ActionEnvelope,
  NodeStatus,
  RuntimeState,
  WorkflowExecution,
  WorkflowExecutionLog,
} from './types';
import {
  addExecution as addExecutionTransition,
  addLog as addLogTransition,
  applyNodeExecutionError,
  applyNodeExecutionStart,
  applyNodeExecutionSuccess,
  clearRuntime,
  createInitialRuntimeState,
  resetFlowVisuals,
  resetNodeStatus,
  runtimeReducer,
  setEdgeActive,
  setExecutions,
  setLogs,
  setNodeStatus,
  updateExecution,
  updateLogs,
} from './transitions/runtime';

export interface RuntimeStore extends RuntimeState {
  setNodeStatus: (nodeId: string, status: NodeStatus) => void;
  setEdgeActive: (edgeId: string, isActive: boolean) => void;
  setExecutions: (executions: Record<string, WorkflowExecution>) => void;
  addExecution: (execution: WorkflowExecution) => void;
  updateExecution: (executionId: string, payload: Partial<WorkflowExecution>) => void;
  setLogs: (logs: Record<string, WorkflowExecutionLog>) => void;
  addLog: (log: WorkflowExecutionLog) => void;
  updateLogs: (id: string, payload: Partial<WorkflowExecutionLog>) => void;
  applyNodeExecutionStart: (nodeId: string) => void;
  applyNodeExecutionSuccess: (nodeId: string, output: unknown) => void;
  applyNodeExecutionError: (nodeId: string, error: string) => void;
  resetNodeStatus: () => void;
  resetFlowVisuals: () => void;
  clearRuntime: () => void;
  dispatch: (action: ActionEnvelope) => void;
}

/** Single owner of node visuals, executions and logs. */
export const runtimeStore = create<RuntimeStore>()((set) => ({
  ...createInitialRuntimeState(),
  setNodeStatus: (nodeId, status) => set((s) => setNodeStatus(s, nodeId, status)),
  setEdgeActive: (edgeId, isActive) => set((s) => setEdgeActive(s, edgeId, isActive)),
  setExecutions: (executions) => set((s) => setExecutions(s, executions)),
  addExecution: (execution) => set((s) => addExecutionTransition(s, execution)),
  updateExecution: (executionId, payload) =>
    set((s) => updateExecution(s, executionId, payload)),
  setLogs: (logs) => set((s) => setLogs(s, logs)),
  addLog: (log) => set((s) => addLogTransition(s, log)),
  updateLogs: (id, payload) => set((s) => updateLogs(s, id, payload)),
  applyNodeExecutionStart: (nodeId) =>
    set((s) => applyNodeExecutionStart(s, nodeId)),
  applyNodeExecutionSuccess: (nodeId, output) =>
    set((s) => applyNodeExecutionSuccess(s, nodeId, output)),
  applyNodeExecutionError: (nodeId, error) =>
    set((s) => applyNodeExecutionError(s, nodeId, error)),
  resetNodeStatus: () => set((s) => resetNodeStatus(s)),
  resetFlowVisuals: () => set((s) => resetFlowVisuals(s)),
  clearRuntime: () => set(() => clearRuntime()),
  dispatch: (action) => set((s) => runtimeReducer(s, action)),
}));

/** Stable reference for non-React callers (adapters/commands/bootstrap only). */
export const dispatchRuntimeAction = (action: ActionEnvelope): void => {
  runtimeStore.getState().dispatch(action);
};
