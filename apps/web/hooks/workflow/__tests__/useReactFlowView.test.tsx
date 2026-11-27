// @vitest-environment happy-dom
import React, { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useStore } from 'zustand';
import { useShallow } from 'zustand/react/shallow';
import type { WorkflowDefinition } from '@neuron/shared';
import { graphStore } from '../../../stores/workflow/graphStore';
import { runtimeStore } from '../../../stores/workflow/runtimeStore';
import { selectUiFlags } from '../../../stores/workflow/selectors';
import { createInitialUIState } from '../../../stores/workflow/transitions/ui';
import { uiStore } from '../../../stores/workflow/uiStore';
import { useReactFlowView } from '../useReactFlowView';

type View = ReturnType<typeof useReactFlowView>;
type UiFlags = ReturnType<typeof selectUiFlags>;
type UiFlagsSelector = (state: Parameters<typeof selectUiFlags>[0]) => UiFlags;

const roots: Root[] = [];

function makeGraph(): WorkflowDefinition {
  return {
    nodes: {
      n1: {
        id: 'n1',
        type: 'Utility.Debug',
        position: { x: 1, y: 2 },
        config: { meta: { label: 'D' }, message: 'x' },
      },
    },
    edges: { e1: { id: 'e1', source: 'n1', target: 'n2' } },
  };
}

async function mount(node: React.ReactNode): Promise<Root> {
  const container = document.createElement('div');
  document.body.appendChild(container);
  const root = createRoot(container);
  roots.push(root);
  await act(async () => {
    root.render(node);
  });
  return root;
}

function ViewProbe({
  token,
  onView,
}: {
  token: number;
  onView: (view: View) => void;
}) {
  onView(useReactFlowView());
  return <span data-token={token} />;
}

function StabilityProbe({
  token,
  onCapture,
}: {
  token: number;
  onCapture: (selector: UiFlagsSelector, flags: UiFlags, view: View) => void;
}) {
  const view = useReactFlowView();
  const selector = useShallow(selectUiFlags);
  const flags = useStore(uiStore, selector);
  onCapture(selector, flags, view);
  return <span data-token={token} />;
}

beforeEach(() => {
  graphStore.getState().resetGraph();
  runtimeStore.getState().clearRuntime();
  uiStore.getState().resetUI();
  document.body.innerHTML = '';
  roots.length = 0;
});

afterEach(async () => {
  await act(async () => {
    for (const root of roots.splice(0)) root.unmount();
  });
  document.body.innerHTML = '';
  vi.restoreAllMocks();
});

describe('useReactFlowView', () => {
  it('memoizes the derived view for equal inputs and invalidates on real changes', async () => {
    graphStore.getState().setGraph(makeGraph());
    uiStore.getState().selectNode('n1');

    const views: View[] = [];
    const capture = (view: View) => views.push(view);
    const root = await mount(<ViewProbe token={0} onView={capture} />);

    const first = views[views.length - 1];
    expect(first.rfNodes).toHaveLength(1);
    expect(first.rfEdges).toHaveLength(1);
    expect(first.rfNodes[0].data).toMatchObject({
      label: 'Utility.Debug',
      message: 'x',
    });

    await act(async () => {
      uiStore.getState().openPanel('node-config');
      runtimeStore.getState().setNodeStatus('n1', 'running');
      root.render(<ViewProbe token={1} onView={capture} />);
    });

    const second = views[views.length - 1];
    expect(second).toBe(first);
    expect(second.rfNodes).toBe(first.rfNodes);
    expect(second.rfEdges).toBe(first.rfEdges);

    await act(async () => {
      uiStore.getState().selectNode(null);
    });
    expect(views[views.length - 1].rfNodes[0].selected).toBe(false);

    await act(async () => {
      runtimeStore.getState().setEdgeActive('e1', true);
    });
    expect(views[views.length - 1].rfEdges[0].animated).toBe(true);

    await act(async () => {
      graphStore.getState().updateNodePosition('n1', { x: 7, y: 9 });
    });
    expect(views[views.length - 1].rfNodes[0].position).toEqual({ x: 7, y: 9 });
  });

  it('keeps useShallow and memoized references stable without loop warnings', async () => {
    graphStore.getState().setGraph(makeGraph());
    uiStore.getState().selectNode('n1');
    const consoleError = vi.spyOn(console, 'error');

    const selectors: UiFlagsSelector[] = [];
    const flagsSeen: UiFlags[] = [];
    const viewsSeen: View[] = [];
    const capture = (
      selector: UiFlagsSelector,
      flags: UiFlags,
      view: View
    ) => {
      selectors.push(selector);
      flagsSeen.push(flags);
      viewsSeen.push(view);
    };
    const root = await mount(<StabilityProbe token={0} onCapture={capture} />);

    for (let token = 1; token <= 4; token += 1) {
      await act(async () => {
        uiStore.getState().selectNode('n1');
        root.render(<StabilityProbe token={token} onCapture={capture} />);
      });
    }

    expect(flagsSeen[flagsSeen.length - 1]).toBe(flagsSeen[0]);
    expect(viewsSeen[viewsSeen.length - 1]).toBe(viewsSeen[0]);

    const wrappedSelector = selectors[0];
    const equalStateA = createInitialUIState();
    const equalStateB = { ...equalStateA };
    expect(wrappedSelector(equalStateA)).toBe(wrappedSelector(equalStateB));
    expect(wrappedSelector({ ...equalStateB, selectedNodeId: 'n1' })).not.toBe(
      wrappedSelector(equalStateA)
    );

    const loopWarnings = consoleError.mock.calls
      .map((args) => args.map(String).join(' '))
      .filter((message) =>
        /Maximum update depth|getSnapshot should be cached/.test(message)
      );
    expect(loopWarnings).toEqual([]);
  });
});
