import { create } from 'zustand';
import type { BootstrapStatus, SaveStatus, SessionState } from './types';
import {
  beginBootstrap,
  completeBootstrap,
  createInitialSessionState,
  failBootstrap,
  resetSession,
  setBootstrapStatus,
  setDeploying,
  setError,
  setLoading,
  setLogsLoading,
  setRetryCount,
  setRunId,
  setRunning,
  setSaveStatus,
  setSaving,
} from './transitions/session';

export interface SessionStore extends SessionState {
  setRunId: (runId: string) => void;
  setBootstrapStatus: (status: BootstrapStatus) => void;
  beginBootstrap: () => void;
  completeBootstrap: () => void;
  failBootstrap: (error: string) => void;
  setSaveStatus: (status: SaveStatus) => void;
  setRetryCount: (count: number) => void;
  setLoading: (loading: boolean) => void;
  setSaving: (saving: boolean) => void;
  setRunning: (running: boolean) => void;
  setDeploying: (deploying: boolean) => void;
  setLogsLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  resetSession: () => void;
}

/** Single owner of bootstrap identity and in-flight/save metadata. */
export const sessionStore = create<SessionStore>()((set) => ({
  ...createInitialSessionState(),
  setRunId: (runId) => set((s) => setRunId(s, runId)),
  setBootstrapStatus: (status) => set((s) => setBootstrapStatus(s, status)),
  beginBootstrap: () => set((s) => beginBootstrap(s)),
  completeBootstrap: () => set((s) => completeBootstrap(s)),
  failBootstrap: (error) => set((s) => failBootstrap(s, error)),
  setSaveStatus: (status) => set((s) => setSaveStatus(s, status)),
  setRetryCount: (count) => set((s) => setRetryCount(s, count)),
  setLoading: (loading) => set((s) => setLoading(s, loading)),
  setSaving: (saving) => set((s) => setSaving(s, saving)),
  setRunning: (running) => set((s) => setRunning(s, running)),
  setDeploying: (deploying) => set((s) => setDeploying(s, deploying)),
  setLogsLoading: (loading) => set((s) => setLogsLoading(s, loading)),
  setError: (error) => set((s) => setError(s, error)),
  resetSession: () => set(() => resetSession()),
}));
