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

const LEFT_SIDEBAR_WIDTH = 300;
const RIGHT_SIDEBAR_WIDTH = 370;
const MENU_WIDTH = 38; // w-[30px] + gap (approximately)

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
                        'absolute top-0 bottom-0 z-40 overflow-hidden shrink-0',
                        // Don't cover the menu buttons
                        position === 'left'
                            ? 'left-[38px]'
                            : 'right-[38px]',
                        className
                    )}
                    style={{ width }}
                >
                    <div className="h-full w-full rounded-xl bg-neutral-950/80 backdrop-blur-xl border border-white/[0.06] overflow-hidden">
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