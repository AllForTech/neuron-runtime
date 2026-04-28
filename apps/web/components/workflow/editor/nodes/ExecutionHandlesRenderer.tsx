'use client';

import React from 'react';
import { Position } from 'reactflow';
import { NodeHandle } from './NodeHandle';
import { cn } from '@/lib/utils';

const DEFAULT_OUTPUTS = [
    { id: 'success', label: 'Success', color: 'bg-green-500' },
    { id: 'error', label: 'Error', color: 'bg-red-500' },
    { id: 'timeout', label: 'Timeout', color: 'bg-yellow-500' },
    { id: 'retry_exhausted', label: 'Retry Failed', color: 'bg-orange-500' },
    { id: 'skipped', label: 'Skipped', color: 'bg-gray-500' },
];

interface Props {
    node: any;
    enabled?: string[];
}

export function ExecutionHandlesRenderer({ node, enabled }: Props) {
    const active = enabled || DEFAULT_OUTPUTS.map(o => o.id);

    return (
        <div className="pointer-events-none absolute inset-y-0 right-0 flex flex-col justify-between py-3">
            {/* SUCCESS (top primary output) */}
            <div className="pointer-events-auto">
                <NodeHandle
                    node={node}
                    type="source"
                    position={Position.Right}
                    id="success"
                    className={cn('bg-green-500 hover:bg-green-400')}
                />
            </div>

            {/* OTHER OUTPUTS */}
            <div className="flex flex-col gap-3 pointer-events-auto">
                {DEFAULT_OUTPUTS.filter(o => o.id !== 'success' && active.includes(o.id)).map(out => (
                    <div key={out.id} className="flex items-center gap-2">
                        <NodeHandle
                            node={node}
                            type="source"
                            position={Position.Right}
                            id={out.id}
                            className={cn(out.color, 'opacity-80 hover:opacity-100')}
                        />

                        <span className="text-[9px] text-neutral-400 uppercase">
              {out.label}
            </span>
                    </div>
                ))}
            </div>

            {/* ADD BUTTON (future expansion UI only) */}
            <div className="pointer-events-auto mt-3 flex justify-end">
                <button
                    className="text-[10px] text-neutral-500 hover:text-white"
                    onClick={(e) => {
                        e.stopPropagation();
                        console.log('open output selector');
                    }}
                >
                    + output
                </button>
            </div>
        </div>
    );
}