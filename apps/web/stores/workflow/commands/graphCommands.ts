import type { NodeType, WorkflowEdge, WorkflowNode } from '@neuron/shared';

/** Validated command helpers for graph mutations (stable, named actions). */
export interface GraphCommandTarget {
  addNode(node: WorkflowNode): void;
  updateNode(id: string, payload: Record<string, unknown>): void;
  updateNodePosition(id: string, position: { x: number; y: number }): void;
  deleteNode(id: string): void;
  addEdge(edge: WorkflowEdge): void;
  deleteEdge(id: string): void;
  updateEdge(id: string, payload: Partial<WorkflowEdge>): void;
  updateGlobalVars(variables: Record<string, unknown>): void;
  markClean(): void;
}

export function createGraphCommands(target: GraphCommandTarget) {
  return {
    addNode(node: WorkflowNode): boolean {
      if (!node || typeof node.id !== 'string' || node.id.length === 0) return false;
      target.addNode(node);
      return true;
    },
    updateNode(id: string, payload: Record<string, unknown>): boolean {
      if (!id || !payload || typeof payload !== 'object') return false;
      target.updateNode(id, payload);
      return true;
    },
    updateNodePosition(id: string, position: { x: number; y: number }): boolean {
      if (
        !id ||
        !position ||
        !Number.isFinite(position.x) ||
        !Number.isFinite(position.y)
      ) {
        return false;
      }
      target.updateNodePosition(id, position);
      return true;
    },
    deleteNode(id: string): boolean {
      if (!id) return false;
      target.deleteNode(id);
      return true;
    },
    addEdge(edge: WorkflowEdge): boolean {
      if (
        !edge ||
        typeof edge.id !== 'string' ||
        !edge.source ||
        !edge.target
      ) {
        return false;
      }
      target.addEdge(edge);
      return true;
    },
    deleteEdge(id: string): boolean {
      if (!id) return false;
      target.deleteEdge(id);
      return true;
    },
    updateEdge(id: string, payload: Partial<WorkflowEdge>): boolean {
      if (!id || !payload || typeof payload !== 'object') return false;
      target.updateEdge(id, payload);
      return true;
    },
    updateGlobalVars(variables: Record<string, unknown>): boolean {
      if (!variables || typeof variables !== 'object') return false;
      target.updateGlobalVars(variables);
      return true;
    },
    markClean(): void {
      target.markClean();
    },
  };
}

export interface TemplateInsert {
  type: NodeType;
  template: { defaultConfig: WorkflowNode['config'] };
}

/**
 * Adds a node from a template and, when a source node is supplied, the
 * connecting edge. Ids are injected so the command is deterministic in tests.
 */
export function insertTemplateNode(
  target: GraphCommandTarget,
  insert: TemplateInsert,
  connectingNode: { id: string; position: { x: number; y: number } } | undefined,
  idFactory: () => string,
  sourceHandle: string | null = null
): { nodeId: string; edgeId: string | null } | null {
  const nodeId = idFactory();
  if (!nodeId) return null;

  const position = connectingNode
    ? { x: connectingNode.position.x + 350, y: connectingNode.position.y + 250 }
    : { x: 200, y: 300 };

  const node = {
    id: nodeId,
    type: insert.type,
    position,
    config: insert.template.defaultConfig,
  } as WorkflowNode;

  if (!createGraphCommands(target).addNode(node)) return null;

  let edgeId: string | null = null;
  if (connectingNode) {
    edgeId = idFactory();
    if (
      edgeId &&
      !createGraphCommands(target).addEdge({
        id: edgeId,
        source: connectingNode.id,
        target: nodeId,
        sourceHandle: sourceHandle ?? undefined,
        targetHandle: nodeId,
        type: 'default',
      } as WorkflowEdge)
    ) {
      return null;
    }
  }

  return { nodeId, edgeId };
}
