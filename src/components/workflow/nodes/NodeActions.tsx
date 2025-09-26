import React from 'react';
import { Settings, Trash2, Copy } from 'lucide-react';
import type { NodeAction, NodeActionHandler } from '../../../types/node';

interface NodeActionsProps {
  nodeId: string;
  nodeType?: string;
  actionHandler?: NodeActionHandler;
  className?: string;
  size?: 'sm' | 'md';
}

const actionConfig: Record<NodeAction, {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  hoverColor: string;
}> = {
  configure: {
    icon: Settings,
    label: 'Configure node',
    hoverColor: 'hover:text-blue-600',
  },
  duplicate: {
    icon: Copy,
    label: 'Duplicate node',
    hoverColor: 'hover:text-green-600',
  },
  delete: {
    icon: Trash2,
    label: 'Delete node',
    hoverColor: 'hover:text-red-600',
  },
};

const NodeActions: React.FC<NodeActionsProps> = ({ 
  nodeId,
  nodeType,
  actionHandler,
  className = '',
  size = 'md'
}) => {
  const handleAction = (action: NodeAction, event: React.MouseEvent) => {
    event.stopPropagation();
    
    switch (action) {
      case 'configure':
        actionHandler?.onConfigure?.(nodeId);
        break;
      case 'duplicate':
        actionHandler?.onDuplicate?.(nodeId);
        break;
      case 'delete':
        actionHandler?.onDelete?.(nodeId);
        break;
    }
  };

  const buttonSize = size === 'sm' ? 'w-3.5 h-3.5' : 'w-4 h-4';
  const iconSize = size === 'sm' ? 'w-1.5 h-1.5' : 'w-2 h-2';

  return (
    <div className={`absolute -top-1.5 -right-1.5 flex gap-0.5 ${className}`}>
      {Object.entries(actionConfig).map(([action, config]) => {
        const Icon = config.icon;
        const actionKey = action as NodeAction;
        
        // Only show actions that have handlers
        const hasHandler = actionHandler?.[
          `on${actionKey.charAt(0).toUpperCase() + actionKey.slice(1)}` as keyof NodeActionHandler
        ];
        
        // Don't show delete action for START nodes
        if (actionKey === 'delete' && nodeType === 'START') return null;
        
        if (!hasHandler) return null;
        
        return (
          <button
            key={action}
            onClick={(e) => handleAction(actionKey, e)}
            className={`${buttonSize} bg-white rounded-full shadow-md flex items-center justify-center text-gray-600 ${config.hoverColor} transition-colors`}
            title={config.label}
          >
            <Icon className={iconSize} />
          </button>
        );
      })}
    </div>
  );
};

export default NodeActions;
