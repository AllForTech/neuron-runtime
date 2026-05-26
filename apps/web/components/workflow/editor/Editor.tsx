'use client';

import {
    addEdge,
    applyEdgeChanges,
    applyNodeChanges,
    Background,
    BackgroundVariant,
    Connection,
    Edge,
    EdgeChange,
    Node,
    NodeChange,
    Panel,
    ReactFlow,
    useEdgesState,
    useNodesState,
    useOnSelectionChange,
} from 'reactflow';
import { debounce } from 'lodash';
import { useCallback, useEffect, useMemo, useRef } from 'react';
// @ts-ignore
import 'reactflow/dist/style.css';
import { useWorkflowEditor } from '@/hooks/workflow/useWorkflowEditor';
import { WorkflowEditorActionType } from '@/constants';
import { EmptyGraphMenu } from '@/components/workflow/editor/EmptyGraphContextMenu';
import DynamicNode from '@/components/workflow/editor/nodes/DynamicNode';
import { EditorLoader } from '@/components/workflow/editor/EditorLoader';
import TriggerNode from '@/components/workflow/editor/nodes/TriggerNode';
import {DndProvider, DroppableZone} from "@neuron/ui";
import {EditorLayout} from "@/components/workflow/editor/layout/EditorLayout";
import { EditorTopMenu } from "./menu/EditorTopMenu";
import {DeploymentPanel} from "@/components/workflow/editor/Panel/deployment/DeploymentPanel";

const snapGrid: [number, number] = [80, 80];

export function Editor() {
    const {
        editorState,
        workflowEditorDispatch,
        rfNodes,
        rfEdges,
        setSelectedNode,
        nodeCatalog,
        isWorkflowLoading,
        isDeployWorkflowDialogOpen,
        setIsDeployWorkflowDialogOpen,
        editorUIDispatch,
    } = useWorkflowEditor();

    const [graphNodes, setGraphNodes, onNodesChange] = useNodesState([]);
    const [graphEdges, setGraphEdges, onEdgesChange] = useEdgesState([]);

    const lastSelectedId = useRef<string | null>(null);

    const nodeTypes = useMemo(() => {
        if (!nodeCatalog) return {};

        return Object.fromEntries(
            nodeCatalog.map((node) => {
                const type = node.type;
                const component = type.startsWith('Trigger.')
                    ? TriggerNode
                    : DynamicNode;

                return [type, component];
            })
        );
    }, [nodeCatalog]);

    useOnSelectionChange({
        onChange: ({ nodes: selectedNodes }) => {
            const nextNode = selectedNodes?.[0] || null;
            const nextId = nextNode?.id || null;

            if (nextId !== lastSelectedId.current) {
                lastSelectedId.current = nextId;


                setSelectedNode(null);
                setSelectedNode(nextNode);

                // if (nextId) {
                //     editorUIDispatch({
                //         type: 'SET_ACTIVE_PANEL',
                //         panelId: 'node-config',
                //         position: 'right'
                //     });
                // }
            }
        },
    });

    useEffect(() => {
        if (!rfNodes) return;

        const timer = setTimeout(() => {
            setGraphNodes(rfNodes);
            setGraphEdges(rfEdges);
        }, 200);

        return () => clearTimeout(timer);
    }, [rfNodes, rfEdges, setGraphNodes, setGraphEdges]);

    // --------------------------------------------
    // 2️⃣ Sync NODE POSITION back → reducer
    // (ONLY when drag stops — best practice)
    // --------------------------------------------

    const debouncedUpdatePosition = useMemo(
        () =>
            debounce((id, pos) => {
                workflowEditorDispatch({
                    type: WorkflowEditorActionType.UPDATE_NODE_POSITION,
                    id,
                    position: pos,
                });
            }, 100),
        [workflowEditorDispatch]
    );

    const onNodeDragStop = useCallback(
        (_: any, node: Node) => {
            debouncedUpdatePosition(node.id, node.position);
        },
        [workflowEditorDispatch, debouncedUpdatePosition]
    );

    // --------------------------------------------
    // 3️⃣ Handle edge connect → reducer
    // --------------------------------------------

    const debouncedAddEdge = useMemo(
        () =>
            debounce((edge) => {
                workflowEditorDispatch({
                    type: WorkflowEditorActionType.ADD_EDGE,
                    payload: edge,
                });
            }, 200),
        [workflowEditorDispatch]
    );

    const onConnect = useCallback(
        (connection: Connection) => {
            const newEdge: Edge = { ...connection, id: crypto.randomUUID() };
            setGraphEdges((eds) => addEdge(newEdge, eds));

            debouncedAddEdge({
                id: newEdge.id,
                source: newEdge.source!,
                target: newEdge.target!,
                sourceHandle: newEdge.sourceHandle,
                targetHandle: newEdge.targetHandle,
            });
        },

        [setGraphEdges, debouncedAddEdge]
    );

    // --------------------------------------------
    // 4️⃣ Handle node delete
    // --------------------------------------------

    const handleNodesChange = useCallback(
        (changes: NodeChange[]) => {
            setGraphNodes((nds) => applyNodeChanges(changes, nds));

            changes.forEach((change) => {
                if (change.type === 'remove') {
                    workflowEditorDispatch({
                        type: WorkflowEditorActionType.DELETE_NODE,
                        id: change.id,
                    });
                }
            });
        },
        [workflowEditorDispatch, setGraphNodes]
    );

    // Handle edge delete

    const handleEdgesChange = useCallback(
        (changes: EdgeChange[]) => {
            setGraphEdges((eds) => applyEdgeChanges(changes, eds));

            changes.forEach((change) => {
                if (change.type === 'remove') {
                    workflowEditorDispatch({
                        type: WorkflowEditorActionType.DELETE_EDGE,
                        id: change.id,
                    });
                }
            });
        },
        [workflowEditorDispatch, setGraphEdges]
    );

    const handleNodeDoubleClick = (event, node: Node) => {
        // if (selectedNode?.id === node.id) return;
        setSelectedNode(node);
        editorUIDispatch({ type: 'SET_ACTIVE_PANEL', panelId: 'node-config', position: 'right' });
    };

    // Handle Add new Node
    const handleAddNode = () => {
        editorUIDispatch({ type: 'SET_ACTIVE_PANEL', panelId: 'node-library', position: 'right' });
    };

    const handleDnd = (templateId: string, targetId: string, nodeTemplate: any) => {

    }

    // --------------------------------------------
    // Render
    // --------------------------------------------

    return (
      <>
          {isWorkflowLoading ? (
              <EditorLoader />
          ) : (
              <DndProvider onMove={handleDnd}>
                  <DroppableZone className={"screen"} id={null}>
                      <EditorLayout>
                          <ReactFlow
                              className={'container-full'}
                              nodes={graphNodes}
                              edges={graphEdges}
                              nodeTypes={nodeTypes}
                              onNodesChange={handleNodesChange}
                              onEdgesChange={handleEdgesChange}
                              onNodeDragStop={onNodeDragStop}
                              onConnect={onConnect}
                              onNodeDoubleClick={handleNodeDoubleClick}
                              fitView
                              snapToGrid={true}
                              snapGrid={snapGrid}
                              minZoom={0.12}
                              maxZoom={5}
                          >
                              <Background
                                  color={'#121212'}
                                  gap={80}
                                  variant={BackgroundVariant.Cross}
                                  size={18}
                              />

                              <EditorTopMenu />

                              {graphNodes.length === 0 && (
                                  <Panel
                                      position="top-center"
                                      className={'container-fit canter top-[40%]!'}
                                  >
                                      <EmptyGraphMenu onAddNode={handleAddNode} />
                                  </Panel>
                              )}

                              <DeploymentPanel
                                  isOpen={isDeployWorkflowDialogOpen}
                                  onOpenChange={setIsDeployWorkflowDialogOpen}
                                  workflowName={editorState.workflow?.name}
                              />

                          </ReactFlow>
                      </EditorLayout>
                  </DroppableZone>
              </DndProvider>
          )}
      </>
    );
}
