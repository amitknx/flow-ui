import React from 'react';
import BaseWorkflowCanvas from './BaseWorkflowCanvas';
import type { ExecutionSnapshot, WorkflowDefinition } from '../../types/workflow';


interface WorkflowCanvasProps {
  workflow?: WorkflowDefinition;
  executionSnapshot?: ExecutionSnapshot;
  mode: 'authoring' | 'execution';
  className?: string;
  onNodeClick?: (nodeId: string) => void;
  onCanvasClick?: () => void;
}

const WorkflowCanvas: React.FC<WorkflowCanvasProps> = (props) => {
  return <BaseWorkflowCanvas {...props} />;
};

export default WorkflowCanvas;
