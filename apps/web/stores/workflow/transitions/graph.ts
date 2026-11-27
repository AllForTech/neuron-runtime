import type {
  GlobalVariable,
  WorkflowDefinition,
  WorkflowEdge,
  WorkflowNode,
} from '@neuron/shared';
import {
  GRAPH_ACTIONS,
  type ActionEnvelope,
  type GraphState,
  type WorkflowDeploymentRecord,
  type WorkflowMetadata,
} from '../types';

/**
 * Pure graph transitions. These are the extracted `workflowEditorReducer`
 * branches minus the duplicated runtime visuals, which are owned by the
 * runtime store. Every function returns a new state object and mutates nothing.
 */

export function createInitialGraphState(): GraphState {
  return {
    workflowId: '',
    graph: { nodes: {}, edges: {} },
    workflow: { id: '', name: '', description: '', status: 'draft', userId: '' },
    globalVariables: {},
    deployment: null,
    isDirty: false,
  };
}

export function setWorkflowId(state: GraphState, workflowId: string): GraphState {
  return { ...state, workflowId };
}

export function setGraph(state: GraphState, graph: WorkflowDefinition): GraphState {
  return { ...state, graph, isDirty: false };
}

export function setWorkflowMetadata(
  state: GraphState,
  workflow: WorkflowMetadata
): GraphState {
  return { ...state, workflow };
}

export function addNode(state: GraphState, node: WorkflowNode): GraphState {
  return {
    ...state,
    graph: {
      ...state.graph,
      nodes: { ...state.graph.nodes, [node.id]: node },
    },
    isDirty: true,
  };
}

export function updateNode(
  state: GraphState,
  id: string,
  payload: Record<string, unknown>
): GraphState {
  return {
    ...state,
    graph: {
      ...state.graph,
      nodes: {
        ...state.graph.nodes,
        [id]: {
          ...state.graph.nodes[id],
          config: { ...payload },
        } as unknown as WorkflowNode,
      },
    },
    isDirty: true,
  };
}

export function updateNodePosition(
  state: GraphState,
  id: string,
  position: { x: number; y: number }
): GraphState {
  const node = state.graph.nodes[id];
  if (!node) return state;
  return {
    ...state,
    graph: {
      ...state.graph,
      nodes: {
        ...state.graph.nodes,
        [id]: {
          ...node,
          position: {
            x: Math.round(position.x),
            y: Math.round(position.y),
          },
        },
      },
    },
    isDirty: true,
  };
}

export function deleteNode(state: GraphState, id: string): GraphState {
  const nodes = { ...state.graph.nodes };
  delete nodes[id];
  return { ...state, graph: { ...state.graph, nodes }, isDirty: true };
}

export function addEdge(state: GraphState, edge: WorkflowEdge): GraphState {
  return {
    ...state,
    graph: {
      ...state.graph,
      edges: { ...state.graph.edges, [edge.id]: edge },
    },
    isDirty: true,
  };
}

export function deleteEdge(state: GraphState, id: string): GraphState {
  const edges = { ...state.graph.edges };
  delete edges[id];
  return { ...state, graph: { ...state.graph, edges }, isDirty: true };
}

export function updateEdge(
  state: GraphState,
  id: string,
  payload: Partial<WorkflowEdge>
): GraphState {
  return {
    ...state,
    graph: {
      ...state.graph,
      edges: {
        ...state.graph.edges,
        [id]: { ...state.graph.edges[id], ...payload },
      },
    },
    isDirty: true,
  };
}

export function updateGlobalVars(
  state: GraphState,
  globalVariables: Record<string, GlobalVariable>
): GraphState {
  return { ...state, globalVariables, isDirty: true };
}

export function setDeployment(
  state: GraphState,
  deployment: Record<string, WorkflowDeploymentRecord> | null
): GraphState {
  return { ...state, deployment };
}

export function updateDeployment(
  state: GraphState,
  deployment: WorkflowDeploymentRecord
): GraphState {
  return {
    ...state,
    deployment: { [deployment.id]: deployment, ...state.deployment },
  };
}

export function updateDirtyState(state: GraphState, dirty?: boolean): GraphState {
  return { ...state, isDirty: dirty ?? false };
}

/** Graph reset is full: it never touches runtime, UI or session state. */
export function resetGraph(): GraphState {
  return createInitialGraphState();
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

/**
 * Boundary reducer used by the realtime adapter. It accepts arbitrary string
 * action types: unknown types are a no-op, and malformed known payloads are
 * ignored rather than corrupting the graph.
 */
export function graphReducer(state: GraphState, action: ActionEnvelope): GraphState {
  switch (action.type) {
    case GRAPH_ACTIONS.SET_WORKFLOW_ID:
      return typeof action.workflowId === 'string'
        ? setWorkflowId(state, action.workflowId)
        : state;
    case GRAPH_ACTIONS.SET_GRAPH: {
      const graph = action.payload;
      if (!isRecord(graph) || !isRecord(graph.nodes) || !isRecord(graph.edges)) {
        return state;
      }
      return setGraph(state, graph as unknown as WorkflowDefinition);
    }
    case GRAPH_ACTIONS.ADD_NODE: {
      const node = action.payload;
      if (!isRecord(node) || typeof node.id !== 'string') return state;
      return addNode(state, node as unknown as WorkflowNode);
    }
    case GRAPH_ACTIONS.UPDATE_NODE:
      return typeof action.id === 'string' && isRecord(action.payload)
        ? updateNode(state, action.id, action.payload)
        : state;
    case GRAPH_ACTIONS.UPDATE_NODE_POSITION: {
      const position = action.position;
      if (
        typeof action.id !== 'string' ||
        !isRecord(position) ||
        typeof position.x !== 'number' ||
        typeof position.y !== 'number'
      ) {
        return state;
      }
      return updateNodePosition(state, action.id, {
        x: position.x,
        y: position.y,
      });
    }
    case GRAPH_ACTIONS.DELETE_NODE:
      return typeof action.id === 'string' ? deleteNode(state, action.id) : state;
    case GRAPH_ACTIONS.ADD_EDGE: {
      const edge = action.payload;
      if (!isRecord(edge) || typeof edge.id !== 'string') return state;
      return addEdge(state, edge as unknown as WorkflowEdge);
    }
    case GRAPH_ACTIONS.DELETE_EDGE:
      return typeof action.id === 'string' ? deleteEdge(state, action.id) : state;
    case GRAPH_ACTIONS.UPDATE_EDGE:
      return typeof action.id === 'string' && isRecord(action.payload)
        ? updateEdge(state, action.id, action.payload as Partial<WorkflowEdge>)
        : state;
    case GRAPH_ACTIONS.UPDATE_GLOBAL_VARS:
      return isRecord(action.payload)
        ? updateGlobalVars(state, action.payload as Record<string, GlobalVariable>)
        : state;
    case GRAPH_ACTIONS.SET_DEPLOYMENT:
      return isRecord(action.payload) || action.payload === null
        ? setDeployment(
            state,
            action.payload as Record<string, WorkflowDeploymentRecord> | null
          )
        : state;
    case GRAPH_ACTIONS.UPDATE_DEPLOYMENT: {
      const deployment = action.payload;
      if (!isRecord(deployment) || typeof deployment.id !== 'string') return state;
      return updateDeployment(
        state,
        deployment as unknown as WorkflowDeploymentRecord
      );
    }
    case GRAPH_ACTIONS.UPDATE_DIRTY_STATE:
      return updateDirtyState(state, action.state as boolean | undefined);
    default:
      return state;
  }
}
