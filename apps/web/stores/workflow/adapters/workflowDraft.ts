import type { GlobalVariable, WorkflowDefinition } from '@neuron/shared';
import type { DraftRow } from '../../../lib/graphMappers';

/**
 * Typed boundary around the Dexie drafts table. Only this adapter and the
 * bootstrap composition touch the local draft; stores never see row objects.
 */

export interface DraftTable {
  get(id: string): Promise<DraftRow | undefined>;
  put(row: DraftRow): Promise<unknown>;
  update(id: string, changes: Partial<DraftRow>): Promise<unknown>;
}

export interface WorkflowDraftAdapter {
  get(id: string): Promise<DraftRow | undefined>;
  put(
    id: string,
    graph: WorkflowDefinition,
    globalVariables: Record<string, GlobalVariable>
  ): Promise<unknown>;
  markSynced(id: string): Promise<unknown>;
}

export function createWorkflowDraftAdapter(
  table: DraftTable,
  now: () => number = Date.now
): WorkflowDraftAdapter {
  return {
    get: (id) => table.get(id),
    put: (id, graph, globalVariables) =>
      table.put({
        id,
        graph,
        globalVariables,
        updatedAt: now(),
        synced: false,
      }),
    markSynced: (id) => table.update(id, { synced: true, updatedAt: now() }),
  };
}
