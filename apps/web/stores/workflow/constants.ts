/**
 * Editor timing policy.
 *
 * These values are extracted from the existing editor behaviour and are part
 * of the observable save/sync contract. Changing any of them changes when a
 * user's edit reaches the server or the canvas, so they are pinned here and
 * asserted by tests instead of being sprinkled across components.
 */

/** Local canvas position -> context store debounce (Editor.onNodeDragStop). */
export const LOCAL_TO_CONTEXT_DEBOUNCE_MS = 100;

/** Context graph -> local ReactFlow state sync (Editor useEffect). */
export const CONTEXT_TO_LOCAL_SYNC_MS = 200;

/** Local canvas edge add -> context store debounce (Editor.onConnect). */
export const GRAPH_DEBOUNCE_MS = 200;

/** Cloud autosave debounce (WorkflowEditorProvider draft effect). */
export const AUTOSAVE_DEBOUNCE_MS = 3000;

/** How long the "saved" status is displayed before returning to idle. */
export const SAVED_STATUS_RESET_MS = 3000;

/** Number of retries after the first cloud-save attempt. */
export const RETRY_ATTEMPTS = 5;

/** Fixed backoff schedule used for those retries, in milliseconds. */
export const RETRY_DELAYS_MS: readonly number[] = [1000, 3000, 7000, 15000, 30000];

export const TIMING_POLICY = Object.freeze({
  localToContextDebounceMs: LOCAL_TO_CONTEXT_DEBOUNCE_MS,
  contextToLocalSyncMs: CONTEXT_TO_LOCAL_SYNC_MS,
  graphDebounceMs: GRAPH_DEBOUNCE_MS,
  autosaveDebounceMs: AUTOSAVE_DEBOUNCE_MS,
  savedStatusResetMs: SAVED_STATUS_RESET_MS,
  retryAttempts: RETRY_ATTEMPTS,
  retryDelaysMs: RETRY_DELAYS_MS,
});

/** Frozen realtime wire strings (channel and broadcast event names). */
export const REALTIME_CHANNEL_PREFIX = 'workflow_';
export const WORKFLOW_ACTION_EVENT = 'workflow_action';
export const WORKFLOW_RUNTIME_ACTION_EVENT = 'workflow_runtime_action';
