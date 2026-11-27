import { describe, expect, it, vi } from 'vitest';
import { createRealtimeStoreDispatchers } from '../commands/realtimeDispatch';
import { mapRealtimeEnvelope, subscribeToWorkflowRealtime } from '../adapters/workflowRealtime';
import { graphStore } from '../graphStore';
import { runtimeStore } from '../runtimeStore';
import { createInitialGraphState } from '../transitions/graph';
import { createInitialRuntimeState } from '../transitions/runtime';

describe('realtime adapter/dispatch', () => {
  it('preserves payload shape and arbitrary action types', () => {
    const payload = { type: 'CUSTOM_EVENT', nodeId: 'n1', nested: { ok: true } };
    expect(mapRealtimeEnvelope(payload)).toEqual(payload);
    expect(mapRealtimeEnvelope(payload)).not.toBe(payload);
  });

  it('subscribes with frozen channel and events', () => {
    const on = vi.fn().mockReturnThis();
    const subscribe = vi.fn().mockReturnThis();
    const removeChannel = vi.fn();
    const channel = { on, subscribe };
    const client = { channel: vi.fn(() => channel), removeChannel };

    const cleanup = subscribeToWorkflowRealtime(client, 'wf-1', {
      onWorkflowAction: vi.fn(),
      onRuntimeAction: vi.fn(),
    });

    expect(client.channel).toHaveBeenCalledWith('workflow_wf-1');
    expect(on).toHaveBeenNthCalledWith(
      1,
      'broadcast',
      { event: 'workflow_action' },
      expect.any(Function)
    );
    expect(on).toHaveBeenNthCalledWith(
      2,
      'broadcast',
      { event: 'workflow_runtime_action' },
      expect.any(Function)
    );
    cleanup();
    expect(removeChannel).toHaveBeenCalledWith(channel);
  });

  it('routes node visuals to runtime store and ignores unknown types safely', () => {
    graphStore.setState(createInitialGraphState());
    runtimeStore.setState(createInitialRuntimeState());

    const dispatchers = createRealtimeStoreDispatchers();
    dispatchers.onWorkflowAction({ type: 'NODE_EXECUTION_START', nodeId: 'n1' });
    dispatchers.onRuntimeAction({
      type: 'SET_EDGE_ACTIVE',
      edgeId: 'e1',
      isActive: true,
    });
    dispatchers.onWorkflowAction({ type: 'TOTALLY_UNKNOWN', foo: 'bar' });

    expect(runtimeStore.getState().nodeStatus.n1).toBe('running');
    expect(runtimeStore.getState().activeEdges.e1).toBe(true);
    expect(graphStore.getState().isDirty).toBe(false);
  });
});
