'use client';

import { NodeProps, Handle, Position } from 'reactflow';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { ContextMenuItem } from '@/components/ui/context-menu';
import { ContextMenuWrapper } from '@/components/workflow/editor/ContextMenuWrapper';
import { cn } from '@/lib/utils';
import { useWorkflowEditor } from '@/hooks/workflow/useWorkflowEditor';

export default function HttpRequestNode(node: NodeProps) {
  const { id, selected, data } = node;

  const { setOpenConfigSheet } = useWorkflowEditor();

  return (
    <ContextMenuWrapper
      trigger={
        /* The Card is the trigger for the right-click */
        <Card
          className={cn(
            'group h-[150px] w-[200px] flex-col rounded-xl border-0 bg-neutral-800/20 p-3 backdrop-blur-sm transition hover:shadow-lg',
            selected && 'ring-primary ring-2'
          )}
        >
          {/* ReactFlow Handles: Required for connectivity */}
          <Handle
            type="target"
            position={Position.Top}
            className="bg-primary h-3 w-3"
          />

          <Card className="container-full card-surface h-full flex-col justify-between rounded-xl border-0 bg-transparent">
            <CardHeader className="center p-0">
              <span className="text-secondary-foreground text-xs font-bold uppercase">
                HTTP Request
              </span>
            </CardHeader>
            <CardContent className="flex flex-grow items-center justify-center p-0"></CardContent>
          </Card>

          <Handle
            type="source"
            position={Position.Bottom}
            className="bg-primary h-3 w-3"
          />
        </Card>
      }
    >
      {/* These are the items that appear on right-click */}
      <ContextMenuItem
        className="cursor-pointer"
        onClick={() => setOpenConfigSheet(true)}
      >
        Edit Node
      </ContextMenuItem>
      <ContextMenuItem
        className="cursor-pointer"
        onClick={() => console.log('Copy', id)}
      >
        Duplicate
      </ContextMenuItem>
      <ContextMenuItem
        className="cursor-pointer text-red-500"
        onClick={() => console.log('Delete', id)}
      >
        Delete
      </ContextMenuItem>
    </ContextMenuWrapper>
  );
}
