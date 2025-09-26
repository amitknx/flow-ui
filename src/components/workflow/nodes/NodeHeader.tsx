import React from 'react';
import { clsx } from 'clsx';
import { nodeTypeConfig, statusConfig } from '../../../utils';
import NodeActions from './NodeActions';
import type { NodeType, WorkflowStatus } from '../../../types/workflow';
import type { NodeActionHandler } from '../../../types/node';

interface NodeHeaderProps {
  nodeId: string;
  type: NodeType;
  status?: WorkflowStatus;
  isConfigured?: boolean;
  isAuthoringMode?: boolean;
  showActions?: boolean;
  actionHandler?: NodeActionHandler;
  compact?: boolean;
}

const NodeHeader: React.FC<NodeHeaderProps> = ({
  nodeId,
  type,
  status,
  isConfigured = true,
  isAuthoringMode = false,
  showActions = false,
  actionHandler,
  compact = false,
}) => {
  const nodeConfig = nodeTypeConfig[type];
  const statusInfo = status ? statusConfig[status] : null;
  const NodeIcon = nodeConfig.icon;

  return (
    <div className={clsx(
      'flex items-center justify-between rounded-t-md relative',
      nodeConfig.bgColor,
      compact ? 'p-1' : 'p-1.5'
    )}>
      <div className="flex items-center gap-1 flex-1 min-w-0">
        <NodeIcon className={clsx(
          nodeConfig.textColor,
          compact ? 'w-2 h-2' : 'w-3 h-3'
        )} />
        <div className="flex-1 min-w-0">
          <span className={clsx(
            'font-medium truncate',
            nodeConfig.textColor,
            compact ? 'text-[9px]' : 'text-[10px]'
          )}>
            {nodeConfig.label}
          </span>
          {isAuthoringMode && !isConfigured && (
            <div className="w-1.5 h-1.5 bg-red-400 rounded-full absolute -top-0.5 -right-0.5 animate-pulse" />
          )}
        </div>
      </div>
      
      {statusInfo && (() => {
        const StatusIcon = statusInfo.icon;
        return (
          <StatusIcon className={clsx(
            statusInfo.color,
            statusInfo.animate && 'animate-spin',
            compact ? 'w-2 h-2' : 'w-3 h-3'
          )} />
        );
      })()}

      {/* Action buttons - show on hover in authoring mode */}
      {isAuthoringMode && showActions && actionHandler && (
        <NodeActions 
          nodeId={nodeId}
          nodeType={type}
          actionHandler={actionHandler}
          size={compact ? 'sm' : 'md'}
        />
      )}
    </div>
  );
};

export default NodeHeader;
