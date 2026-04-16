'use client';

import React from 'react';
import {
    DndContext,
    DragEndEvent,
    PointerSensor,
    useSensor,
    useSensors,
    DropAnimation,
    defaultDropAnimationSideEffects,
} from '@dnd-kit/core';

interface DndProviderProps {
    children: React.ReactNode;
    /**
     * Simple callback for when an item is dropped.
     * @param id The ID of the dragged item
     * @param targetId The ID of the drop zone (or null if dropped nowhere)
     * @param data The raw data object passed to the DraggableItem
     */
    onMove: (id: string, targetId: string | null, data: any) => void;
}

const dropAnimation: DropAnimation = {
    sideEffects: defaultDropAnimationSideEffects({
        styles: {
            active: {
                opacity: '0.5',
            },
        },
    }),
};

export function DndProvider({ children, onMove }: DndProviderProps) {
    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8, // Prevents accidental drags on clicks
            },
        })
    );

    function handleDragEnd(event: DragEndEvent) {
        const { active, over } = event;

        if (!over) return;

        const itemId = active.id as string;
        const targetId = over.id as string;
        const itemData = active.data.current;

        onMove(itemId, targetId, itemData);
    }

    return (
        <DndContext
            sensors={sensors}
            onDragEnd={handleDragEnd}
        >
            {children}
        </DndContext>
    );
}