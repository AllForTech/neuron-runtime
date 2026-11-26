'use client';

/**
 * TEMPORARY COMPATIBILITY SHIM — DELETE IN T-124.
 *
 * The 27 editor consumers still call `useWorkflowEditor()`, which reads
 * `WorkflowEditorContext`. This file keeps that context and its public type
 * intact but sources every live value from the Zustand stores/commands wired by
 * `WorkflowSessionBootstrap`. No consumer is migrated here (T-123 owns that).
 * When the last consumer is migrated, delete this file and the hook.
 */
import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from 'react';
import type { Edge, Node } from 'reactflow';
import { useReactFlow } from 'reactflow';
import { useStore } from 'zustand';
import { useShallow } from 'zustand/react/shallow';
import { toast } from 'sonner';
import { nodeCatalog } from '@neuron/nodes/client';
import type {
  NodeDefinition,
  NodeType,
  WorkflowEdge,
  WorkflowNode,
} from '@neuron/shared';
import type { EditorUIAction, EditorUIState } from '../constants/editor-panel';
import { toReactFlowNode } from '../lib/utils';
import type { RuntimeAction, WorkflowEditorAction } from '../types';
import { graphStore } from '../stores/workflow/graphStore';
import { runtimeStore } from '../stores/workflow/runtimeStore';
import { uiStore } from '../stores/workflow/uiStore';
import { sessionStore } from '../stores/workflow/sessionStore';
import { selectRuntimeLogs } from '../stores/workflow/selectors';
import {
  WorkflowSessionContext,
  type WorkflowCommands,
} from '../stores/workflow/bootstrap/WorkflowSessionContext';
import {
  createLegacyDispatchers,
  deriveLegacyReactFlowView,
  selectLegacyEditorRuntime,
  selectLegacyEditorUI,
  selectLegacyGraphSlice,
  selectLegacyRuntimeState,
  selectLegacySessionFlags,
  toLegacyEditorState,
  toLegacyLogsRecord,
  type LegacyEditorState,
  type LegacyRuntimeState,
  type LegacySaveStatus,
} from '../stores/workflow/shim/legacyContext';
import type { WorkflowExecutionLog } from '../stores/workflow/types';

export type SaveStatus = LegacySaveStatus;
export type IWorkflowEditorState = LegacyEditorState;

export const initialRuntimeState: LegacyRuntimeState = {
  nodeStatus: {},
  activeEdges: {},
  executions: {},
  logs: {},
};

/** Legacy public shape. Kept unchanged so the 27 consumers render as-is. */
export type WorkflowEditorContextType = {
  editorState: IWorkflowEditorState;
  workflowEditorDispatch: (action: WorkflowEditorAction) => void;
  runtimeState: LegacyRuntimeState;
  runtimeDispatch: (action: RuntimeAction) => void;
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
  getExecutionLogs: (id: string) => Promise<Record<string, WorkflowExecutionLog>>;
  selectedHandle: string | null;
  setSelectedHandle: (value: string | null) => void;
  fitNode: (node: WorkflowNode) => void;
  rfNodes: Node[];
  rfEdges: Edge[];
  logs: WorkflowExecutionLog[];
  setLogs: (logs: WorkflowExecutionLog[]) => void;
  isLogsLoading: boolean;
  setIsLogsLoading: (val: boolean) => void;
  nodeCatalog: NodeDefinition[];
  onRunComplete: () => void;
};

export const WorkflowEditorContext =
  createContext<WorkflowEditorContextType | null>(null);

export interface WorkflowEditorProviderProps {
  children: React.ReactNode;
  /** Route id from the app layer; the store's copy is used when omitted. */
  workflowId?: string;
}

export function WorkflowEditorProvider({
  children,
  workflowId: workflowIdProp,
}: WorkflowEditorProviderProps) {
  const session = useContext(WorkflowSessionContext);
  if (!session) {
    throw new Error(
      'WorkflowEditorProvider must be rendered inside WorkflowSessionBootstrap'
    );
  }
  const commands: WorkflowCommands = session.commands;
  const { fitView, addNodes, addEdges } = useReactFlow();

  // Stable store actions (Zustand creates them once) are selected individually.
  const graphDispatch = useStore(graphStore, (state) => state.dispatch);
  const runtimeDispatchAction = useStore(runtimeStore, (state) => state.dispatch);
  const uiDispatch = useStore(uiStore, (state) => state.dispatch);
  const addNodeAction = useStore(graphStore, (state) => state.addNode);
  const addEdgeAction = useStore(graphStore, (state) => state.addEdge);
  const selectNodeAction = useStore(uiStore, (state) => state.selectNode);
  const closePanelAction = useStore(uiStore, (state) => state.closePanel);
  const openPanelAction = useStore(uiStore, (state) => state.openPanel);
  const setDeployDialogOpen = useStore(uiStore, (state) => state.setDeployDialogOpen);
  const setSelectedHandleAction = useStore(uiStore, (state) => state.setSelectedHandle);
  const setLoading = useStore(sessionStore, (state) => state.setLoading);
  const setLogsLoading = useStore(sessionStore, (state) => state.setLogsLoading);
  const setLogsAction = useStore(runtimeStore, (state) => state.setLogs);

  // Object/array selectors are shallow-compared (T-007 D2).
  const graphSlice = useStore(graphStore, useShallow(selectLegacyGraphSlice));
  const runtimeSlice = useStore(
    runtimeStore,
    useShallow(selectLegacyEditorRuntime)
  );
  const runtimeState = useStore(
    runtimeStore,
    useShallow(selectLegacyRuntimeState)
  );
  const editorUIState = useStore(uiStore, useShallow(selectLegacyEditorUI));
  const sessionFlags = useStore(
    sessionStore,
    useShallow(selectLegacySessionFlags)
  );
  const runtimeLogs = useStore(runtimeStore, useShallow(selectRuntimeLogs));

  const selectedNodeId = useStore(uiStore, (state) => state.selectedNodeId);
  const selectedHandle = useStore(uiStore, (state) => state.selectedHandle);
  const isDeployWorkflowDialogOpen = useStore(
    uiStore,
    (state) => state.isDeployWorkflowDialogOpen
  );
  const storeWorkflowId = useStore(graphStore, (state) => state.workflowId);
  const workflowId = workflowIdProp ?? storeWorkflowId;

  const dispatchers = useMemo(
    () =>
      createLegacyDispatchers(
        { dispatch: graphDispatch },
        { dispatch: runtimeDispatchAction },
        { dispatch: uiDispatch }
      ),
    [graphDispatch, runtimeDispatchAction, uiDispatch]
  );

  // Legacy object-valued/selection flags stay local until T-123/T-124.
  const [selectedNode, setSelectedNodeState] = useState<
    Node | null | undefined
  >();
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [openConfigSheet, setOpenConfigSheet] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [isGlobalVariableSheetOpen, setIsGlobalVariableSheetOpen] =
    useState(false);
  const [isEditorPanelOpen, setIsEditorPanelOpen] = useState(false);
  const [isExecutionsSheetOpen, setIsExecutionsSheetOpen] = useState(false);
  const [isWorkflowInspectorOpen, setIsWorkflowInspectorOpen] = useState(false);

  const editorState = useMemo(
    () => toLegacyEditorState(graphSlice, runtimeSlice),
    [graphSlice, runtimeSlice]
  );
  const logs = runtimeLogs;
  const view = useMemo(
    () => deriveLegacyReactFlowView(graphSlice.graph, selectedNodeId, runtimeSlice.activeEdges),
    [graphSlice.graph, selectedNodeId, runtimeSlice.activeEdges]
  );

  const setSelectedNode = useCallback(
    (node: Node | null | undefined) => {
      setSelectedNodeState(node);
      selectNodeAction(node?.id ?? null);
    },
    [selectNodeAction]
  );

  const setLogs = useCallback(
    (nextLogs: WorkflowExecutionLog[]) => {
      setLogsAction(toLegacyLogsRecord(nextLogs));
    },
    [setLogsAction]
  );

  const fitNode = useCallback(
    (node: WorkflowNode) => {
      fitView({
        nodes: [{ id: node.id }],
        duration: 800,
        padding: 0.05,
        maxZoom: 1.1,
      });
    },
    [fitView]
  );

  const onRunComplete = useCallback(
    () => openPanelAction('execution-trace'),
    [openPanelAction]
  );

  const handleSelectTemplate = useCallback(
    (template: NodeDefinition, connectingNode?: Node) => {
      const newNodeId = crypto.randomUUID();
      const position = connectingNode
        ? {
            x: connectingNode.position.x + 350,
            y: connectingNode.position.y + 250,
          }
        : { x: 200, y: 300 };

      const newNode: WorkflowNode = {
        id: newNodeId,
        type: template.type as NodeType,
        position,
        config: template.template.defaultConfig,
      };
      addNodeAction(newNode);
      addNodes(toReactFlowNode(newNode));

      if (connectingNode) {
        const newEdge = {
          id: crypto.randomUUID(),
          source: connectingNode.id,
          target: newNodeId,
          sourceHandle: selectedHandle,
          targetHandle: newNodeId ?? null,
          type: 'default',
        };
        addEdgeAction(newEdge as WorkflowEdge);
        addEdges(newEdge);
      }

      setSelectedNodeState(null);
      selectNodeAction(null);
      setSelectedHandleAction(null);
      closePanelAction('node-library');
    },
    [
      addNodeAction,
      addEdgeAction,
      addNodes,
      addEdges,
      selectedHandle,
      selectNodeAction,
      setSelectedHandleAction,
      closePanelAction,
    ]
  );

  const saveWorkflowGraph = useCallback(() => {
    void commands.saveGraph(workflowId);
  }, [commands, workflowId]);

  const handleRunWorkflow = useCallback(() => {
    void (async () => {
      toast.message('Running Workflow');
      const ok = await commands.runWorkflow(workflowId);
      if (ok) toast.success('Execution complete.');
    })();
  }, [commands, workflowId]);

  const deployWorkflow = useCallback(
    (data: { private: boolean; secretKey: string }) => {
      void (async () => {
        const ok = await commands.deployWorkflow(workflowId, data);
        if (ok) toast.success('Workflow deployed.');
      })();
    },
    [commands, workflowId]
  );

  const deleteDeployment = useCallback(() => {
    void (async () => {
      const ok = await commands.deleteDeployment(workflowId);
      if (ok) toast.success('Deployment terminated.');
    })();
  }, [commands, workflowId]);

  const getExecutionLogs = useCallback(
    (executionId: string) => commands.getExecutionLogs(executionId),
    [commands]
  );

  const value: WorkflowEditorContextType = {
    editorState,
    workflowEditorDispatch: dispatchers.workflowEditorDispatch as (
      action: WorkflowEditorAction
    ) => void,
    runtimeState,
    runtimeDispatch: dispatchers.runtimeDispatch as (
      action: RuntimeAction
    ) => void,
    editorUIState,
    editorUIDispatch: dispatchers.editorUIDispatch as (
      action: EditorUIAction
    ) => void,
    selectedNode,
    setSelectedNode,
    isSheetOpen,
    setIsSheetOpen,
    openConfigSheet,
    setOpenConfigSheet,
    sheetOpen,
    setSheetOpen,
    isGlobalVariableSheetOpen,
    setIsGlobalVariableSheetOpen,
    isEditorPanelOpen,
    setIsEditorPanelOpen,
    isDeployWorkflowDialogOpen,
    setIsDeployWorkflowDialogOpen: setDeployDialogOpen,
    isWorkflowLoading: sessionFlags.isWorkflowLoading,
    setIsWorkflowLoading: setLoading,
    isWorkflowSaving: sessionFlags.isWorkflowSaving,
    saveStatus: sessionFlags.saveStatus,
    retryCount: sessionFlags.retryCount,
    isRunning: sessionFlags.isRunning,
    isDeploying: sessionFlags.isDeploying,
    isExecutionsSheetOpen,
    setIsExecutionsSheetOpen,
    isWorkflowInspectorOpen,
    setIsWorkflowInspectorOpen,
    handleSelectTemplate,
    saveWorkflowGraph,
    handleRunWorkflow,
    deployWorkflow,
    deleteDeployment,
    getExecutionLogs,
    selectedHandle,
    setSelectedHandle: setSelectedHandleAction,
    fitNode,
    rfNodes: view.rfNodes as Node[],
    rfEdges: view.rfEdges as Edge[],
    logs,
    setLogs,
    isLogsLoading: sessionFlags.isLogsLoading,
    setIsLogsLoading: setLogsLoading,
    nodeCatalog,
    onRunComplete,
  };

  return (
    <WorkflowEditorContext.Provider value={value}>
      {children}
    </WorkflowEditorContext.Provider>
  );
}
