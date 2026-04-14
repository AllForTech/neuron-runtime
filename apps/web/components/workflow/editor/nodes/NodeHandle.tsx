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
  const { setIsSheetOpen, setSelectedNode, setSelectedHandle } =
    useWorkflowEditor();

  return (
    <>
      {/* The ReactFlow handle */}
      <Handle
        type={type}
        position={position}
        id={id}
        className={cn(
          'border-primary! h-3.5! w-3.5! cursor-pointer rounded-full border! bg-neutral-600!',
          className
        )}
        onClick={(e) => {
          e.stopPropagation();
          setIsSheetOpen(true);
          setSelectedNode(nodePropsToReactflowNode(node));
          console.log('From Decision node handle logic: ', id, node);
          setSelectedHandle(id);
        }}
      />
    </>
  );
}
