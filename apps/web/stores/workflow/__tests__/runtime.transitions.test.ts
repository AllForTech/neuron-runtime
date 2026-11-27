import { describe, expect, it } from 'vitest';
import {
  addExecution,
  addLog,
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
  updateExecution,
  updateLogs,
} from '../transitions/runtime';
import type { WorkflowExecution, WorkflowExecutionLog } from '../types';

function makeExecution(id: string): WorkflowExecution {
  return { id, workflowId: 'wf', userId: 'u', status: 'running', startedAt: 'now' };
}

function makeLog(
  id: string,
  status: WorkflowExecutionLog['status'] = 'running'
): WorkflowExecutionLog {
  return {
    id,
    executionId: 'ex1',
    nodeId: 'n1',
    nodeType: 't',
    nodeLabel: 'L',
    status,
    input: null,
    startedAt: 'now',
    order: 1,
    createdAt: 'now',
  };
}

describe('runtime transitions', () => {
  it('tracks node status, outputs and errors', () => {
    let state = createInitialRuntimeState();
    state = applyNodeExecutionStart(state, 'n1');
    expect(state.nodeStatus.n1).toBe('running');

    state = applyNodeExecutionSuccess(state, 'n1', { ok: true });
    expect(state.nodeStatus.n1).toBe('success');
    expect(state.nodeOutputs?.n1).toEqual({ ok: true });

    state = applyNodeExecutionError(state, 'n2', 'boom');
    expect(state.nodeStatus.n2).toBe('error');
    expect(state.nodeErrors?.n2).toBe('boom');
  });

  it('tracks active edges and execution/log records', () => {
    let state = createInitialRuntimeState();
    state = setEdgeActive(state, 'e1', true);
    state = setExecutions(state, {
      ex1: { id: 'ex1', workflowId: 'wf', userId: 'u', status: 'running', startedAt: 'now' },
    });
    state = addExecution(state, {
      id: 'ex2',
      workflowId: 'wf',
      userId: 'u',
      status: 'pending',
      startedAt: 'later',
    });
    state = updateExecution(state, 'ex1', { status: 'success' });
    state = setLogs(state, {
      l1: {
        id: 'l1',
        executionId: 'ex1',
        nodeId: 'n1',
        nodeType: 't',
        nodeLabel: 'L',
        status: 'running',
        input: null,
        startedAt: 'now',
        order: 1,
        createdAt: 'now',
      },
    });
    state = addLog(state, {
      id: 'l2',
      executionId: 'ex1',
      nodeId: 'n2',
      nodeType: 't',
      nodeLabel: 'L2',
      status: 'pending',
      input: null,
      startedAt: 'now',
      order: 2,
      createdAt: 'now',
    });
    state = updateLogs(state, 'l1', { status: 'success' });

    expect(state.activeEdges.e1).toBe(true);
    expect(state.executions.ex1.status).toBe('success');
    expect(state.executions.ex2.id).toBe('ex2');
    expect(state.logs.l1.status).toBe('success');
    expect(state.logs.l2.id).toBe('l2');
  });

  it('updateLogs applies the patch to the targeted record and preserves the rest', () => {
    const state = setLogs(createInitialRuntimeState(), {
      l1: makeLog('l1', 'running'),
      l2: makeLog('l2', 'pending'),
    });

    const next = updateLogs(state, 'l1', { status: 'success', output: { ok: true } });

    expect(next).not.toBe(state);
    expect(next.logs.l1).toMatchObject({
      id: 'l1',
      status: 'success',
      output: { ok: true },
    });
    expect(next.logs.l2).toEqual(state.logs.l2);
    expect(state.logs.l1.status).toBe('running');
  });

  it('runtimeReducer UPDATE_LOGS applies the patch at the realtime boundary', () => {
    const state = setLogs(createInitialRuntimeState(), { l1: makeLog('l1', 'running') });

    const next = runtimeReducer(state, {
      type: 'UPDATE_LOGS',
      id: 'l1',
      payload: { status: 'success' },
    });

    expect(next.logs.l1.status).toBe('success');
  });

  it('ignores updates for unknown execution/log ids', () => {
    const state = createInitialRuntimeState();
    expect(updateExecution(state, 'missing', { status: 'failed' })).toBe(state);
    expect(updateLogs(state, 'missing', { status: 'error' })).toBe(state);
  });

  it('has distinct reset semantics', () => {
    const state = {
      ...createInitialRuntimeState(),
      nodeStatus: { n1: 'error' as const },
      nodeErrors: { n1: 'boom' },
      nodeOutputs: { n1: 1 },
      activeEdges: { e1: true },
      executions: { ex1: makeExecution('ex1') },
      logs: { l1: makeLog('l1') },
    };

    expect(resetNodeStatus(state)).toEqual({
      ...state,
      nodeStatus: {},
      nodeErrors: {},
      nodeOutputs: null,
    });
    expect(resetFlowVisuals(state)).toEqual({
      ...state,
      nodeStatus: {},
      activeEdges: {},
    });
    expect(clearRuntime()).toEqual(createInitialRuntimeState());
  });

  it('reducer routes known runtime events and ignores unknown ones', () => {
    let state = createInitialRuntimeState();
    state = runtimeReducer(state, {
      type: 'NODE_EXECUTION_START',
      nodeId: 'n1',
    });
    state = runtimeReducer(state, {
      type: 'NODE_EXECUTION_SUCCESS',
      nodeId: 'n1',
      output: 42,
    });
    state = runtimeReducer(state, {
      type: 'SET_EDGE_ACTIVE',
      edgeId: 'e1',
      isActive: true,
    });
    expect(state.nodeStatus.n1).toBe('success');
    expect(state.nodeOutputs?.n1).toBe(42);
    expect(state.activeEdges.e1).toBe(true);
    expect(runtimeReducer(state, { type: 'NOPE' })).toBe(state);
  });
});
