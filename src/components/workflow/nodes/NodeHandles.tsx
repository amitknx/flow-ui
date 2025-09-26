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
          position={Position.Top} 
          className={handleClass}
        />
      )}
      
      {/* Output Handles */}
      {type === 'CONDITIONAL' ? (
        // Conditional nodes have two output handles
        <>
          <Handle 
            type="source" 
            position={Position.Bottom} 
            id="true"
            className={`!bg-green-500 !border-white ${handleSize} !left-[30%]`}
            style={{ left: '30%' }}
          />
          <Handle 
            type="source" 
            position={Position.Bottom} 
            id="false"
            className={`!bg-red-500 !border-white ${handleSize} !left-[70%]`}
            style={{ left: '70%' }}
          />
        </>
      ) : type !== 'END' ? (
        // Regular nodes have one output handle
        <Handle 
          type="source" 
          position={Position.Bottom} 
          className={handleClass}
        />
      ) : null}
    </>
  );
};

export default NodeHandles;
