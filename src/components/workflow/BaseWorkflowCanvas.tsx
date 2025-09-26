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
} from '@xyflow/react';
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

  // Convert workflow/execution data to React Flow format
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
      animated: mode === 'execution' ? (edge as any).traversed : false,
      style: { 
        stroke: mode === 'execution' && (edge as any).traversed ? '#10b981' : '#94a3b8', 
        strokeWidth: 2 
      },
      markerEnd: { 
        type: MarkerType.ArrowClosed, 
        color: mode === 'execution' && (edge as any).traversed ? '#10b981' : '#94a3b8' 
      },
      label: edge.label,
    }));
  }, [sourceData, mode]);

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  // Update nodes and edges when source data changes, but preserve positions
  useEffect(() => {
    if (initialNodes.length === 0) {
      // Empty workflow
      setNodes([]);
    } else if (nodes.length === 0) {
      // First time loading nodes
      setNodes(initialNodes);
    } else {
      // Handle updates to existing workflow
      const existingNodeIds = new Set(nodes.map(n => n.id));
      const newNodeIds = new Set(initialNodes.map(n => n.id));
      
      // Check if nodes were added
      const nodesAdded = initialNodes.some(n => !existingNodeIds.has(n.id));
      // Check if nodes were removed
      const nodesRemoved = nodes.some(n => !newNodeIds.has(n.id));
      
      if (nodesRemoved) {
        // Some nodes were removed, filter them out
        const remainingNodes = nodes.filter(n => newNodeIds.has(n.id));
        setNodes([
          ...remainingNodes.map(currentNode => {
            const updatedNode = initialNodes.find(n => n.id === currentNode.id);
            return updatedNode ? {
              ...currentNode,
              data: updatedNode.data,
              selected: updatedNode.selected,
              actionHandler: updatedNode.actionHandler,
            } : currentNode;
          })
        ]);
      } else if (nodesAdded) {
        // New nodes were added, preserve existing positions and add new ones
        const newNodes = initialNodes.filter(n => !existingNodeIds.has(n.id));
        setNodes(currentNodes => [
          // Update existing nodes without changing positions
          ...currentNodes.map(currentNode => {
            const updatedNode = initialNodes.find(n => n.id === currentNode.id);
            return updatedNode ? {
              ...currentNode,
              data: updatedNode.data,
              selected: updatedNode.selected,
              actionHandler: updatedNode.actionHandler,
            } : currentNode;
          }),
          // Add new nodes with their specified positions
          ...newNodes
        ]);
      } else {
        // Same nodes, just update data
        setNodes(currentNodes => 
          currentNodes.map(currentNode => {
            const updatedNode = initialNodes.find(n => n.id === currentNode.id);
            return updatedNode ? {
              ...currentNode,
              data: updatedNode.data,
              selected: updatedNode.selected,
              actionHandler: updatedNode.actionHandler,
            } : currentNode;
          })
        );
      }
    }
    
    // Always update edges as they don't have position state to preserve
    setEdges(initialEdges);
  }, [initialNodes, initialEdges, setNodes, setEdges]);

  const onConnect = useCallback(
    (params: Connection) => {
      if (mode === 'authoring') {
        const newEdge = {
          ...params,
          id: `edge_${params.source}_${params.target}_${Date.now()}`,
          animated: false,
          style: { stroke: '#94a3b8', strokeWidth: 2 },
          markerEnd: { type: MarkerType.ArrowClosed, color: '#94a3b8' },
          sourceHandle: params.sourceHandle || undefined,
          targetHandle: params.targetHandle || undefined,
        };
        setEdges((eds) => addEdge(newEdge as any, eds));
      }
    },
    [setEdges, mode]
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
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeClick={handleNodeClick}
        onPaneClick={onPaneClick}
        nodeTypes={nodeTypes}
        connectionMode={ConnectionMode.Loose}
        fitView
        proOptions={proOptions}
        nodesDraggable={nodesDraggable}
        nodesConnectable={nodesConnectable}
        elementsSelectable={true}
        selectNodesOnDrag={false}
        multiSelectionKeyCode="Shift"
        deleteKeyCode={mode === 'authoring' ? "Delete" : undefined}
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
