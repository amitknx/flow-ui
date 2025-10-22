import React, { useCallback, useMemo, useEffect } from 'react';
import {
  ReactFlow,
  Controls,
  Background,
  MiniMap,
  useNodesState,
  useEdgesState,
  addEdge,
  ConnectionMode,
  MarkerType,
  BezierEdge,
} from '@xyflow/react';
import type { EdgeTypes } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { clsx } from 'clsx';

import UnifiedWorkflowNode from './nodes/UnifiedWorkflowNode';
import type { NodeActionHandler } from '../../types/node';
import { getNodeColor, getNodeConfigurationStatus } from '../../utils';
import { useWorkflowStore } from '../../stores/workflow';
import type { ExecutionSnapshot, WorkflowDefinition } from '../../types/workflow';
import type { Node, Edge } from '../../types/react-flow';
import type { Connection } from '@xyflow/react';

const nodeTypes = {
  unifiedWorkflowNode: UnifiedWorkflowNode,
};

const edgeTypes: EdgeTypes = {
  default: BezierEdge,
};

interface BaseWorkflowCanvasProps {
  workflow?: WorkflowDefinition;
  executionSnapshot?: ExecutionSnapshot;
  mode: 'authoring' | 'execution';
  className?: string;
  onNodeClick?: (nodeId: string) => void;
  onCanvasClick?: () => void;
  onWorkflowChange?: (nodes: Node[], edges: Edge[]) => void;
  nodeActionHandler?: NodeActionHandler;
  nodesDraggable?: boolean;
  nodesConnectable?: boolean;
  showMiniMap?: boolean;
  showControls?: boolean;
}

const BaseWorkflowCanvas: React.FC<BaseWorkflowCanvasProps> = ({
  workflow,
  executionSnapshot,
  mode,
  className,
  onNodeClick,
  onCanvasClick,
  onWorkflowChange,
  nodeActionHandler,
  nodesDraggable = mode === 'authoring',
  nodesConnectable = mode === 'authoring',
  showMiniMap = true,
  showControls = true,
}) => {
  const { setSelectedNodeId, selectedNodeId } = useWorkflowStore();

  // Determine which data to use based on mode
  const sourceData = mode === 'execution' && executionSnapshot ? executionSnapshot : workflow;

  const initialNodes = useMemo((): Node[] => {
    if (!sourceData) return [];

    return sourceData.nodes.map(node => ({
      id: node.id,
      type: 'unifiedWorkflowNode',
      position: node.position,
      data: {
        name: node.name,
        type: node.type,
        status: mode === 'execution' ? (node as any).status : undefined,
        duration: mode === 'execution' ? (node as any).timings?.duration : undefined,
        error: mode === 'execution' ? (node as any).error : undefined,
        input: mode === 'execution' ? (node as any).input : undefined,
        output: mode === 'execution' ? (node as any).output : undefined,
        config: (node as any).config || (node as any).data,
        description: mode === 'authoring' ? `${node.type.replace('_', ' ').toLowerCase()}` : undefined,
        isConfigured: mode === 'authoring' ? getNodeConfigurationStatus(node.type, node.data) : undefined,
        mode,
      },
      selected: node.id === selectedNodeId,
      actionHandler: mode === 'authoring' ? nodeActionHandler : undefined,
      sourcePosition: 'right',
      targetPosition: 'left',
    }));
  }, [sourceData, mode, selectedNodeId]);

  const initialEdges = useMemo((): Edge[] => {
    if (!sourceData) return [];

    return sourceData.edges.map(edge => ({
      id: edge.id,
      source: edge.source,
      target: edge.target,
      sourceHandle: edge.sourceHandle,
      targetHandle: edge.targetHandle,
      type: 'default',
      animated: mode === 'execution' ? (edge as any).traversed : false,
      style: {
        stroke: mode === 'execution' && (edge as any).traversed ? '#10b981' : '#F27405',
        strokeWidth: 1.5,
      },
      markerEnd: {
        type: MarkerType.ArrowClosed,
        color: mode === 'execution' && (edge as any).traversed ? '#10b981' : '#F27405',
      },
      label: edge.label,
    }));
  }, [sourceData, mode]);

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  const handleNodesChange = useCallback((changes: any) => {
    onNodesChange(changes);
  }, [onNodesChange]);

  const handleEdgesChange = useCallback((changes: any) => {
    onEdgesChange(changes);

    if (mode === 'authoring' && workflow && onWorkflowChange) {
      const removedEdges = changes.filter((c: any) => c.type === 'remove');
      if (removedEdges.length > 0) {
        const removedIds = new Set(removedEdges.map((c: any) => c.id));
        const updatedEdges = workflow.edges.filter(edge => !removedIds.has(edge.id));
        onWorkflowChange(workflow.nodes, updatedEdges);
      }
    }
  }, [onEdgesChange, mode, workflow, onWorkflowChange]);

  useEffect(() => {
    if (initialNodes.length === 0) {
      setNodes([]);
      setEdges([]);
      return;
    }

    if (nodes.length === 0) {
      setNodes(initialNodes);
      setEdges(initialEdges);
      return;
    }

    const currentNodeIds = new Set(nodes.map(n => n.id));
    const newNodeIds = new Set(initialNodes.map(n => n.id));

    const nodesAdded = initialNodes.some(n => !currentNodeIds.has(n.id));
    const nodesRemoved = nodes.some(n => !newNodeIds.has(n.id));

    if (nodesAdded) {
      const addedNodes = initialNodes.filter(n => !currentNodeIds.has(n.id));
      setNodes(current => [
        ...current.map(node => {
          const updated = initialNodes.find(n => n.id === node.id);
          return updated ? { ...node, data: updated.data, selected: updated.selected, actionHandler: updated.actionHandler } : node;
        }),
        ...addedNodes
      ]);
    } else if (nodesRemoved) {
      setNodes(current =>
        current.filter(n => newNodeIds.has(n.id)).map(node => {
          const updated = initialNodes.find(n => n.id === node.id);
          return updated ? { ...node, data: updated.data, selected: updated.selected, actionHandler: updated.actionHandler } : node;
        })
      );
    } else {
      setNodes(current =>
        current.map(node => {
          const updated = initialNodes.find(n => n.id === node.id);
          return updated ? { ...node, data: updated.data, selected: updated.selected, actionHandler: updated.actionHandler } : node;
        })
      );
    }

    setEdges(initialEdges);
  }, [initialNodes, initialEdges]);

  const onConnect = useCallback(
    (params: Connection) => {
      if (mode === 'authoring') {
        const newEdge = {
          ...params,
          id: `edge_${params.source}_${params.target}_${Date.now()}`,
          type: 'default',
          animated: false,
          style: { stroke: '#F27405', strokeWidth: 1.5 },
          markerEnd: { type: MarkerType.ArrowClosed, color: '#F27405' },
        };
        setEdges((eds) => addEdge(newEdge as any, eds));

        if (workflow && onWorkflowChange) {
          const workflowEdge = {
            id: newEdge.id,
            source: params.source!,
            target: params.target!,
            sourceHandle: params.sourceHandle || undefined,
            targetHandle: params.targetHandle || undefined,
          };
          onWorkflowChange(workflow.nodes, [...workflow.edges, workflowEdge]);
        }
      }
    },
    [mode, setEdges, workflow, onWorkflowChange]
  );

  const handleNodeClick = useCallback(
    (event: React.MouseEvent, node: Node) => {
      event.stopPropagation();
      setSelectedNodeId(node.id);
      onNodeClick?.(node.id);
    },
    [setSelectedNodeId, onNodeClick]
  );

  const onPaneClick = useCallback(() => {
    setSelectedNodeId(null);
    onCanvasClick?.();
  }, [setSelectedNodeId, onCanvasClick]);

  const proOptions = { hideAttribution: true };

  return (
    <div className={clsx('w-full h-full bg-gray-50', className)}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={handleNodesChange}
        onEdgesChange={handleEdgesChange}
        onConnect={onConnect}
        onNodeClick={handleNodeClick}
        onPaneClick={onPaneClick}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        connectionMode={ConnectionMode.Loose}
        fitView
        proOptions={proOptions}
        nodesDraggable={nodesDraggable}
        nodesConnectable={nodesConnectable}
        elementsSelectable={true}
        selectNodesOnDrag={false}
        multiSelectionKeyCode="Shift"
        deleteKeyCode={mode === 'authoring' ? "Delete" : undefined}
        edgesFocusable={mode === 'authoring'}
        edgesSelectable={mode === 'authoring'}
        edgesReconnectable={mode === 'authoring'}
      >
        <Background color="#e2e8f0" gap={16} />
        
        {showControls && (
          <Controls className="bg-white shadow-lg rounded-lg" />
        )}
        
        {showMiniMap && (
          <MiniMap 
            className="bg-white shadow-lg rounded-lg"
            nodeColor={(node) => {
              const nodeData = node.data;
              return getNodeColor(nodeData?.type as any, nodeData?.status as any);
            }}
          />
        )}
      </ReactFlow>
    </div>
  );
};

export default BaseWorkflowCanvas;
