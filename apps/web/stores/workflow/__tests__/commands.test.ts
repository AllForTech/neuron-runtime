import { describe, expect, it, vi } from 'vitest';
import { createGraphCommands, insertTemplateNode } from '../commands/graphCommands';
import {
  createDebounced,
  createGraphSyncTimers,
  retryDelayFor,
  runWithRetry,
} from '../commands/workflowSync';
import type { WorkflowNode } from '@neuron/shared';

function makeNode(id: string): WorkflowNode {
  return {
    id,
    type: 'Utility.Debug',
    position: { x: 0, y: 0 },
    config: { meta: { label: 'D' }, message: 'x' },
  };
}

describe('command helpers', () => {
  it('validates graph command inputs', () => {
    const target = {
      addNode: vi.fn(),
      updateNode: vi.fn(),
      updateNodePosition: vi.fn(),
      deleteNode: vi.fn(),
      addEdge: vi.fn(),
      deleteEdge: vi.fn(),
      updateEdge: vi.fn(),
      updateGlobalVars: vi.fn(),
      markClean: vi.fn(),
    };
    const commands = createGraphCommands(target);

    expect(commands.addNode(makeNode(''))).toBe(false);
    expect(commands.updateNode('', {})).toBe(false);
    expect(commands.updateNodePosition('n1', { x: Number.NaN, y: 0 })).toBe(false);
    expect(commands.addEdge({ id: 'e1', source: 'a', target: '' })).toBe(false);
    expect(commands.addNode(makeNode('n1'))).toBe(true);
    expect(target.addNode).toHaveBeenCalledTimes(1);
  });

  it('inserts template nodes with deterministic ids', () => {
    const target = {
      addNode: vi.fn(),
      updateNode: vi.fn(),
      updateNodePosition: vi.fn(),
      deleteNode: vi.fn(),
      addEdge: vi.fn(),
      deleteEdge: vi.fn(),
      updateEdge: vi.fn(),
      updateGlobalVars: vi.fn(),
      markClean: vi.fn(),
    };
    const ids = ['node-1', 'edge-1'];
    const result = insertTemplateNode(
      target,
      {
        type: 'Utility.Debug',
        template: { defaultConfig: { meta: { label: 'D' }, message: 'x' } },
      },
      { id: 'src', position: { x: 0, y: 0 } },
      () => ids.shift() ?? 'x',
      'out'
    );

    expect(result).toEqual({ nodeId: 'node-1', edgeId: 'edge-1' });
    expect(target.addNode).toHaveBeenCalled();
    expect(target.addEdge).toHaveBeenCalledWith(
      expect.objectContaining({ id: 'edge-1', source: 'src', target: 'node-1' })
    );
  });

  it('exposes pinned retry delays and runs bounded retries', async () => {
    expect(retryDelayFor(1)).toBe(1000);
    expect(retryDelayFor(5)).toBe(30000);
    expect(retryDelayFor(6)).toBeNull();

    const errors: number[] = [];
    const result = await runWithRetry(
      async (attempt) => {
        if (attempt < 2) throw new Error(`a${attempt}`);
        return 'ok';
      },
      {
        maxAttempts: 5,
        delaysMs: [1, 1, 1, 1, 1],
        sleep: async () => undefined,
        onAttemptError: (_e, attempt) => errors.push(attempt),
      }
    );

    expect(result).toEqual({ ok: true, attempts: 3, value: 'ok' });
    expect(errors).toEqual([0, 1]);
  });

  it('creates debounced timers and graph sync timer factories', () => {
    const callbacks: Array<() => void> = [];
    const timers = {
      setTimeout: (cb: () => void) => {
        callbacks.push(cb);
        return cb;
      },
      clearTimeout: vi.fn(),
    };
    const fn = vi.fn();
    const debounced = createDebounced(fn, 100, timers);
    debounced('a');
    debounced('b');
    expect(callbacks).toHaveLength(2);
    callbacks[1]();
    expect(fn).toHaveBeenCalledTimes(1);
    expect(fn).toHaveBeenCalledWith('b');

    const syncTimers = createGraphSyncTimers(timers);
    expect(syncTimers.localToContext(() => undefined)).toBeTypeOf('function');
    expect(syncTimers.autosave(() => undefined)).toBeTypeOf('function');
  });
});
