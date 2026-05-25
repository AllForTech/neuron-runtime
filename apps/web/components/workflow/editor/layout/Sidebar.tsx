'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useWorkflowEditor } from '@/hooks/workflow/useWorkflowEditor';
import { getPanelById } from '@/constants/panel-registry';
import type { PanelPosition } from '@/constants/editor-panel';
import { cn } from '@/lib/utils';
import { PanelContainer } from "./panels/PanelContainer";

interface SidebarProps {
    position: PanelPosition;
    className?: string;
}

const LEFT_SIDEBAR_WIDTH = 280;
const RIGHT_SIDEBAR_WIDTH = 360;

export function EditorSidebar({ position, className }: SidebarProps) {
    const { editorUIState } = useWorkflowEditor();

    const activePanelId = position === 'left'
        ? editorUIState.activeLeftPanel
        : editorUIState.activeRightPanel;

    const isOpen = !!activePanelId;
    const width = position === 'left' ? LEFT_SIDEBAR_WIDTH : RIGHT_SIDEBAR_WIDTH;

    return (
        <AnimatePresence mode='sync'>
            {isOpen && (
                <motion.aside
                    key={position}
                    initial={{ opacity: 0, x: position === 'left' ? -20 : 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: position === 'left' ? -20 : 20 }}
                    transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                    className={cn(
                        'absolute h-[92%] top-[50%] -translate-y-[50%] rounded-xl shadow-xl bottom-0 z-40 overflow-y-hidden shrink-0',
                        // Don't cover the menu buttons
                        position === 'left'
                            ? 'left-[48px]'
                            : 'right-[48px]',
                        className
                    )}
                    style={{ width }}
                >
                    <div className="w-full h-full! rounded-xl bg-neutral-950 backdrop-blur-3xl border-2 border-neutral-900">
                        {activePanelId && (
                            <PanelContainer panelId={activePanelId} />
                        )}
                    </div>
                </motion.aside>
            )}
        </AnimatePresence>
    );
}

export function EditorLeftSidebar() {
    return <EditorSidebar position="left" />;
}

export function EditorRightSidebar() {
    return <EditorSidebar position="right" />;
}