'use client';

import { ReactFlowProvider } from 'reactflow';
import { ReactNode } from 'react';
import { useParams } from 'next/navigation';
import { NodeOutputProvider } from '@/providers/NodeOutputContext';
import { WorkflowEditorProvider } from '@/providers/WorkflowEditorProvider';
import { ValidationProvider } from '@/providers/ValidationContext';
import { WorkflowSessionBootstrap } from '@/stores/workflow/bootstrap';

export const EditorProvider = ({ children }: { children: ReactNode }) => {
  const workflowId = useParams().workflowId as string;

  return (
    <ReactFlowProvider>
      <NodeOutputProvider>
        <WorkflowSessionBootstrap workflowId={workflowId}>
          <WorkflowEditorProvider workflowId={workflowId}>
            <ValidationProvider>{children}</ValidationProvider>
          </WorkflowEditorProvider>
        </WorkflowSessionBootstrap>
      </NodeOutputProvider>
    </ReactFlowProvider>
  );
};
