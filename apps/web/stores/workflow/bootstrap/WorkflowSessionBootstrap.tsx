'use client';

import React, { useEffect, useMemo, type ReactNode } from 'react';
import { useStore } from 'zustand';
import { useLiveQuery } from 'dexie-react-hooks';
import { createClient } from '../../../lib/supabase/client';
import { db } from '../../../lib/db/workflow.db';
import { graphStore } from '../graphStore';
import { sessionStore } from '../sessionStore';
import {
  createWorkflowDraftAdapter,
  type DraftTable,
} from '../adapters/workflowDraft';
import {
  subscribeToWorkflowRealtime,
  type RealtimeClientLike,
} from '../adapters/workflowRealtime';
import { workflowCommands } from '../commands/workflowCommandApi';
import { createRealtimeStoreDispatchers } from '../commands/realtimeDispatch';
import { createGraphSyncTimers } from '../commands/workflowSync';
import { WorkflowSessionContext } from './WorkflowSessionContext';

/**
 * Composition-only component. It wires realtime, the Dexie draft observer and
 * the initial cloud load, then renders children. The module-bound command
 * instance is exposed to the temporary context shim through
 * `WorkflowSessionContext` (TODO T-124: remove with the shim).
 */
export interface WorkflowSessionBootstrapProps {
  workflowId: string;
  children: ReactNode;
  realtimeClient?: RealtimeClientLike;
  draftTable?: DraftTable;
}

export function WorkflowSessionBootstrap({
  workflowId,
  children,
  realtimeClient,
  draftTable,
}: WorkflowSessionBootstrapProps) {
  const setRunId = useStore(sessionStore, (state) => state.setRunId);
  const draftAdapter = useMemo(
    () => createWorkflowDraftAdapter(draftTable ?? db.drafts),
    [draftTable]
  );
  const sessionValue = useMemo(() => ({ commands: workflowCommands }), []);
  const dispatchers = useMemo(() => createRealtimeStoreDispatchers(), []);
  const realtime = useMemo(
    () => realtimeClient ?? (createClient() as unknown as RealtimeClientLike),
    [realtimeClient]
  );
  const localDraft = useLiveQuery(
    () => draftAdapter.get(workflowId),
    [workflowId, draftAdapter]
  );

  useEffect(() => {
    setRunId(workflowId);
    void workflowCommands.loadGraph(workflowId);
  }, [workflowId, setRunId]);

  useEffect(() => {
    if (!workflowId) return;
    return subscribeToWorkflowRealtime(realtime, workflowId, dispatchers);
  }, [workflowId, realtime, dispatchers]);

  useEffect(() => {
    const unsubscribe = graphStore.subscribe((state) => {
      if (!workflowId || !state.isDirty) return;
      if (sessionStore.getState().bootstrapStatus === 'loading') return;
      void draftAdapter.put(workflowId, state.graph, state.globalVariables);
    });
    return unsubscribe;
  }, [workflowId, draftAdapter]);

  useEffect(() => {
    if (!workflowId || !localDraft || localDraft.synced) return;
    // Legacy suppressed autosave for the whole bootstrap, including a draft
    // that was already unsynced when the cloud load started.
    if (sessionStore.getState().bootstrapStatus === 'loading') return;
    const timers = createGraphSyncTimers({ setTimeout, clearTimeout });
    const autosave = timers.autosave(() => {
      if (sessionStore.getState().bootstrapStatus === 'loading') return;
      void workflowCommands.saveGraph(workflowId);
    });
    autosave();
    return () => autosave.cancel();
  }, [localDraft, workflowId]);

  return (
    <WorkflowSessionContext.Provider value={sessionValue}>
      {children}
    </WorkflowSessionContext.Provider>
  );
}
