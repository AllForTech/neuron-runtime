'use client';

import { ReactFlowProvider } from 'reactflow';
import { ReactNode } from 'react';
import { useParams } from 'next/navigation';
import { toast } from 'sonner';
import { NodeOutputProvider } from '@/providers/NodeOutputContext';
import { WorkflowEditorProvider } from '@/providers/WorkflowEditorProvider';
import { ValidationProvider } from '@/providers/ValidationContext';
import { WorkflowSessionBootstrap } from '@/stores/workflow/bootstrap';

/** Load/log failures were logged only; other command failures keep legacy toasts. */
const LOG_ONLY_ERROR_CONTEXTS: ReadonlySet<string> = new Set([
  'loadGraph',
  'loadDeployment',
  'getExecutionLogs',
]);

function reportError(error: unknown, context: string) {
  const message = error instanceof Error ? error.message : String(error);
  if (LOG_ONLY_ERROR_CONTEXTS.has(context)) {
    console.error(message);
    return;
  }
  if (context === 'saveGraph') {
    toast.error('Cloud sync failed after multiple attempts. Working offline.');
    return;
  }
  toast.error(message);
}

export const EditorProvider = ({ children }: { children: ReactNode }) => {
  const workflowId = useParams().workflowId as string;

  return (
    <ReactFlowProvider>
      <NodeOutputProvider>
        <WorkflowSessionBootstrap workflowId={workflowId} onError={reportError}>
          <WorkflowEditorProvider workflowId={workflowId}>
            <ValidationProvider>{children}</ValidationProvider>
          </WorkflowEditorProvider>
        </WorkflowSessionBootstrap>
      </NodeOutputProvider>
    </ReactFlowProvider>
  );
};
