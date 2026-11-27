import { describe, expect, it } from 'vitest';
import { editorUIReducer } from '../../../constants/editor-panel';
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
} from '../transitions/ui';

describe('ui transitions', () => {
  it('delegates panel behavior to the existing editorUIReducer', () => {
    let state = createInitialUIState();
    state = openPanel(state, 'node-library');
    expect(state.activeRightPanel).toBe('node-library');

    const expected = editorUIReducer(
      {
        activeLeftPanel: null,
        activeRightPanel: null,
        leftPanelHistory: [],
        rightPanelHistory: [],
      },
      { type: 'OPEN_PANEL', panelId: 'node-library' }
    );
    expect({
      activeLeftPanel: state.activeLeftPanel,
      activeRightPanel: state.activeRightPanel,
      leftPanelHistory: state.leftPanelHistory,
      rightPanelHistory: state.rightPanelHistory,
    }).toEqual(expected);
  });

  it('manages selection and dialog flags', () => {
    let state = createInitialUIState();
    state = selectNode(state, 'n1');
    state = setSelectedHandle(state, 'h1');
    state = setDeployDialogOpen(state, true);
    expect(state.selectedNodeId).toBe('n1');
    expect(state.selectedHandle).toBe('h1');
    expect(state.isDeployWorkflowDialogOpen).toBe(true);
  });

  it('supports panel operations and reset', () => {
    let state = createInitialUIState();
    state = setActivePanel(state, 'node-config', 'right');
    state = togglePanel(state, 'node-config');
    expect(state.activeRightPanel).toBeNull();
    state = openPanel(state, 'node-library');
    state = closePanel(state, 'node-library');
    state = openPanel(state, 'node-library');
    state = closeAll(state);
    expect(state.activeLeftPanel).toBeNull();
    expect(state.activeRightPanel).toBeNull();
    expect(resetUI()).toEqual(createInitialUIState());
  });

  it('ui reducer ignores unknown actions', () => {
    const initial = createInitialUIState();
    expect(uiReducer(initial, { type: 'SOMETHING_ELSE' })).toBe(initial);
  });
});
