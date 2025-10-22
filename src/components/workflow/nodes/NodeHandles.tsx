import React from 'react';
import { Handle, Position } from '@xyflow/react';
import type { NodeType } from '../../../types/workflow';

interface NodeHandlesProps {
  type: NodeType;
  compact?: boolean;
}

const NodeHandles: React.FC<NodeHandlesProps> = ({ type, compact = false }) => {
  const handleSize = compact ? 'w-1.5 h-1.5' : 'w-2 h-2';
  const handleClass = `!bg-gray-400 !border-white ${handleSize}`;

  return (
    <>
      {/* Input Handle */}
      {type !== 'START' && (
        <Handle 
          type="target" 
          position={Position.Left} 
          className={handleClass}
        />
      )}
      
      {/* Output Handles */}
      {type === 'CONDITIONAL' ? (
        // Conditional nodes have two output handles
        <>
          <Handle 
            type="source" 
            position={Position.Right} 
            id="true"
            className={`!bg-green-500 !border-white ${handleSize} !top-[30%]`}
            style={{ top: '30%' }}
          />
          <Handle 
            type="source" 
            position={Position.Right} 
            id="false"
            className={`!bg-red-500 !border-white ${handleSize} !top-[70%]`}
            style={{ top: '70%' }}
          />
        </>
      ) : type !== 'END' ? (
        // Regular nodes have one output handle
        <Handle 
          type="source" 
          position={Position.Right} 
          className={handleClass}
        />
      ) : null}
    </>
  );
};

export default NodeHandles;
