'use client';

import { useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';

export function useWorkflowRealtime(
  runId: string,
  workflowEditorDispatch: any,
  runtimeDispatch: any
) {
  useEffect(() => {
    if (!runId) return;

    const supabase = createClient();

    const channel = supabase
      .channel(`workflow_${runId}`)
      .on('broadcast', { event: 'workflow_action' }, ({ payload }) => {
        workflowEditorDispatch({
          type: payload.type,
          ...payload, // Contains nodeId, edgeId, output, etc.
        });
      })
      .on('broadcast', { event: 'workflow_runtime_action' }, ({ payload }) => {
        runtimeDispatch({
          type: payload.type,
          ...payload,
        });
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel).then((r) => console.log(r));
    };
  }, [runId, workflowEditorDispatch, runtimeDispatch]);
}
