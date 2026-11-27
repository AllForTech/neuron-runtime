'use client';

import { useMemo } from 'react';
import { useStore } from 'zustand';
import { graphStore } from '../../stores/workflow/graphStore';
import { runtimeStore } from '../../stores/workflow/runtimeStore';
import {
  deriveReactFlowView,
  selectActiveEdges,
  selectGraph,
} from '../../stores/workflow/selectors';
import { uiStore } from '../../stores/workflow/uiStore';

/**
 * The one derived canvas view for React Flow consumers.
 *
 * Store reads are primitive or stable record references, so render never
 * returns a fresh object snapshot to useSyncExternalStore. The nested arrays
 * are memoized by input reference because `useShallow` cannot compare their
 * nested node/edge objects.
 */
export function useReactFlowView() {
  const graph = useStore(graphStore, selectGraph);
  const selectedNodeId = useStore(uiStore, (state) => state.selectedNodeId);
  const activeEdges = useStore(runtimeStore, selectActiveEdges);

  return useMemo(() => {
    const view = deriveReactFlowView(graph, selectedNodeId, activeEdges);
    return { rfNodes: view.nodes, rfEdges: view.edges };
  }, [graph, selectedNodeId, activeEdges]);
}
