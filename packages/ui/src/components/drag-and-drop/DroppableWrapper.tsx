'use client';

import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import { cn } from '../../utils/utils.js';

interface GenericDroppableProps {
    id: string;
    children: React.ReactNode;
    className?: string;
    overClassName?: string;
    data?: Record<string, any>;
}

export const DroppableZone = ({
                                  id,
                                  children,
                                  className,
                                  overClassName,
                                  data
                              }: GenericDroppableProps) => {
    const { setNodeRef, isOver } = useDroppable({
        id,
        data,
    });

    return (
        <div
            ref={setNodeRef}
            className={cn(
                "transition-all duration-300",
                className,
                isOver && (overClassName || "bg-muted/70 border-white/30 border-1")
            )}
        >
            {children}
        </div>
    );
};