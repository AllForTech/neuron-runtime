'use client';

import React from 'react';
import { NodeProps, Position } from 'reactflow';
import { NodeHandle } from './NodeHandle';
import { cn } from '@/lib/utils';

interface DecisionNodeHandlesRendererProps {
  node: NodeProps;
}

export function DecisionNodeHandlesRenderer({
  node,
}: DecisionNodeHandlesRendererProps) {
  // Defensive check: Ensure config exists before destructuring
  if (!node) return null;

  const {
    data: { rules, includeDefault },
  } = node;

  // We only render source handles if there are rules
  if (!rules || !Array.isArray(rules) || rules.length === 0) return null;

  return (
    <div className="pointer-events-none absolute top-0 right-0 bottom-0 flex flex-col justify-around py-4">
      {rules.map((rule: any, index: number) => {
        return (
          <div
            key={rule.id || index}
            className="group pointer-events-auto relative flex items-center justify-end"
            style={{ height: `${100 / rules.length}%` }}
          >
            <NodeHandle
              node={node}
              type="source"
              position={Position.Right}
              id={rule.id}
            />

            {/* Label preview next to handle */}
            <span className="absolute left-[50px] rounded border border-neutral-800 bg-neutral-900/80 px-1.5 py-0.5 text-[9px] font-bold tracking-tighter whitespace-nowrap text-neutral-500 uppercase opacity-0 transition-opacity group-hover:opacity-100">
              {rule.label || `Case ${index + 1}`}
            </span>
          </div>
        );
      })}

      {/* DEFAULT / ELSE HANDLE */}
      {includeDefault && (
        <div className="group pointer-events-auto relative mt-auto flex items-center justify-end border pt-4">
          <span className={cn("absolute -right-[250%] text-[9px] font-bold tracking-tighter bg-neutral-900 border-white/15 text-neutral-300 shadow-2xl uppercase",
              "opacity-0 scale-95 group-hover/handle:opacity-100 group-hover/handle:scale-100 transition-all duration-150"
          )}>
            Default
          </span>
          <NodeHandle
            node={node}
            type="source"
            position={Position.Right}
            id="default-else"
          />
        </div>
      )}
    </div>
  );
}
