import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import React from 'react';
import { renderToString } from 'react-dom/server';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('reactflow', () => ({
  ReactFlowProvider: ({ children }: { children: React.ReactNode }) => children,
  useReactFlow: () => ({
    fitView: vi.fn(),
    addNodes: vi.fn(),
    addEdges: vi.fn(),
  }),
}));

vi.mock('sonner', () => ({
  toast: { error: vi.fn(), message: vi.fn(), success: vi.fn() },
}));

vi.mock('next/navigation', () => ({ useParams: () => ({ workflowId: 'wf-1' }) }));

vi.mock('dexie-react-hooks', () => ({ useLiveQuery: () => undefined }));

vi.mock('@neuron/auth', () => ({ createClient: () => ({}) }));

import {
  WorkflowEditorContext,
  WorkflowEditorProvider,
  type WorkflowEditorContextType,
} from '../providers/WorkflowEditorProvider';
import {
  graphStore,
  runtimeStore,
  sessionStore,
  uiStore,
} from '../stores/workflow';
import {
  WorkflowSessionContext,
  type WorkflowCommands,
  type WorkflowSessionContextValue,
} from '../stores/workflow/bootstrap';
import { createWorkflowCommands } from '../stores/workflow/commands/workflowCommands';
import { createWorkflowDraftAdapter } from '../stores/workflow/adapters/workflowDraft';
import { selectRuntimeLogs } from '../stores/workflow/selectors';
import {
  createLegacyDispatchers,
  toLegacyLogsRecord,
} from '../stores/workflow/shim/legacyContext';
import { createInitialRuntimeState } from '../stores/workflow/transitions/runtime';
import {
  GRAPH_ACTIONS,
  RUNTIME_ACTIONS,
  type WorkflowExecutionLog,
} from '../stores/workflow/types';

function makeLog(id: string): WorkflowExecutionLog {
  return {
    id,
    executionId: 'exec-1',
    nodeId: 'node-1',
    nodeType: 'Utility.Debug',
    nodeLabel: 'Debug',
    status: 'success',
    input: null,
    output: { ok: true },
    startedAt: '2026-01-01T00:00:00.000Z',
    order: 1,
    createdAt: '2026-01-01T00:00:00.000Z',
  };
}

const commands = createWorkflowCommands({
  graph: graphStore,
  runtime: runtimeStore,
  session: sessionStore,
  workflowClient: {
    getGraph: async () => [{ graph: { nodes: [], edges: [] } }, null],
    saveGraph: async () => [undefined, null],
    run: async () => [undefined, null],
    deploy: async () => [{ id: 'd1' }, null],
    getAllDeployment: async () => [[], null],
    deleteDeployment: async () => [undefined, null],
  },
  executionsClient: { getLogs: async () => [[], null] },
  getAccessToken: async () => 'token',
  draft: createWorkflowDraftAdapter({
    get: async () => undefined,
    put: async () => undefined,
    update: async () => undefined,
  }),
});

const sessionValue: WorkflowSessionContextValue = {
  commands: commands as WorkflowCommands,
};

const captured: { current: WorkflowEditorContextType | null } = { current: null };

function renderShim(): WorkflowEditorContextType {
  captured.current = null;
  renderToString(
    <WorkflowSessionContext.Provider value={sessionValue}>
      <WorkflowEditorProvider workflowId="wf-1">
        <WorkflowEditorContext.Consumer>
          {(value) => {
            captured.current = value;
            return null;
          }}
        </WorkflowEditorContext.Consumer>
      </WorkflowEditorProvider>
    </WorkflowSessionContext.Provider>
  );
  if (!captured.current) {
    throw new Error('shim did not publish WorkflowEditorContext');
  }
  return captured.current;
}

beforeEach(() => {
  graphStore.getState().resetGraph();
  runtimeStore.getState().clearRuntime();
  uiStore.getState().resetUI();
  sessionStore.getState().resetSession();
});

describe('temporary workflow editor shim', () => {
  it('mounts the editor shim inside WorkflowSessionBootstrap', () => {
    const source = readFileSync(
      resolve(process.cwd(), 'apps/web/app/(editor)/Provider.tsx'),
      'utf8'
    );

    expect(source).toContain(
      "import { WorkflowSessionBootstrap } from '@/stores/workflow/bootstrap';"
    );
    expect(source).toMatch(
      /<WorkflowSessionBootstrap\b[^>]*workflowId=\{workflowId\}[^>]*>[\s\S]*<WorkflowEditorProvider\b[^>]*workflowId=\{workflowId\}[^>]*>[\s\S]*<\/WorkflowSessionBootstrap>/
    );
  });

  it('exposes a working legacy deploy-dialog setter', () => {
    const value = renderShim();
    expect(value.isDeployWorkflowDialogOpen).toBe(false);
    expect(typeof value.setIsDeployWorkflowDialogOpen).toBe('function');

    value.setIsDeployWorkflowDialogOpen(true);
    expect(uiStore.getState().isDeployWorkflowDialogOpen).toBe(true);

    value.setIsDeployWorkflowDialogOpen(false);
    expect(uiStore.getState().isDeployWorkflowDialogOpen).toBe(false);
  });

  it('keeps legacy dispatch routing and memoized store-action inputs', () => {
    const graphDispatch = vi.fn();
    const runtimeDispatch = vi.fn();
    const uiDispatch = vi.fn();
    const dispatchers = createLegacyDispatchers(
      { dispatch: graphDispatch },
      { dispatch: runtimeDispatch },
      { dispatch: uiDispatch }
    );

    const runtimeAction = {
      type: RUNTIME_ACTIONS.NODE_EXECUTION_START,
      nodeId: 'node-1',
    };
    dispatchers.workflowEditorDispatch(runtimeAction);
    expect(runtimeDispatch).toHaveBeenCalledWith(runtimeAction);
    expect(graphDispatch).not.toHaveBeenCalled();

    const graphAction = {
      type: GRAPH_ACTIONS.SET_GRAPH,
      payload: { nodes: {}, edges: {} },
    };
    dispatchers.workflowEditorDispatch(graphAction);
    expect(graphDispatch).toHaveBeenCalledWith(graphAction);

    const uiAction = { type: 'OPEN_PANEL', panelId: 'execution-trace' };
    dispatchers.editorUIDispatch(uiAction);
    expect(uiDispatch).toHaveBeenCalledWith(uiAction);

    const source = readFileSync(
      resolve(process.cwd(), 'apps/web/providers/WorkflowEditorProvider.tsx'),
      'utf8'
    );
    expect(source).toMatch(
      /const dispatchers = useMemo\(\s*\(\)\s*=>\s*createLegacyDispatchers\([\s\S]*?\[graphDispatch, runtimeDispatchAction, uiDispatch\]\s*\);/
    );
  });

  it('publishes logs as the legacy array while the store keeps the record', () => {
    const log = makeLog('log-1');
    const state = { ...createInitialRuntimeState(), logs: { [log.id]: log } };

    expect(selectRuntimeLogs(state)).toEqual([log]);
    expect(toLegacyLogsRecord([log])).toEqual(state.logs);

    const source = readFileSync(
      resolve(process.cwd(), 'apps/web/providers/WorkflowEditorProvider.tsx'),
      'utf8'
    );
    expect(source).toContain(
      'const runtimeLogs = useStore(runtimeStore, useShallow(selectRuntimeLogs));'
    );
    expect(source).toContain('const logs = runtimeLogs;');
    expect(source).not.toMatch(/\btoLegacyLogs\(/);
  });
});
