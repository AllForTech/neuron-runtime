"use client";

import {useWorkflowEditor} from "@/hooks/workflow/useWorkflowEditor";
import {getPanelPosition, PanelId} from "@/constants/panel-registry";

export function useEditorPanels() {
    const { editorUIState, editorUIDispatch } = useWorkflowEditor();

    // Helper to check if a specific ID is open
    const isPanelOpen = (panelId: PanelId) => {
        const position = getPanelPosition(panelId);
        return position === 'left'
            ? editorUIState.activeLeftPanel === panelId
            : editorUIState.activeRightPanel === panelId;
    };

    return {
        isPanelOpen,
        openPanel: (panelId: PanelId) =>
            editorUIDispatch({ type: 'OPEN_PANEL', panelId }),
        closePanel: (panelId: PanelId) =>
            editorUIDispatch({ type: 'CLOSE_PANEL', panelId }),
        togglePanel: (panelId: PanelId) =>
            editorUIDispatch({ type: 'TOGGLE_PANEL', panelId }),
    };
}