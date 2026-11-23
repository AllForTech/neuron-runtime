import { describe, expect, it } from 'vitest';
import {
  addEdge,
  addNode,
  createInitialGraphState,
  deleteEdge,
  deleteNode,
  graphReducer,
  resetGraph,
  setGraph,
  setWorkflowId,
  updateDirtyState,
  updateEdge,
  updateGlobalVars,
  updateNode,
  updateNodePosition,
} from '../transitions/graph';

describe('graph transitions', () => {
  it('initializes and resets to a clean state', () => {
    const initial = createInitialGraphState();
    expect(initial.graph).toEqual({ nodes: {}, edges: {} });
    expect(initial.isDirty).toBe(false);
    expect(resetGraph()).toEqual(initial);
  });

  it('sets workflow id and graph payload', () => {
    let state = createInitialGraphState();
    state = setWorkflowId(state, 'wf-1');
    state = setGraph(state, {
      nodes: {
        n1: {
          id: 'n1',
          type: 'Trigger.Manual',
          position: { x: 0, y: 0 },
          config: { meta: { label: 'T' }, triggerType: 'manual' },
        },
      },
      edges: {},
    });
    expect(state.workflowId).toBe('wf-1');
    expect(state.isDirty).toBe(false);
    expect(state.graph.nodes.n1.id).toBe('n1');
  });

  it('adds, updates, moves and deletes nodes', () => {
    let state = createInitialGraphState();
    state = addNode(state, {
      id: 'n1',
      type: 'Utility.Debug',
      position: { x: 1.2, y: 2.8 },
      config: { meta: { label: 'D' }, message: 'hi' },
    });
    expect(state.isDirty).toBe(true);

    state = updateNode(state, 'n1', { message: 'updated' });
    expect(state.graph.nodes.n1.config).toEqual({ message: 'updated' });

    state = updateNodePosition(state, 'n1', { x: 10.6, y: 20.4 });
    expect(state.graph.nodes.n1.position).toEqual({ x: 11, y: 20 });

    state = deleteNode(state, 'n1');
    expect(state.graph.nodes.n1).toBeUndefined();
  });

  it('ignores moving unknown nodes and preserves dirty when requested', () => {
    let state = createInitialGraphState();
    state = updateDirtyState(state, true);
    const moved = updateNodePosition(state, 'missing', { x: 1, y: 1 });
    expect(moved).toBe(state);
    expect(updateDirtyState(state, undefined).isDirty).toBe(false);
  });

  it('adds, updates and deletes edges', () => {
    let state = createInitialGraphState();
    state = addEdge(state, { id: 'e1', source: 'a', target: 'b' });
    state = updateEdge(state, 'e1', { sourceHandle: 'out' });
    expect(state.graph.edges.e1.sourceHandle).toBe('out');
    state = deleteEdge(state, 'e1');
    expect(state.graph.edges.e1).toBeUndefined();
  });

  it('updates global variables and dirty flag', () => {
    let state = createInitialGraphState();
    state = updateGlobalVars(state, { api: { id: '1', key: 'api', value: 'x', type: 'string' } });
    expect(state.globalVariables.api.key).toBe('api');
    expect(state.isDirty).toBe(true);
  });

  it('reducer ignores unknown action types and malformed payloads', () => {
    const initial = createInitialGraphState();
    expect(graphReducer(initial, { type: 'UNKNOWN', anything: true })).toBe(initial);
    expect(graphReducer(initial, { type: 'SET_GRAPH', payload: { nodes: [] } })).toBe(initial);
    expect(graphReducer(initial, { type: 'ADD_NODE', payload: { nope: true } })).toBe(initial);
  });
});
