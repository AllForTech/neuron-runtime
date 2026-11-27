import type {
  GlobalVariable,
  NodeType,
  WorkflowDefinition,
  WorkflowEdge,
  WorkflowNode,
} from '@neuron/shared';
import type {
  GraphState,
  WorkflowDeploymentRecord,
  WorkflowExecution,
  WorkflowExecutionLog,
} from '../stores/workflow/types';

/**
 * Row -> domain mappers for the editor.
 *
 * The row shapes below are structural mirrors of the API/Dexie rows currently
 * used by the editor provider. They are declared here so no web store or
 * adapter needs to import `@neuron/db` row types.
 */

export interface GraphNodeRow {
  id: string;
  type: NodeType;
  positionX: number;
  positionY: number;
  config: WorkflowNode['config'];
}

export interface GraphEdgeRow {
  id: string;
  source: string;
  target: string;
  sourceHandle?: string;
  targetHandle?: string;
}

export interface GraphResponseRow {
  graph: { nodes: GraphNodeRow[]; edges: GraphEdgeRow[] };
  executions?: WorkflowExecution[];
  globalVariables?: GlobalVariable[];
}

export interface DeploymentRow {
  id: string;
  [key: string]: unknown;
}

export interface DraftRow {
  id: string;
  graph: WorkflowDefinition;
  globalVariables: Record<string, GlobalVariable>;
  updatedAt: number;
  synced: boolean;
}

export function mapNodeRows(nodes: readonly GraphNodeRow[]): Record<string, WorkflowNode> {
  const result: Record<string, WorkflowNode> = {};
  for (const node of nodes) {
    result[node.id] = {
      id: node.id,
      type: node.type,
      position: { x: node.positionX, y: node.positionY },
      config: node.config,
    } as WorkflowNode;
  }
  return result;
}

export function mapEdgeRows(edges: readonly GraphEdgeRow[]): Record<string, WorkflowEdge> {
  const result: Record<string, WorkflowEdge> = {};
  for (const edge of edges) {
    result[edge.id] = {
      id: edge.id,
      source: edge.source,
      target: edge.target,
      sourceHandle: edge.sourceHandle,
      targetHandle: edge.targetHandle,
    };
  }
  return result;
}

export function mapExecutionRows(
  executions: readonly WorkflowExecution[] = []
): Record<string, WorkflowExecution> {
  const result: Record<string, WorkflowExecution> = {};
  for (const execution of executions) {
    result[execution.id] = execution;
  }
  return result;
}

export function mapExecutionLogRows(
  logs: readonly WorkflowExecutionLog[] = []
): Record<string, WorkflowExecutionLog> {
  const result: Record<string, WorkflowExecutionLog> = {};
  for (const log of logs) {
    result[log.id] = log;
  }
  return result;
}

export function mapGlobalVariableRows(
  variables: readonly GlobalVariable[] = []
): Record<string, GlobalVariable> {
  const result: Record<string, GlobalVariable> = {};
  for (const variable of variables) {
    result[variable.key] = variable;
  }
  return result;
}

/** A missing/empty deployment list maps to `null`, matching the provider. */
export function mapDeploymentRows(
  rows: readonly DeploymentRow[] | null | undefined
): Record<string, WorkflowDeploymentRecord> | null {
  if (!rows || rows.length === 0) return null;
  const result: Record<string, WorkflowDeploymentRecord> = {};
  for (const row of rows) {
    result[row.id] = row;
  }
  return result;
}

/** Full cloud graph response -> the three slices it populates. */
export function mapGraphResponse(response: GraphResponseRow): {
  graph: WorkflowDefinition;
  globalVariables: Record<string, GlobalVariable>;
  executions: Record<string, WorkflowExecution>;
} {
  return {
    graph: {
      nodes: mapNodeRows(response.graph.nodes),
      edges: mapEdgeRows(response.graph.edges),
    },
    globalVariables: mapGlobalVariableRows(response.globalVariables),
    executions: mapExecutionRows(response.executions),
  };
}

/** Draft row -> graph patch (the draft remains Dexie-owned). */
export function mapDraftRowToGraphState(
  draft: DraftRow
): Pick<GraphState, 'graph' | 'globalVariables'> {
  return {
    graph: draft.graph,
    globalVariables: draft.globalVariables,
  };
}
