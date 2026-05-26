import type { PanelDefinition, PanelId, PanelPosition } from '@/constants/editor-panel';
import {Layers, Settings, Activity, Database, AlertCircle, History, Plus} from 'lucide-react';
import dynamic from 'next/dynamic';

import { PanelSkeletonLoader } from '@/components/workflow/editor/layout/panels/PanelSkeleton';

export * from '@/constants/editor-panel';

const NodeTemplatePanelLazy = dynamic(() => import('@/components/workflow/editor/Panel/templates/NodeTemplatePanel'), {
    loading: () => <PanelSkeletonLoader /> 
});
const NodeConfigPanelLazy = dynamic(() => import('@/components/workflow/editor/Panel/NodeConfigPanel'), {
    loading: () => <PanelSkeletonLoader /> 
});
const ExecutionTraceLazy = dynamic(() => import('@/components/workflow/editor/executions/ExecutionHistoryPanel'), {
    loading: () => <PanelSkeletonLoader /> 
});
const GlobalVariablesSheetLazy = dynamic(() => import('@/components/workflow/editor/Panel/GlobalVariableSheet'), {
    loading: () => <PanelSkeletonLoader /> 
});
const WorkflowInspectorLazy = dynamic(() => import('@/components/workflow/editor/WorkflowInspector'), { 
    loading: () => <PanelSkeletonLoader /> 
});
const ExecutionHistorySheetLazy = dynamic(() => import('@/components/workflow/editor/executions/ExecutionHistoryPanel'), {
    loading: () => <PanelSkeletonLoader /> 
});
const GraphNavigatorLazy = dynamic(() => import('@/components/workflow/editor/Panel/NodesInspector'), {
    loading: () => <PanelSkeletonLoader /> 
});

export type PanelRegistryRecord = Record<PanelId, Omit<PanelDefinition, 'id'>>;

export const panelRegistry: PanelRegistryRecord = {
    'node-library': {
        position: 'right',
        label: 'Components',
        icon: Plus,
        component: NodeTemplatePanelLazy,
    },
    'node-config': {
        position: 'right',
        label: 'Properties',
        icon: Settings,
        component: NodeConfigPanelLazy,
    },
    'execution-trace': {
        position: 'right',
        label: 'Live Trace',
        icon: Activity,
        component: ExecutionTraceLazy,
    },
    'variables': {
        position: 'right',
        label: 'Variables',
        icon: Database,
        component: GlobalVariablesSheetLazy,
    },
    'workflow-inspector': {
        position: 'right',
        label: 'Integrity',
        icon: AlertCircle,
        component: WorkflowInspectorLazy,
    },
    'execution-history': {
        position: 'right',
        label: 'History',
        icon: History,
        component: ExecutionHistorySheetLazy,
    },
    'deploy':  {
        position: 'right',
        label: 'Deploy',
        icon: History,
        component: ExecutionHistorySheetLazy,
    },
    'graph-navigator': {
        position: 'left',
        label: 'Graph Navigator',
        icon: Layers,
        component: GraphNavigatorLazy,
    },
};

export function getPanelById(id: PanelId): PanelDefinition | undefined {
    const entry = panelRegistry[id];
    if (!entry) return undefined;
    return { id, ...entry };
}

export function getPanelsByPosition(position: PanelPosition): PanelDefinition[] {
    return Object.entries(panelRegistry)
        .filter(([_, panel]) => panel.position === position)
        .map(([id, panel]) => ({ id: id as PanelId, ...panel }));
}

export function isPanelPosition(panelId: PanelId, position: PanelPosition): boolean {
    return panelRegistry[panelId]?.position === position;
}

export function getPanelPosition(panelId: PanelId): PanelPosition | undefined {
    return panelRegistry[panelId]?.position;
}