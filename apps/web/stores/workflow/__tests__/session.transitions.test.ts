import { describe, expect, it } from 'vitest';
import {
  beginBootstrap,
  completeBootstrap,
  createInitialSessionState,
  failBootstrap,
  resetSession,
  setDeploying,
  setError,
  setLoading,
  setLogsLoading,
  setRetryCount,
  setRunId,
  setRunning,
  setSaveStatus,
  setSaving,
} from '../transitions/session';

describe('session transitions', () => {
  it('tracks bootstrap lifecycle', () => {
    let state = createInitialSessionState();
    state = setRunId(state, 'wf-1');
    state = beginBootstrap(state);
    expect(state.runId).toBe('wf-1');
    expect(state.bootstrapStatus).toBe('loading');
    expect(state.isWorkflowLoading).toBe(true);

    state = completeBootstrap(state);
    expect(state.bootstrapStatus).toBe('ready');
    expect(state.isWorkflowLoading).toBe(false);

    state = failBootstrap(state, 'nope');
    expect(state.bootstrapStatus).toBe('error');
    expect(state.lastError).toBe('nope');
  });

  it('tracks in-flight and save flags', () => {
    let state = createInitialSessionState();
    state = setLoading(state, true);
    state = setSaving(state, true);
    state = setSaveStatus(state, 'retrying');
    state = setRetryCount(state, 2);
    state = setRunning(state, true);
    state = setDeploying(state, true);
    state = setLogsLoading(state, true);
    state = setError(state, 'err');

    expect(state).toMatchObject({
      isWorkflowLoading: true,
      isWorkflowSaving: true,
      saveStatus: 'retrying',
      retryCount: 2,
      isRunning: true,
      isDeploying: true,
      isLogsLoading: true,
      lastError: 'err',
    });
  });

  it('resets to an independent initial state', () => {
    const dirty = setRunning(createInitialSessionState(), true);
    const reset = resetSession();
    expect(reset).toEqual(createInitialSessionState());
    expect(reset).not.toBe(dirty);
  });
});
