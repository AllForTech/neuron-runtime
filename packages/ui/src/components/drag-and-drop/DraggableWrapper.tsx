'use client';

import React from 'react';
import { useDraggable } from '@dnd-kit/core';
import { cn } from '../../utils/utils.js';

interface GenericDraggableProps {
    id: string;
    data: Record<string, any>; // Pass { workflow: wf } or { secret: s }
    children: React.ReactNode;
    className?: string;
}

export const DraggableItem = ({
                                  id,
                                  data,
                                  children,
                                  className
                              }: GenericDraggableProps) => {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        isDragging
    } = useDraggable({
        id,
        data,
    });

    const style: React.CSSProperties | undefined = transform ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
        transition: isDragging ? 'none' : 'transform 200ms cubic-bezier(0.2, 0, 0, 1)',
        zIndex: isDragging ? 999 : undefined,
        position: 'relative',
    } : undefined;

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...listeners}
            {...attributes}
            className={cn(
                "relative group touch-none",
                isDragging && "cursor-grabbing z-[999]! scale-[1.05] opacity-70 grayscale-[0.5] shadow-2xl",
                className
            )}
        >
            {children}
        </div>
    );
};