import { create } from 'zustand';
import type { PanelId, PanelPosition } from '../../constants/editor-panel';
import type { ActionEnvelope, UIState } from './types';
import {
  closeAll,
  closePanel,
  createInitialUIState,
  openPanel,
  resetUI,
  selectNode,
  setActivePanel,
  setDeployDialogOpen,
  setSelectedHandle,
  togglePanel,
  uiReducer,
} from './transitions/ui';

export interface UIStore extends UIState {
  openPanel: (panelId: PanelId) => void;
  closePanel: (panelId: PanelId) => void;
  togglePanel: (panelId: PanelId) => void;
  setActivePanel: (panelId: PanelId | null, position: PanelPosition) => void;
  closeAll: () => void;
  selectNode: (nodeId: string | null) => void;
  setSelectedHandle: (handle: string | null) => void;
  setDeployDialogOpen: (open: boolean) => void;
  resetUI: () => void;
  dispatch: (action: ActionEnvelope) => void;
}

/** Single owner of ephemeral panel, selection and dialog state. */
export const uiStore = create<UIStore>()((set) => ({
  ...createInitialUIState(),
  openPanel: (panelId) => set((s) => openPanel(s, panelId)),
  closePanel: (panelId) => set((s) => closePanel(s, panelId)),
  togglePanel: (panelId) => set((s) => togglePanel(s, panelId)),
  setActivePanel: (panelId, position) =>
    set((s) => setActivePanel(s, panelId, position)),
  closeAll: () => set((s) => closeAll(s)),
  selectNode: (nodeId) => set((s) => selectNode(s, nodeId)),
  setSelectedHandle: (handle) => set((s) => setSelectedHandle(s, handle)),
  setDeployDialogOpen: (open) => set((s) => setDeployDialogOpen(s, open)),
  resetUI: () => set(() => resetUI()),
  dispatch: (action) => set((s) => uiReducer(s, action)),
}));

/** Stable reference for non-React callers (adapters/commands/bootstrap only). */
export const dispatchUIAction = (action: ActionEnvelope): void => {
  uiStore.getState().dispatch(action);
};
