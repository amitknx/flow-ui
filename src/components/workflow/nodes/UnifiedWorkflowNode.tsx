import React, { useState } from 'react';
import { clsx } from 'clsx';
import NodeHeader from './NodeHeader';
import NodeBody from './NodeBody';
import NodeHandles from './NodeHandles';
import type { NodeProps } from '../../../types/node';
import { NODE_SIZES } from '../../../types/node';

// Combined data type for the unified node
export interface UnifiedWorkflowNodeData {
  name: string;
  type: import('../../../types/workflow').NodeType;
  description?: string;
  config?: Record<string, any>;
  // Authoring specific
  isConfigured?: boolean;
  validationErrors?: string[];
  // Execution specific
  status?: import('../../../types/workflow').WorkflowStatus;
  duration?: number;
  error?: string;
  input?: Record<string, any>;
  output?: Record<string, any>;
  timings?: {
    startedAt?: string;
    endedAt?: string;
    duration?: number;
  };
  // Mode
  mode?: 'authoring' | 'execution';
}

const UnifiedWorkflowNode: React.FC<NodeProps<UnifiedWorkflowNodeData>> = ({ 
  id, 
  data, 
  selected,
  actionHandler
}) => {
  const [showActions, setShowActions] = useState(false);
  const isAuthoringMode = data.mode === 'authoring';
  const isCompact = true; // Always use compact mode for better space utilization

  // Determine node size based on mode and type
  const nodeSize = NODE_SIZES.compact;
  const nodeWidth = isCompact ? 'min-w-[90px] max-w-[120px]' : 'min-w-[110px] max-w-[140px]';

  return (
    <div 
      className={clsx(
        'bg-white rounded-md shadow-sm border-2 transition-all duration-200',
        nodeWidth,
        selected ? 'border-primary-500 ring-2 ring-primary-200' : 'border-gray-200 hover:border-gray-300',
        data.status && `bg-${data.status.toLowerCase()}-50`,
        isAuthoringMode && 'group'
      )}
      style={{ 
        minWidth: nodeSize.width,
        minHeight: nodeSize.height 
      }}
      onMouseEnter={() => isAuthoringMode && setShowActions(true)}
      onMouseLeave={() => isAuthoringMode && setShowActions(false)}
    >
      {/* Node Handles */}
      <NodeHandles type={data.type} compact={isCompact} />
      
      {/* Node Header */}
      <NodeHeader
        nodeId={id}
        type={data.type}
        status={data.status}
        isConfigured={data.isConfigured}
        isAuthoringMode={isAuthoringMode}
        showActions={showActions}
        actionHandler={actionHandler}
        compact={isCompact}
      />

      {/* Node Body */}
      <NodeBody
        name={data.name}
        description={data.description}
        status={data.status}
        duration={data.duration}
        error={data.error}
        config={data.config}
        isConfigured={data.isConfigured}
        isAuthoringMode={isAuthoringMode}
        compact={isCompact}
      />
    </div>
  );
};

export default UnifiedWorkflowNode;