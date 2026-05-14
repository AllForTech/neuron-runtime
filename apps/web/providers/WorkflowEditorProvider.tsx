'use client';

import React, {
    createContext,
    useCallback,
    useEffect,
    useMemo,
    useReducer,
    useRef,
    useState,
} from 'react';
import { useParams } from 'next/navigation';
import type {
    NodeDefinition,
    NodeType,
    WorkflowDefinition,
    WorkflowEdge,
    WorkflowNode,
} from '@neuron/shared';
import { DeployedWorkflow, Execution, ExecutionLog, Workflow as WorkflowType } from "@neuron/db";
import { WorkflowEditorActionType, defaultEditorUIState, editorUIReducer } from '@/constants';
import type { EditorUIAction, EditorUIState, PanelId } from '@/constants/editor-panel';
import { Edge, Node, useReactFlow } from 'reactflow';
import { createClient } from '@/lib/supabase/client';
import {
    arrayToGlobalVariables,
    globalVariablesToArray,
    toReactFlowNode,
} from '@/lib/utils';
import { toast } from 'sonner';
import { useWorkflowRealtime } from '@/hooks/workflow/useWorkflowRealtime';
import { db } from '@/lib/db/workflow.db';
import { useLiveQuery } from 'dexie-react-hooks';
import {
    RuntimeAction,
    RuntimeActionType,
    RuntimeState,
} from '@/types';
import {
    workflows as workflowClient,
    executions as executionsClient
} from "@neuron/client";
import { nodeCatalog } from '@neuron/nodes/client';

export type SaveStatus = 'idle' | 'saving' | 'saved' | 'error' | 'retrying';

export type WorkflowEditorContextType = {
    editorState: IWorkflowEditorState;
    workflowEditorDispatch: (WorkflowEditorAction: any) => void;
    runtimeState: RuntimeState;
    runtimeDispatch: (RuntimeAction: RuntimeAction) => void;
    editorUIState: EditorUIState;
    editorUIDispatch: (action: EditorUIAction) => void;
    selectedNode: Node | null | undefined;
    setSelectedNode: (selectedNode: Node | null | undefined) => void;
    isSheetOpen: boolean;
    setIsSheetOpen: (isSheetOpen: boolean) => void;
    openConfigSheet: boolean;
    setOpenConfigSheet: (openConfigSheet: boolean) => void;
    sheetOpen: boolean;
    setSheetOpen: (sheetOpen: boolean) => void;
    isGlobalVariableSheetOpen: boolean;
    setIsGlobalVariableSheetOpen: (isGlobalVariableSheetOpen: boolean) => void;
    isEditorPanelOpen: boolean;
    setIsEditorPanelOpen: (isEditorPanelOpen: boolean) => void;
    isDeployWorkflowDialogOpen: boolean;
    setIsDeployWorkflowDialogOpen: (isDeployWorkflowDialogOpen: boolean) => void;
    isWorkflowLoading: boolean;
    setIsWorkflowLoading: (isWorkflowLoading: boolean) => void;
    isWorkflowSaving: boolean;
    saveStatus: SaveStatus;
    retryCount: number;
    isRunning: boolean;
    isDeploying: boolean;
    isExecutionsSheetOpen: boolean;
    setIsExecutionsSheetOpen: (vlue: boolean) => void;
    isWorkflowInspectorOpen: boolean;
    setIsWorkflowInspectorOpen: (vlue: boolean) => void;
    handleSelectTemplate: (template: NodeDefinition, node?: Node) => void;
    saveWorkflowGraph: () => void;
    handleRunWorkflow: () => void;
    deployWorkflow: (data: { private: boolean; secretKey: string }) => void;
    deleteDeployment: () => void;
    getExecutionLogs: (id: string) => any;
    selectedHandle: string | null;
    setSelectedHandle: (value: string | null) => void;
    fitNode: (node: WorkflowNode) => void;
    rfNodes: Node[];
    rfEdges: Edge[];
    logs: ExecutionLog[];
    setLogs: (logs: ExecutionLog[]) => void;
    isLogsLoading: boolean;
    setIsLogsLoading: (val: boolean) => void;
    nodeCatalog: NodeDefinition[];
    onRunComplete: () => void;
};

export interface IWorkflowEditorState {
    workflowId: string;
    graph: WorkflowDefinition;
    workflow: Partial<WorkflowType>;
    runtime: {
        nodeStatus: Record<string, 'idle' | 'running' | 'success' | 'error'>;
        nodeOutputs: Record<string, any> | null;
        nodeErrors: Record<string, string> | null;
        activeEdges: Record<string, boolean>;
        executions: Record<string, Execution>;
    };
    executions?: any[] | null;
    executionLogs?: any[] | null;
    globalVariables: Record<string, any>;
    deployment: Record<string, DeployedWorkflow> | null;
    isDirty: boolean;
}

const initialState: IWorkflowEditorState = {
    workflowId: '',
    graph: { nodes: {}, edges: {} },
    workflow: { id: '', name: '', description: '', status: 'draft', userId: '' },
    runtime: { nodeStatus: {}, nodeErrors: {}, nodeOutputs: null, activeEdges: {}, executions: {} },
    globalVariables: {},
    deployment: null,
    isDirty: false,
};

export const initialRuntimeState: RuntimeState = {
    nodeStatus: {},
    activeEdges: {},
    executions: {},
    logs: {},
};

export const WorkflowEditorContext = createContext<WorkflowEditorContextType | null>(null);

const RETRY_DELAY_MS = [1000, 3000, 7000, 15000, 30000];

export function WorkflowEditorProvider({ children }: { children: React.ReactNode }) {
    const workflowId = useParams().workflowId as string;
    const { fitView, addNodes, addEdges } = useReactFlow();
    const saveTimeout = useRef<NodeJS.Timeout | null>(null);
    const retryTimeout = useRef<NodeJS.Timeout | null>(null);

    const [isWorkflowLoading, setIsWorkflowLoading] = useState(false);
    const [isWorkflowSaving, setIsWorkflowSaving] = useState(false);
    const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle');
    const [retryCount, setRetryCount] = useState(0);

    const [isRunning, setIsRunning] = useState(false);
    const [isSheetOpen, setIsSheetOpen] = useState(false);
    const [sheetOpen, setSheetOpen] = useState(false);
    const [openConfigSheet, setOpenConfigSheet] = useState(false);
    const [isGlobalVariableSheetOpen, setIsGlobalVariableSheetOpen] = useState(false);
    const [isEditorPanelOpen, setIsEditorPanelOpen] = useState(false);
    const [isDeployWorkflowDialogOpen, setIsDeployWorkflowDialogOpen] = useState(false);
    const [isDeploying, setIsDeploying] = useState(false);
    const [isExecutionsSheetOpen, setIsExecutionsSheetOpen] = useState(false);
    const [isWorkflowInspectorOpen, setIsWorkflowInspectorOpen] = useState(false);

    const [editorState, workflowEditorDispatch] = useReducer(workflowEditorReducer, initialState);
    const [runtimeState, runtimeDispatch] = useReducer(runtimeReducer, initialRuntimeState);
    const [editorUIState, editorUIDispatch] = useReducer(editorUIReducer, defaultEditorUIState);

    const [selectedNode, setSelectedNode] = useState<Node | null | undefined>();
    const [selectedHandle, setSelectedHandle] = useState<string | null>(null);
    const [logs, setLogs] = useState<ExecutionLog[]>([]);
    const [isLogsLoading, setIsLogsLoading] = useState(false);

    const isSaving = useRef(false);
    const pendingSave = useRef(false);
    const isLoadingRef = useRef(false);

    const localDraft = useLiveQuery(() => db.drafts.get(workflowId), [workflowId]);

    function workflowEditorReducer(state: IWorkflowEditorState, action: any): IWorkflowEditorState {
        switch (action.type) {
            case WorkflowEditorActionType.SET_WORKFLOW_ID:
                return { ...state, workflowId: action.workflowId };
            case WorkflowEditorActionType.SET_GRAPH:
                return { ...state, graph: action.payload, isDirty: false };
            case WorkflowEditorActionType.ADD_NODE:
                return { ...state, graph: { ...state.graph, nodes: { ...state.graph.nodes, [action.payload.id]: action.payload } }, isDirty: true };
            case WorkflowEditorActionType.UPDATE_NODE:
                return { ...state, graph: { ...state.graph, nodes: { ...state.graph.nodes, [action.id]: { ...state.graph.nodes[action.id], config: { ...action.payload } } } }, isDirty: true };
            case WorkflowEditorActionType.UPDATE_NODE_POSITION: {
                const node = state.graph.nodes[action.id];
                if (!node) return state;
                return { ...state, graph: { ...state.graph, nodes: { ...state.graph.nodes, [action.id]: { ...node, position: { x: Math.round(action.position.x), y: Math.round(action.position.y) } } } }, isDirty: true };
            }
            case WorkflowEditorActionType.DELETE_NODE: {
                const newNodes = { ...state.graph.nodes };
                delete newNodes[action.id];
                return { ...state, graph: { ...state.graph, nodes: newNodes }, isDirty: true };
            }
            case WorkflowEditorActionType.ADD_EDGE:
                return { ...state, graph: { ...state.graph, edges: { ...state.graph.edges, [action.payload.id]: action.payload } }, isDirty: true };
            case WorkflowEditorActionType.DELETE_EDGE: {
                const newEdges = { ...state.graph.edges };
                delete newEdges[action.id];
                return { ...state, graph: { ...state.graph, edges: newEdges }, isDirty: true };
            }
            case WorkflowEditorActionType.UPDATE_EDGE:
                return { ...state, graph: { ...state.graph, edges: { ...state.graph.edges, [action.id]: { ...state.graph.edges[action.id], ...action.payload } } }, isDirty: true };
            case WorkflowEditorActionType.RESET_NODE_STATUS:
                return { ...state, runtime: { ...state.runtime, nodeStatus: {}, nodeErrors: {}, nodeOutputs: null } };
            case WorkflowEditorActionType.NODE_EXECUTION_START:
                return { ...state, runtime: { ...state.runtime, nodeStatus: { ...state.runtime.nodeStatus, [action.nodeId]: 'running' } } };
            case WorkflowEditorActionType.NODE_EXECUTION_SUCCESS:
                return { ...state, runtime: { ...state.runtime, nodeStatus: { ...state.runtime.nodeStatus, [action.nodeId]: 'success' }, nodeOutputs: { ...state.runtime.nodeOutputs, [action.nodeId]: action.output } } };
            case WorkflowEditorActionType.NODE_EXECUTION_ERROR:
                return { ...state, runtime: { ...state.runtime, nodeStatus: { ...state.runtime.nodeStatus, [action.nodeId]: 'error' }, nodeErrors: { ...state.runtime.nodeErrors, [action.nodeId]: action.error } } };
            case WorkflowEditorActionType.UPDATE_GLOBAL_VARS:
                return { ...state, globalVariables: action.payload, isDirty: true };
            case WorkflowEditorActionType.SET_DEPLOYMENT:
                return { ...state, deployment: action.payload };
            case WorkflowEditorActionType.UPDATE_DIRTY_STATE:
                return { ...state, isDirty: action.state ?? false };
            case WorkflowEditorActionType.SET_EXECUTIONS:
                return { ...state, runtime: { ...state.runtime, executions: action.payload } };
            default:
                return state;
        }
    }

    function runtimeReducer(state: RuntimeState, action: RuntimeAction): RuntimeState {
        switch (action.type) {
            case RuntimeActionType.SET_NODE_STATUS:
                return { ...state, nodeStatus: { ...state.nodeStatus, [action.nodeId]: action.status } };
            case RuntimeActionType.SET_EDGE_ACTIVE:
                return { ...state, activeEdges: { ...state.activeEdges, [action.edgeId]: action.isActive } };
            case RuntimeActionType.SET_EXECUTIONS:
                return { ...state, executions: action.payload };
            case RuntimeActionType.ADD_EXECUTION:
                return { ...state, executions: { [action.execution.id]: action.execution, ...state.executions } };
            case RuntimeActionType.UPDATE_EXECUTION:
                if (!state.executions[action.executionId]) return state;
                return { ...state, executions: { ...state.executions, [action.executionId]: { ...state.executions[action.executionId], ...action.payload } } };
            case RuntimeActionType.SET_LOGS:
                return { ...state, logs: action.payload };
            case RuntimeActionType.ADD_LOG:
                return { ...state, logs: { ...state.logs, [action.payload.id]: action.payload } };
            case RuntimeActionType.UPDATE_LOGS:
                const existingLog = state.logs[action.id];
                if (!existingLog) return state;
                return { ...state, logs: { [action.id]: { ...existingLog, ...action.payload }, ...state.logs } };
            case RuntimeActionType.RESET_FLOW_VISUALS:
                return { ...state, nodeStatus: {}, activeEdges: {} };
            case RuntimeActionType.CLEAR_RUNTIME:
                return initialRuntimeState;
            default:
                return state;
        }
    }

    const rfNodes = useMemo(() => {
        return Object.values(editorState.graph.nodes).map((node) => {
            const isSelected = selectedNode?.id === node.id;
            const rfNode = toReactFlowNode(node);
            return {
                ...rfNode,
                selected: isSelected,
                data: { ...rfNode.data, label: node.type }
            };
        });
    }, [editorState.graph.nodes, selectedNode?.id]);

    const rfEdges = useMemo(() => {
        return Object.values(editorState.graph.edges).map((edge) => {
            const isActive = !!editorState.runtime.activeEdges?.[edge.id];
            return {
                ...edge,
                type: 'default',
                animated: isActive,
                style: {
                    stroke: isActive ? '#ffffff' : '#c8c8c8',
                    strokeWidth: isActive ? 5 : 4,
                    transition: 'stroke 0.4s ease, stroke-width 0.4s ease',
                    opacity: 1,
                },
            };
        });
    }, [editorState.graph.edges, editorState.runtime.activeEdges]);

    useWorkflowRealtime(workflowId, workflowEditorDispatch, runtimeDispatch);

    const getSession = useCallback(async () => {
        const supabase = createClient();
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error || !session) throw new Error('No active session found');
        return session.access_token;
    }, []);

    const loadWorkflow = async () => {
        if (isLoadingRef.current) return;
        isLoadingRef.current = true;

        try {
            setIsWorkflowLoading(true);
            const token = await getSession();
            const [data, error] = await workflowClient.getGraph(workflowId, token);

            if (error) throw error;
            const response = data as any;

            const nodesRecord: Record<string, WorkflowNode> = {};
            response.graph.nodes.forEach((n: any) => {
                nodesRecord[n.id] = { id: n.id, type: n.type as NodeType, position: { x: n.positionX, y: n.positionY }, config: n.config };
            });

            const edgesRecord: Record<string, WorkflowEdge> = {};
            response.graph.edges.forEach((e: any) => {
                edgesRecord[e.id] = { id: e.id, source: e.source, target: e.target, sourceHandle: e.sourceHandle, targetHandle: e.targetHandle };
            });

            const executionRecord: Record<string, Execution> = {};
            response.executions.forEach((e) => { executionRecord[e.id] = e as Execution; });

            workflowEditorDispatch({ type: WorkflowEditorActionType.SET_GRAPH, payload: { nodes: nodesRecord, edges: edgesRecord } });
            workflowEditorDispatch({ type: WorkflowEditorActionType.UPDATE_GLOBAL_VARS, payload: arrayToGlobalVariables(response.globalVariables) });
            runtimeDispatch({ type: RuntimeActionType.SET_EXECUTIONS, payload: executionRecord as any });

            await loadDeployment();
        } catch (e: any) {
            console.error(e.message);
        } finally {
            setIsWorkflowLoading(false);
            isLoadingRef.current = false;
        }
    };

    const saveWorkflowGraph = async (attempt = 0) => {
        if (!editorState.graph.nodes || isLoadingRef.current) return;

        if (isSaving.current && attempt === 0) {
            pendingSave.current = true;
            return;
        }

        isSaving.current = true;
        setRetryCount(attempt);

        try {
            setSaveStatus(attempt > 0 ? 'retrying' : 'saving');
            setIsWorkflowSaving(true);

            const token = await getSession();
            const localDraft = await db.drafts.get(workflowId);
            if (!localDraft) {
                setSaveStatus('idle');
                setIsWorkflowSaving(false);
                isSaving.current = false;
                return;
            }

            const payload = {
                graph: {
                    nodes: Object.values(localDraft.graph.nodes) as WorkflowNode[],
                    edges: Object.values(localDraft.graph.edges) as WorkflowEdge[],
                },
                globalVariables: globalVariablesToArray(localDraft.globalVariables),
            };

            const [_, error] = await workflowClient.saveGraph(workflowId, token, payload);

            if (error) throw error;

            await db.drafts.update(workflowId, { synced: true, updatedAt: Date.now() });
            workflowEditorDispatch({ type: WorkflowEditorActionType.UPDATE_DIRTY_STATE, state: false });

            setSaveStatus('saved');
            setRetryCount(0);

            setTimeout(() => setSaveStatus('idle'), 3000);

        } catch (e: any) {
            console.error(`Save attempt ${attempt + 1} failed:`, e.message);

            if (attempt < RETRY_DELAY_MS.length) {
                setSaveStatus('retrying');
                retryTimeout.current = setTimeout(() => {
                    saveWorkflowGraph(attempt + 1);
                }, RETRY_DELAY_MS[attempt]);
            } else {
                setSaveStatus('error');
                toast.error('Cloud sync failed after multiple attempts. Working offline.');
            }
        } finally {
            setIsWorkflowSaving(false);
            if (attempt === 0 || attempt === RETRY_DELAY_MS.length || saveStatus === 'saved') {
                isSaving.current = false;
            }

            if (pendingSave.current && !isSaving.current) {
                pendingSave.current = false;
                saveWorkflowGraph(0);
            }
        }
    };

    const handleSelectTemplate = ({type, template}: NodeDefinition, connectingNode?: Node) => {
        const newNodeId = crypto.randomUUID();

        const position = connectingNode
            ? { x: connectingNode.position.x + 500, y: connectingNode.position.y + 300 }
            : { x: 200, y: 300 };

        const newNode: WorkflowNode = {
            id: newNodeId,
            type: type as NodeType,
            position,
            config: template.defaultConfig,
        };

        workflowEditorDispatch({ type: WorkflowEditorActionType.ADD_NODE, payload: newNode });
        addNodes(toReactFlowNode(newNode));

        if (connectingNode) {
            const newEdge = {
                id: crypto.randomUUID(),
                source: connectingNode.id,
                target: newNodeId,
                sourceHandle: selectedHandle,
                targetHandle: newNodeId ?? null,
                type: 'default'
            };
            workflowEditorDispatch({ type: WorkflowEditorActionType.ADD_EDGE, payload: newEdge });
            addEdges(newEdge);
        }

        setSelectedNode(null);
        setSelectedHandle(null);
        setIsSheetOpen(false);
    };

    const handleRunWorkflow = async () => {
        workflowEditorDispatch({ type: WorkflowEditorActionType.RESET_NODE_STATUS });
        try {
            setIsRunning(true);
            toast.message('Running Workflow');
            const token = await getSession();
            const [_, error] = await workflowClient.run(workflowId, token);
            if (error) throw error;
            toast.success('Execution complete.');
        } catch (e: any) {
            toast.error(e.message);
        } finally {
            setIsRunning(false);
        }
    };

    const loadDeployment = async () => {
        try {
            const token = await getSession();
            const [data, error] = await workflowClient.getDeployment(workflowId, token);
            if (error) throw error;
            if (data) {
                const deploymentRecord:Record<string, any> = {};

                deploymentRecord[(data as DeployedWorkflow).id] = data;
                workflowEditorDispatch({ type: WorkflowEditorActionType.SET_DEPLOYMENT, payload: deploymentRecord });
            }
        } catch (e: any) {
            console.error(e.message);
        }
    };

    const deployWorkflow = async (data: { private: boolean; secretKey: string }) => {
        const nodes = Object.values(editorState.graph.nodes);
        if (nodes.length === 0) return;
        try {
            setIsDeploying(true);
            const token = await getSession();
            const [deployed, error] = await workflowClient.deploy(workflowId, {
                ...data,
                name: editorState.workflow.name,
                nodes: nodes,
                edges: Object.values(editorState.graph.edges),
            }, token);

            if (error) throw error;
            workflowEditorDispatch({ type: WorkflowEditorActionType.SET_DEPLOYMENT, payload: (deployed as any)[0] });
            toast.success('Workflow deployed.');
        } catch (e: any) {
            toast.error(e.message);
        } finally {
            setIsDeploying(false);
        }
    };

    const deleteDeployment = async () => {
        try {
            const token = await getSession();
            const [_, error] = await workflowClient.deleteDeployment(workflowId, token);
            if (error) throw error;
            workflowEditorDispatch({ type: WorkflowEditorActionType.SET_DEPLOYMENT, payload: null });
            toast.success('Deployment terminated.');
        } catch (e: any) {
            toast.error(e.message);
        }
    };

    const getExecutionLogs = useCallback(async (executionId: string) => {
        try {
            setIsLogsLoading(true);
            const token = await getSession();
            const [data, error] = await executionsClient.getLogs(executionId, token);
            if (error) throw error;

            if (data) {
                const logsRecord: Record<string, ExecutionLog> = {};
                (data as ExecutionLog[]).forEach((e) => (logsRecord[e.id] = e));
                runtimeDispatch({ type: RuntimeActionType.SET_LOGS, payload: data as any });
                return logsRecord;
            }
            return {};
        } catch (e: any) {
            console.log(e.message);
            return {};
        } finally {
            setIsLogsLoading(false);
        }
    }, [getSession]);

    const fitNode = (node: WorkflowNode) => {
        fitView({ nodes: [{ id: node.id }], duration: 800, padding: 0.05, maxZoom: 1.1 });
    };

    const onRunComplete = () => {
        // Automatically pop open the debugger sidebar
        editorUIDispatch({ type: 'OPEN_PANEL', panelId: 'execution-trace' });
    };

    useEffect(() => {
        if (isLoadingRef.current || isWorkflowLoading) return;
        if (!workflowId || !editorState.graph || !editorState.isDirty) return;
        const persistLocally = async () => {
            await db.drafts.put({
                id: workflowId,
                graph: editorState.graph,
                globalVariables: editorState.globalVariables,
                updatedAt: Date.now(),
                synced: false,
            });
        };
        persistLocally();
    }, [editorState.graph, editorState.globalVariables, workflowId, editorState.isDirty]);

    useEffect(() => {
        if (isLoadingRef.current || isWorkflowLoading) return;
        if (!localDraft || localDraft.synced) return;
        if (saveTimeout.current) clearTimeout(saveTimeout.current);
        saveTimeout.current = setTimeout(() => {
            saveWorkflowGraph(0);
        }, 3000);
        return () => {
            if (saveTimeout.current) clearTimeout(saveTimeout.current);
            if (retryTimeout.current) clearTimeout(retryTimeout.current);
        };
    }, [localDraft]);

    useEffect(() => {
        if (workflowId) loadWorkflow();
    }, [workflowId]);

    return (
        <WorkflowEditorContext.Provider
            value={{
                editorState, workflowEditorDispatch, runtimeState, runtimeDispatch,
                editorUIState, editorUIDispatch, onRunComplete,
                selectedNode, setSelectedNode, selectedHandle, setSelectedHandle,
                isSheetOpen, setIsSheetOpen, isGlobalVariableSheetOpen, setIsGlobalVariableSheetOpen,
                isEditorPanelOpen, setIsEditorPanelOpen, isDeployWorkflowDialogOpen, setIsDeployWorkflowDialogOpen,
                isWorkflowLoading, setIsWorkflowLoading, isWorkflowSaving,
                saveStatus, retryCount,
                sheetOpen, setSheetOpen, openConfigSheet, setOpenConfigSheet,
                isRunning, isExecutionsSheetOpen, setIsExecutionsSheetOpen,
                isWorkflowInspectorOpen, setIsWorkflowInspectorOpen,
                handleSelectTemplate, saveWorkflowGraph, handleRunWorkflow, fitNode,
                isDeploying, deployWorkflow, deleteDeployment,
                rfNodes, rfEdges, getExecutionLogs,
                logs, setLogs, isLogsLoading, setIsLogsLoading, nodeCatalog,
            }}
        >
            {children}
        </WorkflowEditorContext.Provider>
    );
}