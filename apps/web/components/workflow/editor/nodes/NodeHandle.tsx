'use client';

import React from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { useWorkflowEditor } from '@/hooks/workflow/useWorkflowEditor';
import { cn, nodePropsToReactflowNode } from '@/lib/utils';

interface NodeHandleProps {
  node: NodeProps;
  position?: Position;
  type?: 'source' | 'target';
  className?: string;
  id?: string;
}

export function NodeHandle({
  node,
  position = Position.Bottom,
  className,
  id = 'addNodeHandle',
  type = 'source',
}: NodeHandleProps) {
  const { setSelectedNode, setSelectedHandle, editorUIDispatch } =
    useWorkflowEditor();

  return (
    <>
      {/* The ReactFlow handle */}
      <Handle
        type={type}
        position={position}
        id={id}
        className={cn(
            'h-3! w-3! cursor-pointer transition-all border-[1.5px]!',
            'bg-neutral-600! border-neutral-500! hover:border-white! hover:bg-neutral-500/80 hover:scale-110',
            'shadow-[0_0_10px_rgba(0,0,0,0.5)]',
            className
        )}
        onClick={(e) => {
          e.stopPropagation();
            editorUIDispatch({ type: 'OPEN_PANEL', panelId: 'node-library' })
          setSelectedNode(nodePropsToReactflowNode(node));
          setSelectedHandle(id);
        }}
      >
          {type === 'target' && (
              <div className="absolute left-3 w-4.5 top-[50%] -translate-y-[50%] h-[2px] bg-neutral-400 -z-10" />
          )}
      </Handle>
    </>
  );
}
