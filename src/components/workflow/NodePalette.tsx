import React from 'react';
import { Plus } from 'lucide-react';
import { clsx } from 'clsx';
import { nodeTypeConfig } from '../../utils';
import type { NodeType } from '../../types/workflow';

interface NodePaletteItem {
  type: NodeType;
  category?: 'flow' | 'action' | 'logic';
}

const nodeItems: NodePaletteItem[] = [
  { type: 'START', category: 'flow' },
  { type: 'END', category: 'flow' },
  { type: 'HTTP_REQUEST', category: 'action' },
  { type: 'DELAY', category: 'action' },
  { type: 'CONDITIONAL', category: 'logic' },
  { type: 'JOIN', category: 'logic' },
  { type: 'SUB_WORKFLOW', category: 'logic' },
];

interface PaletteNodeItemProps {
  item: NodePaletteItem;
  onAddNode: (type: NodeType, position?: { x: number; y: number }) => void;
  onDragStart: (event: React.DragEvent, nodeType: NodeType) => void;
  disabled?: boolean;
}

const PaletteNodeItem: React.FC<PaletteNodeItemProps> = ({ item, onAddNode, onDragStart, disabled = false }) => {
  const config = nodeTypeConfig[item.type];
  const Icon = config.icon;

  const handleClick = () => {
    if (!disabled) {
      onAddNode(item.type, { x: 300, y: 200 });
    }
  };

  const handleDragStart = (e: React.DragEvent) => {
    if (disabled) {
      e.preventDefault();
      return;
    }
    onDragStart(e, item.type);
  };

  return (
    <div
      className={clsx(
        "group select-none transition-all duration-200",
        disabled 
          ? "cursor-not-allowed opacity-50" 
          : "cursor-grab active:cursor-grabbing"
      )}
      draggable={!disabled}
      onDragStart={handleDragStart}
      onClick={handleClick}
      title={disabled ? `${config.label} node already exists` : undefined}
    >
      <div className={clsx(
        "flex items-center gap-3 p-2.5 rounded-lg border transition-all duration-200",
        disabled
          ? "border-gray-100 bg-gray-50"
          : "border-gray-200 hover:border-primary-300 hover:bg-primary-50 group-hover:shadow-sm"
      )}>
        <div className={clsx(
          'w-8 h-8 rounded-md flex items-center justify-center flex-shrink-0',
          config.bgColor
        )}>
          <Icon className={clsx('w-4 h-4', config.textColor)} />
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="font-medium text-gray-900 text-sm truncate">
            {config.label}
          </div>
          <div className="text-xs text-gray-600 truncate">
            {config.description}
          </div>
        </div>
        
        <div className="opacity-0 group-hover:opacity-100 transition-opacity">
          <Plus className="w-3.5 h-3.5 text-primary-600" />
        </div>
      </div>
    </div>
  );
};

interface NodePaletteProps {
  onAddNode: (type: NodeType, position?: { x: number; y: number }) => void;
  className?: string;
  compact?: boolean;
  disabledNodeTypes?: NodeType[];
}

const NodePalette: React.FC<NodePaletteProps> = ({ 
  onAddNode, 
  className,
  compact = false,
  disabledNodeTypes = []
}) => {
  const handleDragStart = (event: React.DragEvent, nodeType: NodeType) => {
    event.dataTransfer.setData('application/reactflow', nodeType);
    event.dataTransfer.effectAllowed = 'move';
  };

  const groupedNodes = nodeItems.reduce((acc, item) => {
    const category = item.category || 'other';
    if (!acc[category]) acc[category] = [];
    acc[category].push(item);
    return acc;
  }, {} as Record<string, NodePaletteItem[]>);

  const categoryLabels = {
    flow: 'Flow Control',
    action: 'Actions',
    logic: 'Logic',
    other: 'Other'
  };

  return (
    <div className={clsx(
      'bg-white rounded-lg shadow-sm border border-gray-200',
      compact ? 'w-64' : 'w-80',
      className
    )}>
      <div className={clsx('border-b border-gray-200', compact ? 'p-3' : 'p-4')}>
        <h3 className={clsx(
          'font-semibold text-gray-900 flex items-center gap-2',
          compact ? 'text-sm' : 'text-base'
        )}>
          <Plus className={compact ? 'w-3.5 h-3.5' : 'w-4 h-4'} />
          Add Nodes
        </h3>
        {!compact && (
          <p className="text-sm text-gray-600 mt-1">
            Drag nodes to canvas or click to add
          </p>
        )}
      </div>
      
      <div className={clsx(compact ? 'p-2' : 'p-4')}>
        {Object.entries(groupedNodes).map(([category, items]) => (
          <div key={category} className={compact ? 'mb-3 last:mb-0' : 'mb-4 last:mb-0'}>
            <h4 className={clsx(
              'font-medium text-gray-700 mb-2',
              compact ? 'text-xs' : 'text-sm'
            )}>
              {categoryLabels[category as keyof typeof categoryLabels]}
            </h4>
            <div className="space-y-1.5">
              {items.map((item) => (
                <PaletteNodeItem
                  key={item.type}
                  item={item}
                  onAddNode={onAddNode}
                  onDragStart={handleDragStart}
                  disabled={disabledNodeTypes.includes(item.type)}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
      
      {!compact && (
        <div className="p-3 border-t border-gray-200 bg-gray-50 rounded-b-lg">
          <p className="text-xs text-gray-500">
            💡 <strong>Tip:</strong> Drag to position precisely, click for center placement
          </p>
        </div>
      )}
    </div>
  );
};

export default NodePalette;