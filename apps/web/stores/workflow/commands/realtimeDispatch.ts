import { graphStore } from '../graphStore';
import { runtimeStore } from '../runtimeStore';
import { RUNTIME_ACTIONS, type ActionEnvelope } from '../types';

/**
 * Maps realtime envelopes onto the single owner of each state slice. Unknown
 * string types are forwarded unchanged; the boundary reducers ignore them.
 * Node-execution frames from the `workflow_action` family are routed to the
 * runtime store, which now owns node status/outputs/errors.
 */
export function createRealtimeStoreDispatchers() {
  const runtimeVisualActions: string[] = [
    RUNTIME_ACTIONS.NODE_EXECUTION_START,
    RUNTIME_ACTIONS.NODE_EXECUTION_SUCCESS,
    RUNTIME_ACTIONS.NODE_EXECUTION_ERROR,
    RUNTIME_ACTIONS.RESET_NODE_STATUS,
    RUNTIME_ACTIONS.SET_NODE_STATUS,
    RUNTIME_ACTIONS.SET_EDGE_ACTIVE,
    RUNTIME_ACTIONS.RESET_FLOW_VISUALS,
  ];

  return {
    onWorkflowAction(envelope: ActionEnvelope): void {
      if (runtimeVisualActions.includes(envelope.type)) {
        runtimeStore.getState().dispatch(envelope);
        return;
      }
      graphStore.getState().dispatch(envelope);
    },
    onRuntimeAction(envelope: ActionEnvelope): void {
      runtimeStore.getState().dispatch(envelope);
    },
  };
}
