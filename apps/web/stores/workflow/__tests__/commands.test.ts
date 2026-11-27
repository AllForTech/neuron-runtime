import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { toast } from 'sonner';
import { createGraphCommands, insertTemplateNode } from '../commands/graphCommands';
import {
  createDebounced,
  createGraphSyncTimers,
  retryDelayFor,
  runWithRetry,
} from '../commands/workflowSync';
import type { WorkflowNode } from '@neuron/shared';
import { reportError } from '../commands/workflowErrorReporting';

vi.mock('sonner', () => ({ toast: { error: vi.fn() } }));

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

describe('workflow command error policy', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('logs only the three pinned load/log contexts', () => {
    for (const context of ['loadGraph', 'loadDeployment', 'getExecutionLogs']) {
      reportError(new Error(`${context} failed`), context);
    }

    expect(console.error).toHaveBeenCalledTimes(3);
    expect(console.error).toHaveBeenNthCalledWith(1, 'loadGraph failed');
    expect(console.error).toHaveBeenNthCalledWith(2, 'loadDeployment failed');
    expect(console.error).toHaveBeenNthCalledWith(3, 'getExecutionLogs failed');
    expect(toast.error).not.toHaveBeenCalled();
  });

  it('keeps the exact save toast text', () => {
    reportError(new Error('ignored'), 'saveGraph');

    expect(toast.error).toHaveBeenCalledTimes(1);
    expect(toast.error).toHaveBeenCalledWith(
      'Cloud sync failed after multiple attempts. Working offline.'
    );
    expect(console.error).not.toHaveBeenCalled();
  });

  it('keeps the generic toast and stringifies non-Error failures', () => {
    reportError(new Error('run failed'), 'runWorkflow');
    reportError('deploy failed', 'deployWorkflow');

    expect(toast.error).toHaveBeenCalledTimes(2);
    expect(toast.error).toHaveBeenNthCalledWith(1, 'run failed');
    expect(toast.error).toHaveBeenNthCalledWith(2, 'deploy failed');
    expect(console.error).not.toHaveBeenCalled();
  });
});
