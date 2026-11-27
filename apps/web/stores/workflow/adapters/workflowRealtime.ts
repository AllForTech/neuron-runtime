import {
  REALTIME_CHANNEL_PREFIX,
  WORKFLOW_ACTION_EVENT,
  WORKFLOW_RUNTIME_ACTION_EVENT,
} from '../constants';
import type { ActionEnvelope } from '../types';

/**
 * Realtime adapter. It forwards arbitrary string action types without
 * reshaping the payload, and owns the frozen channel/event wire strings.
 */

export function mapRealtimeEnvelope<T extends ActionEnvelope>(payload: T): T {
  // Same object shape as the previous dynamic dispatch: `{ type: payload.type, ...payload }`.
  return { type: payload.type, ...payload };
}

export interface RealtimeHandlers {
  onWorkflowAction: (envelope: ActionEnvelope) => void;
  onRuntimeAction: (envelope: ActionEnvelope) => void;
}

export function createRealtimeDispatchAdapter(handlers: RealtimeHandlers): RealtimeHandlers {
  return {
    onWorkflowAction: (payload) =>
      handlers.onWorkflowAction(mapRealtimeEnvelope(payload)),
    onRuntimeAction: (payload) =>
      handlers.onRuntimeAction(mapRealtimeEnvelope(payload)),
  };
}

export interface RealtimeChannelLike {
  on(
    type: 'broadcast',
    filter: { event: string },
    callback: (message: { payload: unknown }) => void
  ): RealtimeChannelLike;
  subscribe(): unknown;
}

export interface RealtimeClientLike {
  channel(name: string): RealtimeChannelLike;
  removeChannel(channel: RealtimeChannelLike): unknown;
}

/**
 * Subscribes with the exact channel/event names used today. Returns an
 * idempotent-looking cleanup that removes the same channel instance.
 */
export function subscribeToWorkflowRealtime(
  client: RealtimeClientLike,
  runId: string,
  handlers: RealtimeHandlers
): () => void {
  const channel = client
    .channel(`${REALTIME_CHANNEL_PREFIX}${runId}`)
    .on('broadcast', { event: WORKFLOW_ACTION_EVENT }, ({ payload }) => {
      handlers.onWorkflowAction(mapRealtimeEnvelope(payload as ActionEnvelope));
    })
    .on('broadcast', { event: WORKFLOW_RUNTIME_ACTION_EVENT }, ({ payload }) => {
      handlers.onRuntimeAction(mapRealtimeEnvelope(payload as ActionEnvelope));
    })
    .subscribe();

  return () => {
    void client.removeChannel(channel as RealtimeChannelLike);
  };
}
