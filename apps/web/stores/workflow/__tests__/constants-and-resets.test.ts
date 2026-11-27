import { describe, expect, it } from 'vitest';
import {
  AUTOSAVE_DEBOUNCE_MS,
  CONTEXT_TO_LOCAL_SYNC_MS,
  GRAPH_DEBOUNCE_MS,
  LOCAL_TO_CONTEXT_DEBOUNCE_MS,
  REALTIME_CHANNEL_PREFIX,
  RETRY_ATTEMPTS,
  RETRY_DELAYS_MS,
  SAVED_STATUS_RESET_MS,
  TIMING_POLICY,
  WORKFLOW_ACTION_EVENT,
  WORKFLOW_RUNTIME_ACTION_EVENT,
} from '../constants';
import {
  createInitialGraphState,
  createInitialRuntimeState,
  createInitialSessionState,
  createInitialUIState,
  resetFlowVisuals,
  resetNodeStatus,
} from '../transitions';
import { graphStore } from '../graphStore';
import { runtimeStore } from '../runtimeStore';
import { sessionStore } from '../sessionStore';
import { uiStore } from '../uiStore';
import type { WorkflowExecution, WorkflowExecutionLog } from '../types';

function makeExecution(id: string): WorkflowExecution {
  return { id, workflowId: 'wf', userId: 'u', status: 'running', startedAt: 'now' };
}

function makeLog(id: string): WorkflowExecutionLog {
  return {
    id,
    executionId: 'ex1',
    nodeId: 'n1',
    nodeType: 't',
    nodeLabel: 'L',
    status: 'running',
    input: null,
    startedAt: 'now',
    order: 1,
    createdAt: 'now',
  };
}

describe('workflow store timing constants', () => {
  it('pins editor debounce/sync timings', () => {
    expect(LOCAL_TO_CONTEXT_DEBOUNCE_MS).toBe(100);
    expect(CONTEXT_TO_LOCAL_SYNC_MS).toBe(200);
    expect(GRAPH_DEBOUNCE_MS).toBe(200);
    expect(AUTOSAVE_DEBOUNCE_MS).toBe(3000);
    expect(SAVED_STATUS_RESET_MS).toBe(3000);
  });

  it('pins retry schedule and attempts', () => {
    expect(RETRY_ATTEMPTS).toBe(5);
    expect(RETRY_DELAYS_MS).toEqual([1000, 3000, 7000, 15000, 30000]);
    expect(TIMING_POLICY.retryAttempts).toBe(RETRY_ATTEMPTS);
    expect(TIMING_POLICY.retryDelaysMs).toEqual(RETRY_DELAYS_MS);
  });

  it('pins frozen realtime wire strings', () => {
    expect(REALTIME_CHANNEL_PREFIX).toBe('workflow_');
    expect(WORKFLOW_ACTION_EVENT).toBe('workflow_action');
    expect(WORKFLOW_RUNTIME_ACTION_EVENT).toBe('workflow_runtime_action');
  });
});

describe('distinct reset semantics', () => {
  it('resetNodeStatus clears node status/errors/outputs only', () => {
    const state = {
      ...createInitialRuntimeState(),
      nodeStatus: { n1: 'error' as const },
      nodeErrors: { n1: 'boom' },
      nodeOutputs: { n1: { ok: true } },
      activeEdges: { e1: true },
      executions: { ex1: makeExecution('ex1') },
      logs: { l1: makeLog('l1') },
    };

    const next = resetNodeStatus(state);

    expect(next.nodeStatus).toEqual({});
    expect(next.nodeErrors).toEqual({});
    expect(next.nodeOutputs).toBeNull();
    expect(next.activeEdges).toEqual({ e1: true });
    expect(next.executions).toEqual({ ex1: makeExecution('ex1') });
    expect(next.logs).toEqual({ l1: makeLog('l1') });
  });

  it('resetFlowVisuals clears node status/activeEdges only', () => {
    const state = {
      ...createInitialRuntimeState(),
      nodeStatus: { n1: 'running' as const },
      nodeErrors: { n1: 'boom' },
      nodeOutputs: { n1: { ok: true } },
      activeEdges: { e1: true },
      executions: { ex1: makeExecution('ex1') },
      logs: { l1: makeLog('l1') },
    };

    const next = resetFlowVisuals(state);

    expect(next.nodeStatus).toEqual({});
    expect(next.activeEdges).toEqual({});
    expect(next.nodeErrors).toEqual({ n1: 'boom' });
    expect(next.nodeOutputs).toEqual({ n1: { ok: true } });
    expect(next.executions).toEqual({ ex1: makeExecution('ex1') });
    expect(next.logs).toEqual({ l1: makeLog('l1') });
  });

  it('store resets are independent', () => {
    graphStore.setState({
      ...createInitialGraphState(),
      workflowId: 'wf',
      isDirty: true,
    });
    runtimeStore.setState({
      ...createInitialRuntimeState(),
      nodeStatus: { n1: 'running' },
    });
    uiStore.setState({ ...createInitialUIState(), selectedNodeId: 'n1' });
    sessionStore.setState({ ...createInitialSessionState(), isRunning: true });

    graphStore.getState().resetGraph();
    runtimeStore.getState().clearRuntime();
    uiStore.getState().resetUI();
    sessionStore.getState().resetSession();

    expect(graphStore.getState()).toMatchObject(createInitialGraphState());
    expect(runtimeStore.getState()).toMatchObject(createInitialRuntimeState());
    expect(uiStore.getState()).toMatchObject(createInitialUIState());
    expect(sessionStore.getState()).toMatchObject(createInitialSessionState());
  });
});
