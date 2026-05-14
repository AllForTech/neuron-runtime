import type { LucideIcon } from 'lucide-react';

export type PanelPosition = 'left' | 'right';

export type PanelId =
    | 'node-config'
    | 'node-library'
    | 'execution-trace'
    | 'variables'
    | 'deploy'
    | 'workflow-inspector'
    | 'execution-history'
    | 'graph-navigator';

export interface PanelDefinition {
    id: PanelId;
    position: PanelPosition;
    label: string;
    icon: LucideIcon;
    component: any;
    isVisible?: (state: EditorUIState) => boolean;
    onOpen?: () => void;
    onClose?: () => void;
}

export interface PanelProps {
    className?: string;
}

export interface EditorUIState {
    activeLeftPanel: PanelId | null;
    activeRightPanel: PanelId | null;
    leftPanelHistory: PanelId[];
    rightPanelHistory: PanelId[];
}

export type EditorUIAction =
    | { type: 'OPEN_PANEL'; panelId: PanelId }
    | { type: 'CLOSE_PANEL'; panelId: PanelId }
    | { type: 'TOGGLE_PANEL'; panelId: PanelId }
    | { type: 'SET_ACTIVE_PANEL'; panelId: PanelId | null; position: PanelPosition }
    | { type: 'CLOSE_ALL' };

export const defaultEditorUIState: EditorUIState = {
    activeLeftPanel: null,
    activeRightPanel: null,
    leftPanelHistory: [],
    rightPanelHistory: [],
};

export function editorUIReducer(
    state: EditorUIState,
    action: EditorUIAction
): EditorUIState {
    switch (action.type) {
        case 'OPEN_PANEL': {
            const panel = action.panelId;
            const isLeft = PANEL_POSITION_MAP[panel] === 'left';

            if (isLeft) {
                if (state.activeLeftPanel === panel) {
                    return { ...state, activeLeftPanel: null };
                }
                return {
                    ...state,
                    activeLeftPanel: panel,
                    leftPanelHistory: state.activeLeftPanel
                        ? [state.activeLeftPanel, ...state.leftPanelHistory]
                        : state.leftPanelHistory,
                };
            } else {
                if (state.activeRightPanel === panel) {
                    return { ...state, activeRightPanel: null };
                }
                return {
                    ...state,
                    activeRightPanel: panel,
                    rightPanelHistory: state.activeRightPanel
                        ? [state.activeRightPanel, ...state.rightPanelHistory]
                        : state.rightPanelHistory,
                };
            }
        }

        case 'CLOSE_PANEL': {
            return {
                ...state,
                activeLeftPanel: state.activeLeftPanel === action.panelId ? null : state.activeLeftPanel,
                activeRightPanel: state.activeRightPanel === action.panelId ? null : state.activeRightPanel,
            };
        }

        case 'TOGGLE_PANEL': {
            const panel = action.panelId;
            const isLeft = PANEL_POSITION_MAP[panel] === 'left';

            if (isLeft) {
                return {
                    ...state,
                    activeLeftPanel: state.activeLeftPanel === panel ? null : panel,
                };
            } else {
                return {
                    ...state,
                    activeRightPanel: state.activeRightPanel === panel ? null : panel,
                };
            }
        }

        case 'SET_ACTIVE_PANEL': {
            if (action.position === 'left') {
                return {
                    ...state,
                    activeLeftPanel: action.panelId,
                    leftPanelHistory: action.panelId && state.activeLeftPanel
                        ? [state.activeLeftPanel, ...state.leftPanelHistory]
                        : state.leftPanelHistory,
                };
            } else {
                return {
                    ...state,
                    activeRightPanel: action.panelId,
                    rightPanelHistory: action.panelId && state.activeRightPanel
                        ? [state.activeRightPanel, ...state.rightPanelHistory]
                        : state.rightPanelHistory,
                };
            }
        }

        case 'CLOSE_ALL': {
            return {
                ...state,
                activeLeftPanel: null,
                activeRightPanel: null,
            };
        }

        default:
            return state;
    }
}

export const PANEL_POSITION_MAP: Record<PanelId, PanelPosition> = {
    'node-config': 'right',
    'node-library': 'right',
    'execution-trace': 'right',
    'variables': 'right',
    'deploy': 'right',
    'workflow-inspector': 'right',
    'execution-history': 'right',
    'graph-navigator': 'left',
};

export const PANEL_POSITION: PanelPosition[] = ['left', 'right'];
export const PANEL_IDS: PanelId[] = [
    'node-config',
    'node-library',
    'execution-trace',
    'variables',
    'deploy',
    'workflow-inspector',
    'execution-history',
];