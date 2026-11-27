'use client';

import { createContext } from 'react';
import type { createWorkflowCommands } from '../commands/workflowCommands';

/** TEMPORARY (TODO T-124): commands created by the bootstrap, consumed by the shim. */

export type WorkflowCommands = ReturnType<typeof createWorkflowCommands>;

export interface WorkflowSessionContextValue {
  commands: WorkflowCommands;
}

/**
 * The bootstrap is the single owner of command instances. This context lets the
 * temporary provider shim call those exact instances without constructing a
 * second set of clients/timers.
 */
export const WorkflowSessionContext =
  createContext<WorkflowSessionContextValue | null>(null);
