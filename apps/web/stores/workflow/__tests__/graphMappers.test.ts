import { describe, expect, it } from 'vitest';
import {
  mapDeploymentRows,
  mapDraftRowToGraphState,
  mapEdgeRows,
  mapExecutionLogRows,
  mapExecutionRows,
  mapGlobalVariableRows,
  mapGraphResponse,
  mapNodeRows,
} from '../../../lib/graphMappers';
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

describe('graphMappers', () => {
  it('maps node rows from positionX/Y to position', () => {
    expect(
      mapNodeRows([
        {
          id: 'n1',
          type: 'Trigger.Manual',
          positionX: 10,
          positionY: 20,
          config: { meta: { label: 'T' }, triggerType: 'manual' },
        },
      ])
    ).toEqual({
      n1: {
        id: 'n1',
        type: 'Trigger.Manual',
        position: { x: 10, y: 20 },
        config: { meta: { label: 'T' }, triggerType: 'manual' },
      },
    });
  });

  it('maps edge, execution, log, global variable and deployment rows', () => {
    expect(
      mapEdgeRows([{ id: 'e1', source: 'a', target: 'b', sourceHandle: 's', targetHandle: 't' }])
    ).toEqual({ e1: { id: 'e1', source: 'a', target: 'b', sourceHandle: 's', targetHandle: 't' } });
    expect(mapExecutionRows([makeExecution('ex1')])).toEqual({ ex1: makeExecution('ex1') });
    expect(mapExecutionLogRows([makeLog('l1')])).toEqual({ l1: makeLog('l1') });
    expect(mapGlobalVariableRows([{ id: '1', key: 'api', value: 'v', type: 'string' }])).toEqual({
      api: { id: '1', key: 'api', value: 'v', type: 'string' },
    });
    expect(mapDeploymentRows([{ id: 'd1', private: true }])).toEqual({ d1: { id: 'd1', private: true } });
    expect(mapDeploymentRows([])).toBeNull();
    expect(mapDeploymentRows(null)).toBeNull();
  });

  it('maps full graph responses and draft rows', () => {
    const mapped = mapGraphResponse({
      graph: {
        nodes: [
          {
            id: 'n1',
            type: 'Utility.Debug',
            positionX: 0,
            positionY: 0,
            config: { meta: { label: 'D' }, message: 'x' },
          },
        ],
        edges: [{ id: 'e1', source: 'n1', target: 'n2' }],
      },
      executions: [makeExecution('ex1')],
      globalVariables: [{ id: '1', key: 'k', value: 'v', type: 'string' }],
    });
    expect(mapped.graph.nodes.n1.position).toEqual({ x: 0, y: 0 });
    expect(mapped.executions.ex1.id).toBe('ex1');
    expect(mapped.globalVariables.k.key).toBe('k');

    expect(
      mapDraftRowToGraphState({
        id: 'wf',
        graph: { nodes: {}, edges: {} },
        globalVariables: {},
        updatedAt: 1,
        synced: false,
      })
    ).toEqual({ graph: { nodes: {}, edges: {} }, globalVariables: {} });
  });
});
