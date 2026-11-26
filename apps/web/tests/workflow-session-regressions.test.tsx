// @vitest-environment happy-dom
import React, { act } from 'react';
import type { Root } from 'react-dom/client';
import { createRoot } from 'react-dom/client';
import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import type { DraftRow } from '../lib/graphMappers';
import { graphStore } from '../stores/workflow/graphStore';
import { runtimeStore } from '../stores/workflow/runtimeStore';
import { sessionStore } from '../stores/workflow/sessionStore';
import { uiStore } from '../stores/workflow/uiStore';
import { createWorkflowCommands } from '../stores/workflow/commands/workflowCommands';
import { createWorkflowDraftAdapter } from '../stores/workflow/adapters/workflowDraft';
import type { WorkflowEditorContextType } from '../providers/WorkflowEditorProvider';

const mocks = vi.hoisted(() => ({
  workflows: {
    getGraph: vi.fn(),
    saveGraph: vi.fn(),
    run: vi.fn(),
    deploy: vi.fn(),
    getAllDeployment: vi.fn(),
    deleteDeployment: vi.fn(),
  },
  executions: { getLogs: vi.fn() },
  toastError: vi.fn(),
  toastMessage: vi.fn(),
  toastSuccess: vi.fn(),
  consoleError: vi.fn(),
  draftGet: vi.fn(),
  draftPut: vi.fn(),
  draftUpdate: vi.fn(),
  getSession: vi.fn(),
  channelOn: vi.fn(),
  channelSubscribe: vi.fn(),
  removeChannel: vi.fn(),
  liveDraft: { current: null as unknown as DraftRow | null },
}));

vi.mock('@neuron/client', () => ({
  workflows: mocks.workflows,
  executions: mocks.executions,
}));

vi.mock('sonner', () => ({
  toast: {
    error: mocks.toastError,
    message: mocks.toastMessage,
    success: mocks.toastSuccess,
  },
}));

vi.mock('next/navigation', () => ({ useParams: () => ({ workflowId: 'wf-1' }) }));

vi.mock('reactflow', () => ({
  ReactFlowProvider: ({ children }: { children: React.ReactNode }) => children,
  useReactFlow: () => ({
    fitView: vi.fn(),
    addNodes: vi.fn(),
    addEdges: vi.fn(),
  }),
}));

vi.mock('dexie-react-hooks', () => ({
  useLiveQuery: () => mocks.liveDraft.current,
}));

vi.mock('../lib/supabase/client', () => {
  const channel = { on: mocks.channelOn, subscribe: mocks.channelSubscribe };
  mocks.channelOn.mockReturnValue(channel);
  mocks.channelSubscribe.mockReturnValue(channel);
  return {
    createClient: () => ({
      auth: { getSession: mocks.getSession },
      channel: () => channel,
      removeChannel: mocks.removeChannel,
    }),
  };
});

vi.mock('../lib/db/workflow.db', () => ({
  db: {
    drafts: {
      get: mocks.draftGet,
      put: mocks.draftPut,
      update: mocks.draftUpdate,
    },
  },
}));

vi.mock('@/providers/NodeOutputContext', () => ({
  NodeOutputProvider: ({ children }: { children: React.ReactNode }) => children,
}));

vi.mock('@/providers/ValidationContext', () => ({
  ValidationProvider: ({ children }: { children: React.ReactNode }) => children,
}));

vi.mock('@/providers/WorkflowEditorProvider', async () =>
  import('../providers/WorkflowEditorProvider')
);

vi.mock('@/stores/workflow/bootstrap', async () =>
  import('../stores/workflow/bootstrap')
);

let EditorProvider: typeof import('../app/(editor)/Provider')['EditorProvider'];
let WorkflowEditorContext: typeof import('../providers/WorkflowEditorProvider')['WorkflowEditorContext'];

const roots: Root[] = [];

function draft(): DraftRow {
  return {
    id: 'wf-1',
    graph: { nodes: {}, edges: {} },
    globalVariables: {},
    updatedAt: 1,
    synced: false,
  };
}

async function flushMicrotasks(): Promise<void> {
  for (let i = 0; i < 10; i += 1) await Promise.resolve();
}

async function renderEditor(children?: React.ReactNode): Promise<void> {
  const container = document.createElement('div');
  document.body.appendChild(container);
  const root = createRoot(container);
  roots.push(root);
  await act(async () => {
    root.render(<EditorProvider>{children ?? null}</EditorProvider>);
    await flushMicrotasks();
  });
}

beforeAll(async () => {
  ({ EditorProvider } = await import('../app/(editor)/Provider'));
  ({ WorkflowEditorContext } = await import('../providers/WorkflowEditorProvider'));
});

beforeEach(() => {
  vi.useFakeTimers();
  vi.clearAllMocks();
  graphStore.getState().resetGraph();
  runtimeStore.getState().clearRuntime();
  uiStore.getState().resetUI();
  sessionStore.getState().resetSession();
  document.body.innerHTML = '';
  roots.length = 0;

  mocks.liveDraft.current = draft();
  mocks.getSession.mockResolvedValue({
    data: { session: { access_token: 'token' } },
    error: null,
  });
  mocks.workflows.getGraph.mockResolvedValue([
    { graph: { nodes: [], edges: [] }, globalVariables: [], executions: [] },
    null,
  ]);
  mocks.workflows.getAllDeployment.mockResolvedValue([[], null]);
  mocks.workflows.saveGraph.mockResolvedValue([undefined, null]);
  mocks.executions.getLogs.mockResolvedValue([[], null]);
  mocks.draftGet.mockResolvedValue(draft());
  mocks.draftPut.mockResolvedValue(undefined);
  mocks.draftUpdate.mockResolvedValue(undefined);
  mocks.removeChannel.mockReturnValue(undefined);
  vi.spyOn(console, 'error').mockImplementation(mocks.consoleError);
});

afterEach(() => {
  vi.restoreAllMocks();
  vi.useRealTimers();
  document.body.innerHTML = '';
  roots.length = 0;
});

describe('T-122 composition regressions', () => {
  it('loads in legacy order without draft writes or autosave during bootstrap', async () => {
    const order: string[] = [];
    const session = sessionStore.getState();
    const beginBootstrap = session.beginBootstrap;
    const completeBootstrap = session.completeBootstrap;
    vi.spyOn(session, 'beginBootstrap').mockImplementation(() => {
      order.push('beginBootstrap');
      beginBootstrap();
    });
    vi.spyOn(session, 'completeBootstrap').mockImplementation(() => {
      order.push('completeBootstrap');
      completeBootstrap();
    });

    const graph = graphStore.getState();
    const setWorkflowId = graph.setWorkflowId;
    const setGraph = graph.setGraph;
    const updateGlobalVars = graph.updateGlobalVars;
    const setDeployment = graph.setDeployment;
    vi.spyOn(graph, 'setWorkflowId').mockImplementation((id) => {
      order.push('setWorkflowId');
      setWorkflowId(id);
    });
    vi.spyOn(graph, 'setGraph').mockImplementation((next) => {
      order.push('setGraph');
      setGraph(next);
    });
    vi.spyOn(graph, 'updateGlobalVars').mockImplementation((vars) => {
      order.push('updateGlobalVars');
      updateGlobalVars(vars);
    });
    vi.spyOn(graph, 'setDeployment').mockImplementation((deployment) => {
      order.push('setDeployment');
      setDeployment(deployment);
    });

    mocks.workflows.getGraph.mockImplementation(async () => {
      order.push('getGraph');
      return [
        { graph: { nodes: [], edges: [] }, globalVariables: [], executions: [] },
        null,
      ];
    });
    mocks.workflows.getAllDeployment.mockImplementation(async () => {
      order.push('getAllDeployment');
      return [[], null];
    });

    await renderEditor();

    expect(order).toEqual([
      'beginBootstrap',
      'getGraph',
      'setWorkflowId',
      'setGraph',
      'updateGlobalVars',
      'getAllDeployment',
      'setDeployment',
      'completeBootstrap',
    ]);
    expect(sessionStore.getState().bootstrapStatus).toBe('ready');
    expect(graphStore.getState().isDirty).toBe(false);
    expect(mocks.draftPut).not.toHaveBeenCalled();

    await act(async () => {
      await vi.advanceTimersByTimeAsync(3500);
      await flushMicrotasks();
    });
    expect(mocks.workflows.saveGraph).not.toHaveBeenCalled();
  });

  it('logs load failures without showing a toast', async () => {
    mocks.workflows.getGraph.mockResolvedValueOnce([null, new Error('load failed')]);

    await renderEditor();

    expect(sessionStore.getState().bootstrapStatus).toBe('error');
    expect(sessionStore.getState().lastError).toBe('load failed');
    expect(mocks.toastError).not.toHaveBeenCalled();
    expect(mocks.consoleError).toHaveBeenCalledWith('load failed');
  });

  it('logs execution-log failures without showing a toast', async () => {
    let context: WorkflowEditorContextType | null = null;
    await renderEditor(
      <WorkflowEditorContext.Consumer>
        {(value) => {
          context = value;
          return null;
        }}
      </WorkflowEditorContext.Consumer>
    );
    expect(context).not.toBeNull();
    mocks.consoleError.mockClear();
    mocks.executions.getLogs.mockResolvedValueOnce([null, new Error('logs failed')]);

    let result: Record<string, unknown> = {};
    await act(async () => {
      result = await context!.getExecutionLogs('exec-1');
      await flushMicrotasks();
    });

    expect(result).toEqual({});
    expect(mocks.toastError).not.toHaveBeenCalled();
    expect(mocks.consoleError).toHaveBeenCalledWith('logs failed');
  });

  it('returns saveStatus from saved to idle after the legacy delay', async () => {
    const commands = createWorkflowCommands({
      graph: graphStore,
      runtime: runtimeStore,
      session: sessionStore,
      workflowClient: mocks.workflows,
      executionsClient: mocks.executions,
      getAccessToken: mocks.getSession as unknown as () => Promise<string>,
      draft: createWorkflowDraftAdapter({
        get: mocks.draftGet,
        put: mocks.draftPut,
        update: mocks.draftUpdate,
      }),
      onError: mocks.consoleError,
    });

    await commands.saveGraph('wf-1');
    expect(sessionStore.getState().saveStatus).toBe('saved');

    await vi.advanceTimersByTimeAsync(2999);
    expect(sessionStore.getState().saveStatus).toBe('saved');

    await vi.advanceTimersByTimeAsync(1);
    expect(sessionStore.getState().saveStatus).toBe('idle');
  });
});
