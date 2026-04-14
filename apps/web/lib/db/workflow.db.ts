import Dexie, { type Table } from 'dexie';

export interface LocalWorkflow {
  id: string;
  graph: any;
  globalVariables: any;
  updatedAt: number;
  synced: boolean; // Flag to track if backend matches local
}

export class WorkflowDexie extends Dexie {
  drafts!: Table<LocalWorkflow>;

  constructor() {
    super('NeuronWorkflowDB');
    this.version(1).stores({
      drafts: 'id, updatedAt, synced',
    });
  }
}

export const db = new WorkflowDexie();
