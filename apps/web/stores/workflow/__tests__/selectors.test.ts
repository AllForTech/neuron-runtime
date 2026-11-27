import { describe, expect, it } from 'vitest';
import {
  deriveReactFlowView,
  selectNodeError,
  selectNodeOutput,
  selectNodeStatus,
  selectRuntimeLogs,
  selectSelectedNodeView,
  selectSessionFlags,
  selectUiFlags,
} from '../selectors';
import { createInitialGraphState } from '../transitions/graph';
import { createInitialRuntimeState } from '../transitions/runtime';
import { createInitialSessionState } from '../transitions/session';
import { createInitialUIState } from '../transitions/ui';
import type { WorkflowDefinition } from '@neuron/shared';

describe('selectors', () => {
  it('selects runtime node slices with defaults', () => {
    const state = {
      ...createInitialRuntimeState(),
      nodeStatus: { n1: 'running' as const },
      nodeErrors: { n1: 'boom' },
      nodeOutputs: { n1: { ok: true } },
      logs: {
        l1: {
          id: 'l1',
          executionId: 'e1',
          nodeId: 'n1',
          nodeType: 't',
          nodeLabel: 'L',
          status: 'success' as const,
          input: null,
          startedAt: 'now',
          order: 1,
          createdAt: 'now',
        },
      },
    };

    expect(selectNodeStatus('n1')(state)).toBe('running');
    expect(selectNodeStatus('missing')(state)).toBe('idle');
    expect(selectNodeError('n1')(state)).toBe('boom');
    expect(selectNodeOutput('n1')(state)).toEqual({ ok: true });
    expect(selectRuntimeLogs(state)).toHaveLength(1);
  });

  it('selects ui/session flags as plain objects', () => {
    expect(selectUiFlags(createInitialUIState())).toEqual({
      activeLeftPanel: null,
      activeRightPanel: null,
      selectedNodeId: null,
      selectedHandle: null,
      isDeployWorkflowDialogOpen: false,
    });
    expect(selectSessionFlags(createInitialSessionState())).toMatchObject({
      bootstrapStatus: 'idle',
      isWorkflowLoading: false,
      saveStatus: 'idle',
      retryCount: 0,
    });
  });

  it('derives ReactFlow view with selection and active edge styling', () => {
    const graph: WorkflowDefinition = {
      ...createInitialGraphState().graph,
      nodes: {
        n1: {
          id: 'n1',
          type: 'Utility.Debug',
          position: { x: 1, y: 2 },
          config: { meta: { label: 'D' }, message: 'x' },
        },
      },
      edges: {
        e1: { id: 'e1', source: 'n1', target: 'n2' },
      },
    };

    const view = deriveReactFlowView(graph, 'n1', { e1: true });
    expect(view.nodes[0]).toMatchObject({ id: 'n1', selected: true, type: 'Utility.Debug' });
    expect(view.edges[0]).toMatchObject({
      id: 'e1',
      animated: true,
      style: { stroke: '#ffffff', strokeWidth: 5 },
    });
  });

  it('derives the selected node as a plain view with the canvas data shape', () => {
    const graph: WorkflowDefinition = {
      ...createInitialGraphState().graph,
      nodes: {
        n1: {
          id: 'n1',
          type: 'Utility.Debug',
          position: { x: 1, y: 2 },
          config: { meta: { label: 'D' }, message: 'x' },
        },
      },
    };
    const config = graph.nodes.n1.config;
    const canvasNode = deriveReactFlowView(graph, 'n1', {}).nodes[0];

    const view = selectSelectedNodeView(graph, 'n1');
    expect(view).toEqual({
      id: 'n1',
      type: 'Utility.Debug',
      position: { x: 1, y: 2 },
      data: { meta: { label: 'D' }, message: 'x', label: 'Utility.Debug' },
    });
    expect(view?.data).toEqual(canvasNode.data);
    expect(Object.keys(view ?? {})).toEqual(['id', 'type', 'position', 'data']);
    expect(view).not.toHaveProperty('selected');
    expect(graph.nodes.n1.config).toEqual(config);
    expect(view?.data).not.toBe(config);

    const editedGraph: WorkflowDefinition = {
      ...graph,
      nodes: {
        n1: {
          ...graph.nodes.n1,
          config: { meta: { label: 'D' }, message: 'edited' },
        },
      },
    };
    expect(selectSelectedNodeView(editedGraph, 'n1')?.data).toMatchObject({
      message: 'edited',
      label: 'Utility.Debug',
    });
  });

  it('returns null for unset or unknown selection ids', () => {
    const graph = createInitialGraphState().graph;
    expect(selectSelectedNodeView(graph, null)).toBeNull();
    expect(selectSelectedNodeView(graph, '')).toBeNull();
    expect(selectSelectedNodeView(graph, 'missing')).toBeNull();
  });
});
