'use client';

import React from 'react';
import { Position } from 'reactflow';
import { NodeHandle } from './NodeHandle';
import { cn } from '@/lib/utils';

const DEFAULT_OUTPUTS = [
    { id: 'success', label: 'Success' },
    { id: 'error', label: 'Error' },
    { id: 'timeout', label: 'Timeout' },
    { id: 'retry_exhausted', label: 'Retry Failed' },
];

interface Props {
    node: any;
    enabled?: string[];
}

export function ExecutionHandlesRenderer({ node, enabled }: Props) {
    const active = enabled || DEFAULT_OUTPUTS.map(o => o.id);

    return (
        <div className={cn(
            "absolute -right-7.5 inset-y-0 flex flex-col justify-center gap-6 py-4",
            "group-hover:scale-110 delay-700 transition-all duration-300 ease-in-out translate-x-[-4px] group-hover:translate-x-0",
            "pointer-events-none"
        )}>
            {DEFAULT_OUTPUTS.filter(o => active.includes(o.id)).map((out) => (
                <div
                    key={out.id}
                    className="pointer-events-auto relative flex items-center justify-center group/handle"
                >
                    <span className={cn(
                        "absolute left-[300%] whitespace-nowrap rounded-md bg-neutral-900 border border-white/15 px-2 py-1",
                        "text-[10px] font-bold uppercase tracking-tighter text-neutral-300 shadow-2xl",
                        "opacity-0 scale-95 group-hover/handle:opacity-100 group-hover/handle:scale-100 transition-all duration-150"
                    )}>
                        {out.label}
                    </span>
                    
                    <NodeHandle
                        node={node}
                        type="source"
                        position={Position.Right}
                        id={out.id}
                    />

                    <div className="absolute right-2 w-4.5 h-[2px] bg-neutral-500 -z-10" />
                </div>
            ))}
        </div>
    );
}