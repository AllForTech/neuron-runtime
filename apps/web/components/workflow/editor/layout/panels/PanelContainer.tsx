'use client';

import { motion } from 'framer-motion';
import { useWorkflowEditor } from '@/hooks/workflow/useWorkflowEditor';
import { getPanelById } from '@/constants/panel-registry';
import type { PanelId } from '@/constants/editor-panel';
import { X } from 'lucide-react';

interface PanelContainerProps {
    panelId: PanelId;
}

export function PanelContainer({ panelId }: PanelContainerProps) {
    const { editorUIDispatch } = useWorkflowEditor();
    const panel = getPanelById(panelId);

    if (!panel) return null;

    const PanelIcon = panel?.icon;
    const PanelComponent = panel?.component;

    const handleClose = () => {
        editorUIDispatch({ type: 'CLOSE_PANEL', panelId });
    };

    return (
        <motion.div
            key={panelId}
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 5 }}
            transition={{ duration: 0.2 }}
            className="flex h-full w-full flex-col"
        >
            {/* Header: shrink-0 ensures this doesn't compress when content grows */}
            <div className="flex items-center justify-between px-4 py-3 shrink-0">
                <div className="flex items-center gap-2">
                    {PanelIcon && <PanelIcon size={14} className="text-neutral-500" />}
                    <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-400">
                        {panel.label}
                    </span>
                </div>
                <button
                    onClick={handleClose}
                    className="rounded-lg p-1 text-neutral-500 transition-colors hover:bg-white/10 hover:text-white"
                >
                    <X size={14} />
                </button>
            </div>

            {/* Content: flex-1 takes up remaining height, min-h-0 prevents flex blowout, overflow-y-auto handles scrolling */}
            <div className="flex-1 min-h-0 w-full overflow-y-auto no-scrollbar relative">
                <PanelComponent />
            </div>
        </motion.div>
    );
}