import type {
  BootstrapStatus,
  SaveStatus,
  SessionState,
} from '../types';

/**
 * Pure session/bootstrap transitions. This store owns only in-flight and
 * bootstrap metadata; it never holds graph content or view state.
 */

export function createInitialSessionState(): SessionState {
  return {
    runId: '',
    bootstrapStatus: 'idle',
    isWorkflowLoading: false,
    isWorkflowSaving: false,
    saveStatus: 'idle',
    retryCount: 0,
    isRunning: false,
    isDeploying: false,
    isLogsLoading: false,
    lastError: null,
  };
}

export function setRunId(state: SessionState, runId: string): SessionState {
  return { ...state, runId };
}

export function setBootstrapStatus(
  state: SessionState,
  bootstrapStatus: BootstrapStatus
): SessionState {
  return { ...state, bootstrapStatus };
}

export function beginBootstrap(state: SessionState): SessionState {
  return { ...state, bootstrapStatus: 'loading', isWorkflowLoading: true, lastError: null };
}

export function completeBootstrap(state: SessionState): SessionState {
  return { ...state, bootstrapStatus: 'ready', isWorkflowLoading: false };
}

export function failBootstrap(state: SessionState, error: string): SessionState {
  return {
    ...state,
    bootstrapStatus: 'error',
    isWorkflowLoading: false,
    lastError: error,
  };
}

export function setSaveStatus(
  state: SessionState,
  saveStatus: SaveStatus
): SessionState {
  return { ...state, saveStatus };
}

export function setRetryCount(
  state: SessionState,
  retryCount: number
): SessionState {
  return { ...state, retryCount };
}

export function setLoading(
  state: SessionState,
  isWorkflowLoading: boolean
): SessionState {
  return { ...state, isWorkflowLoading };
}

export function setSaving(
  state: SessionState,
  isWorkflowSaving: boolean
): SessionState {
  return { ...state, isWorkflowSaving };
}

export function setRunning(state: SessionState, isRunning: boolean): SessionState {
  return { ...state, isRunning };
}

export function setDeploying(
  state: SessionState,
  isDeploying: boolean
): SessionState {
  return { ...state, isDeploying };
}

export function setLogsLoading(
  state: SessionState,
  isLogsLoading: boolean
): SessionState {
  return { ...state, isLogsLoading };
}

export function setError(state: SessionState, lastError: string | null): SessionState {
  return { ...state, lastError };
}

/** Session reset is full and returns an independent initial state object. */
export function resetSession(): SessionState {
  return createInitialSessionState();
}
