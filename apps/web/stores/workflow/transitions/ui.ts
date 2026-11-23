import {
  defaultEditorUIState,
  editorUIReducer,
  PANEL_IDS,
  type EditorUIAction,
  type EditorUIState,
  type PanelId,
  type PanelPosition,
} from '../../../constants/editor-panel';
import type { ActionEnvelope, UIState } from '../types';

/**
 * Pure editor UI transitions. Panel behaviour delegates to the existing
 * `editorUIReducer` so its field semantics stay byte-for-byte compatible.
 */

export function createInitialUIState(): UIState {
  return {
    ...defaultEditorUIState,
    selectedNodeId: null,
    selectedHandle: null,
    isDeployWorkflowDialogOpen: false,
  };
}

function toEditorUIState(state: UIState): EditorUIState {
  return {
    activeLeftPanel: state.activeLeftPanel,
    activeRightPanel: state.activeRightPanel,
    leftPanelHistory: state.leftPanelHistory,
    rightPanelHistory: state.rightPanelHistory,
  };
}

function applyEditorUIAction(
  state: UIState,
  action: EditorUIAction
): UIState {
  return { ...state, ...editorUIReducer(toEditorUIState(state), action) };
}

export function openPanel(state: UIState, panelId: PanelId): UIState {
  return applyEditorUIAction(state, { type: 'OPEN_PANEL', panelId });
}

export function closePanel(state: UIState, panelId: PanelId): UIState {
  return applyEditorUIAction(state, { type: 'CLOSE_PANEL', panelId });
}

export function togglePanel(state: UIState, panelId: PanelId): UIState {
  return applyEditorUIAction(state, { type: 'TOGGLE_PANEL', panelId });
}

export function setActivePanel(
  state: UIState,
  panelId: PanelId | null,
  position: PanelPosition
): UIState {
  return applyEditorUIAction(state, {
    type: 'SET_ACTIVE_PANEL',
    panelId,
    position,
  });
}

export function closeAll(state: UIState): UIState {
  return applyEditorUIAction(state, { type: 'CLOSE_ALL' });
}

export function selectNode(state: UIState, selectedNodeId: string | null): UIState {
  return { ...state, selectedNodeId };
}

export function setSelectedHandle(
  state: UIState,
  selectedHandle: string | null
): UIState {
  return { ...state, selectedHandle };
}

export function setDeployDialogOpen(
  state: UIState,
  isDeployWorkflowDialogOpen: boolean
): UIState {
  return { ...state, isDeployWorkflowDialogOpen };
}

/** UI reset is full but is the only place that clears panel history. */
export function resetUI(): UIState {
  return createInitialUIState();
}

function isPanelId(value: unknown): value is PanelId {
  return typeof value === 'string' && (PANEL_IDS as string[]).includes(value);
}

/** Boundary reducer for UI dispatch with arbitrary string action types. */
export function uiReducer(state: UIState, action: ActionEnvelope): UIState {
  switch (action.type) {
    case 'OPEN_PANEL':
      return isPanelId(action.panelId) ? openPanel(state, action.panelId) : state;
    case 'CLOSE_PANEL':
      return isPanelId(action.panelId) ? closePanel(state, action.panelId) : state;
    case 'TOGGLE_PANEL':
      return isPanelId(action.panelId) ? togglePanel(state, action.panelId) : state;
    case 'SET_ACTIVE_PANEL':
      return (action.panelId === null || isPanelId(action.panelId)) &&
        (action.position === 'left' || action.position === 'right')
        ? setActivePanel(
            state,
            action.panelId as PanelId | null,
            action.position as PanelPosition
          )
        : state;
    case 'CLOSE_ALL':
      return closeAll(state);
    case 'SELECT_NODE':
      return typeof action.selectedNodeId === 'string' || action.selectedNodeId === null
        ? selectNode(state, action.selectedNodeId as string | null)
        : state;
    case 'SET_SELECTED_HANDLE':
      return typeof action.selectedHandle === 'string' || action.selectedHandle === null
        ? setSelectedHandle(state, action.selectedHandle as string | null)
        : state;
    case 'SET_DEPLOY_DIALOG_OPEN':
      return typeof action.isDeployWorkflowDialogOpen === 'boolean'
        ? setDeployDialogOpen(state, action.isDeployWorkflowDialogOpen)
        : state;
    case 'RESET_UI':
      return resetUI();
    default:
      return state;
  }
}
