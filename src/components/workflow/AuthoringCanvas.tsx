import React, { useCallback, useRef, useState } from 'react';
import {
  ReactFlowProvider,
  useReactFlow,
} from '@xyflow/react';
import { clsx } from 'clsx';

import BaseWorkflowCanvas from './BaseWorkflowCanvas';
import type { WorkflowDefinition, NodeType } from '../../types/workflow';
import type { NodeActionHandler } from '../../types/node';

interface AuthoringCanvasProps {
  workflow?: WorkflowDefinition;
  className?: string;
  onNodeClick?: (nodeId: string) => void;
  onCanvasClick?: () => void;
  onAddNode?: (type: NodeType, position?: { x: number; y: number }) => void;
  nodeActionHandler?: NodeActionHandler;
}

// Internal component that uses useReactFlow hook
const AuthoringCanvasInternal: React.FC<AuthoringCanvasProps> = ({
  workflow,
  className,
  onNodeClick,
  onCanvasClick,
  onAddNode,
  nodeActionHandler,
}) => {
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const { screenToFlowPosition } = useReactFlow();

  const addNodeToCanvas = useCallback((type: NodeType, position?: { x: number; y: number }) => {
    const defaultPosition = position || { x: 300, y: 200 };
    console.log('AuthoringCanvas: Adding node', type, 'at', defaultPosition);
    onAddNode?.(type, defaultPosition);
  }, [onAddNode]);

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
    setIsDragOver(true);
  }, []);

  const onDragLeave = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    setIsDragOver(false);
  }, []);

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();
      console.log('Drop event triggered');

      const type = event.dataTransfer.getData('application/reactflow') as NodeType;
      console.log('Dropped node type:', type);

      if (typeof type === 'undefined' || !type) {
        console.log('Missing node type for drop:', type);
        return;
      }

      const position = screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });
      console.log('Drop position:', position);

      addNodeToCanvas(type, position);
      setIsDragOver(false);
    },
    [screenToFlowPosition, addNodeToCanvas]
  );

  const handleCanvasClick = () => {
    setIsDragOver(false);
    onCanvasClick?.();
  };

  return (
    <div 
      className={clsx(
        'w-full h-full relative', 
        className,
        isDragOver && 'bg-primary-50 border-2 border-dashed border-primary-300'
      )} 
      ref={reactFlowWrapper}
      onDrop={onDrop}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
    >
      {isDragOver && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-primary-50/80 pointer-events-none">
          <div className="bg-white rounded-lg shadow-lg p-4 text-center">
            <div className="text-primary-600 font-medium">Drop node here</div>
            <div className="text-sm text-gray-600">Release to add to workflow</div>
          </div>
        </div>
      )}
      <BaseWorkflowCanvas
        workflow={workflow}
        mode="authoring"
        className="h-full"
        onNodeClick={onNodeClick}
        onCanvasClick={handleCanvasClick}
        nodeActionHandler={nodeActionHandler}
        nodesDraggable={true}
        nodesConnectable={true}
      />
    </div>
  );
};

// Main component that wraps with ReactFlowProvider
const AuthoringCanvas: React.FC<AuthoringCanvasProps> = (props) => {
  return (
    <ReactFlowProvider>
      <AuthoringCanvasInternal {...props} />
    </ReactFlowProvider>
  );
};

export default AuthoringCanvas;