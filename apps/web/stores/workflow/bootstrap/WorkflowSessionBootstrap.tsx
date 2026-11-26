'use client';

import React, { useEffect, useMemo, type ReactNode } from 'react';
import { useStore } from 'zustand';
import { useLiveQuery } from 'dexie-react-hooks';
import { workflows, executions } from '@neuron/client';
import { createClient } from '../../../lib/supabase/client';
import { db } from '../../../lib/db/workflow.db';
import { graphStore } from '../graphStore';
import { runtimeStore } from '../runtimeStore';
import { sessionStore } from '../sessionStore';
import {
  createWorkflowDraftAdapter,
  type DraftTable,
} from '../adapters/workflowDraft';
import {
  subscribeToWorkflowRealtime,
  type RealtimeClientLike,
} from '../adapters/workflowRealtime';
import { createRealtimeStoreDispatchers } from '../commands/realtimeDispatch';
import {
  createWorkflowCommands,
  type ExecutionClientPort,
  type WorkflowClientPort,
} from '../commands/workflowCommands';
import { createGraphSyncTimers } from '../commands/workflowSync';
import { WorkflowSessionContext } from './WorkflowSessionContext';

/**
 * Composition-only component. It wires realtime, the Dexie draft observer and
 * the initial cloud load, then renders children. The command instances it
 * creates are exposed to the temporary context shim through
 * `WorkflowSessionContext` (TODO T-124: remove with the shim).
 */
export interface WorkflowSessionBootstrapProps {
  workflowId: string;
  children: ReactNode;
  workflowClient?: WorkflowClientPort;
  executionsClient?: ExecutionClientPort;
  realtimeClient?: RealtimeClientLike;
  draftTable?: DraftTable;
  getAccessToken?: () => Promise<string>;
  onError?: (error: unknown, context: string) => void;
}

async function defaultGetAccessToken(): Promise<string> {
  const supabase = createClient();
  const { data, error } = await supabase.auth.getSession();
  if (error || !data.session) throw new Error('No active session found');
  return data.session.access_token;
}

export function WorkflowSessionBootstrap({
  workflowId,
  children,
  workflowClient,
  executionsClient,
  realtimeClient,
  draftTable,
  getAccessToken,
  onError,
}: WorkflowSessionBootstrapProps) {
  const setRunId = useStore(sessionStore, (state) => state.setRunId);
  const draftAdapter = useMemo(
    () => createWorkflowDraftAdapter(draftTable ?? db.drafts),
    [draftTable]
  );
  const commands = useMemo(
    () =>
      createWorkflowCommands({
        graph: graphStore,
        runtime: runtimeStoreForCommands(),
        session: sessionStore,
        workflowClient:
          workflowClient ?? (workflows as unknown as WorkflowClientPort),
        executionsClient:
          executionsClient ?? (executions as unknown as ExecutionClientPort),
        getAccessToken: getAccessToken ?? defaultGetAccessToken,
        draft: draftAdapter,
        onError,
      }),
    [workflowClient, executionsClient, getAccessToken, draftAdapter, onError]
  );
  const sessionValue = useMemo(() => ({ commands }), [commands]);
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
    void commands.loadGraph(workflowId);
  }, [workflowId, setRunId, commands]);

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
      void commands.saveGraph(workflowId);
    });
    autosave();
    return () => autosave.cancel();
  }, [localDraft, workflowId, commands]);

  return (
    <WorkflowSessionContext.Provider value={sessionValue}>
      {children}
    </WorkflowSessionContext.Provider>
  );
}

function runtimeStoreForCommands() {
  // Kept as a function so the import stays explicit at the composition edge.
  return runtimeStore;
}
