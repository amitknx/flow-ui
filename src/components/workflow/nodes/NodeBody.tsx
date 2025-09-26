import React from 'react';
import { AlertCircle, Loader2 } from 'lucide-react';
import { formatDuration } from '../../../utils';
import type { WorkflowStatus } from '../../../types/workflow';

interface NodeBodyProps {
  name: string;
  description?: string;
  status?: WorkflowStatus;
  duration?: number;
  error?: string;
  config?: Record<string, any>;
  isConfigured?: boolean;
  isAuthoringMode?: boolean;
  compact?: boolean;
}

const NodeBody: React.FC<NodeBodyProps> = ({
  name,
  description,
  status,
  duration,
  error,
  config,
  isConfigured = true,
  isAuthoringMode = false,
  compact = false,
}) => {
  const paddingClass = compact ? 'px-1 py-0.5' : 'p-1';
  const textSizeClass = compact ? 'text-[8px]' : 'text-[9px]';
  const smallTextClass = compact ? 'text-[7px]' : 'text-[8px]';

  return (
    <div className={`${paddingClass} ${compact ? 'space-y-0' : 'space-y-0.5'}`}>
      <div className={`font-medium text-gray-900 ${textSizeClass} truncate`}>
        {name}
      </div>
      
      {!compact && description && (
        <div className={`${smallTextClass} text-gray-500 line-clamp-1`}>
          {description}
        </div>
      )}

      {isAuthoringMode && !isConfigured && (
        <div className={`${smallTextClass} text-orange-600 bg-orange-50 px-1 py-0.5 rounded flex items-center gap-0.5`}>
          <AlertCircle className="w-2 h-2 flex-shrink-0" />
          <span className="truncate">Config</span>
        </div>
      )}
      
      {duration && (
        <div className={`${smallTextClass} text-gray-500`}>
          Duration: {formatDuration(duration)}
        </div>
      )}

      {error && (
        <div className={`${smallTextClass} text-red-600 bg-red-50 px-1 py-0.5 rounded truncate`}>
          {error}
        </div>
      )}

      {status === 'RUNNING' && (
        <div className={`${smallTextClass} text-blue-600 bg-blue-50 px-1 py-0.5 rounded flex items-center gap-0.5`}>
          <Loader2 className="w-2 h-2 animate-spin flex-shrink-0" />
          <span>Run...</span>
        </div>
      )}

      {/* Configuration preview - authoring mode only */}
      {!compact && isAuthoringMode && config && Object.keys(config).length > 0 && (
        <div className={`${smallTextClass} text-gray-600 bg-gray-50 px-2 py-1 rounded`}>
          <div className="font-medium mb-1">Config:</div>
          {Object.entries(config).slice(0, 1).map(([key, value]) => (
            <div key={key} className="flex justify-between gap-1">
              <span className="truncate">{key}:</span>
              <span className="truncate max-w-[60px]">
                {typeof value === 'string' ? value : JSON.stringify(value)}
              </span>
            </div>
          ))}
          {Object.keys(config).length > 1 && (
            <div className="text-gray-400">+{Object.keys(config).length - 1} more</div>
          )}
        </div>
      )}
    </div>
  );
};

export default NodeBody;
