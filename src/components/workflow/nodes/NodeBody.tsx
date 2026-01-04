import React from 'react';
import { AlertCircle, Loader2, Clock, GitBranch, Play } from 'lucide-react';
import { formatDuration } from '../../../utils';
import type { WorkflowStatus, NodeType } from '../../../types/workflow';

interface NodeBodyProps {
  name: string;
  type: NodeType;
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
  type,
  status,
  duration,
  error,
  config,
  isConfigured = true,
  isAuthoringMode = false,
  compact = false,
}) => {
  const paddingClass = compact ? 'px-1.5 py-1' : 'p-1.5';
  const textSizeClass = compact ? 'text-[8px]' : 'text-[9px]';
  const smallTextClass = compact ? 'text-[7px]' : 'text-[8px]';

  const renderPreview = () => {
    if (!config) return null;

    switch (type) {
      case 'HTTP_REQUEST': {
        const method = config.method || 'GET';
        const path = config.path || config.endpointPath || config.url || '';
        const methodColors: Record<string, string> = {
          GET: 'bg-blue-100 text-blue-700',
          POST: 'bg-green-100 text-green-700',
          PUT: 'bg-orange-100 text-orange-700',
          DELETE: 'bg-red-100 text-red-700',
          PATCH: 'bg-purple-100 text-purple-700',
        };

        return (
          <div className="flex flex-col gap-0.5 mt-1">
            <div className="flex items-center gap-1">
              <span className={`px-1 rounded-[2px] font-bold uppercase ${methodColors[method] || 'bg-gray-100 text-gray-700'} ${smallTextClass}`}>
                {method}
              </span>
              <span className={`text-gray-500 truncate font-mono ${smallTextClass}`}>
                {path.split('/').pop() || '/'}
              </span>
            </div>
          </div>
        );
      }

      case 'DELAY': {
        const delayDuration = config.duration || 0;
        const unit = config.unit || 's';
        return (
          <div className={`flex items-center gap-1 mt-1 text-gray-600 ${smallTextClass}`}>
            <Clock className="w-2 h-2" />
            <span>{delayDuration}{unit}</span>
          </div>
        );
      }

      case 'CONDITIONAL': {
        const condition = config.condition || '';
        return (
          <div className={`flex items-center gap-1 mt-1 text-gray-600 ${smallTextClass}`}>
            <GitBranch className="w-2 h-2" />
            <span className="truncate italic">"{condition}"</span>
          </div>
        );
      }

      case 'START': {
        const trigger = config.triggerType || 'Manual';
        return (
          <div className={`flex items-center gap-1 mt-1 text-gray-600 ${smallTextClass}`}>
            <Play className="w-2 h-2" />
            <span>{trigger}</span>
          </div>
        );
      }

      default:
        return null;
    }
  };

  return (
    <div className={`${paddingClass} ${compact ? 'space-y-0' : 'space-y-0.5'}`}>
      <div className={`font-semibold text-gray-900 ${textSizeClass} truncate`}>
        {name}
      </div>

      {renderPreview()}

      {isAuthoringMode && !isConfigured && (
        <div className={`${smallTextClass} text-orange-600 bg-orange-50 px-1 py-0.5 rounded flex items-center gap-0.5 mt-1`}>
          <AlertCircle className="w-2 h-2 flex-shrink-0" />
          <span className="truncate">Needs Config</span>
        </div>
      )}

      {duration && (
        <div className={`${smallTextClass} text-gray-500 mt-0.5`}>
          {formatDuration(duration)}
        </div>
      )}

      {error && (
        <div className={`${smallTextClass} text-red-600 bg-red-50 px-1 py-0.5 rounded truncate mt-1`}>
          {error}
        </div>
      )}

      {status === 'RUNNING' && (
        <div className={`${smallTextClass} text-blue-600 bg-blue-50 px-1 py-0.5 rounded flex items-center gap-0.5 mt-1`}>
          <Loader2 className="w-2 h-2 animate-spin flex-shrink-0" />
          <span>Running...</span>
        </div>
      )}
    </div>
  );
};

export default NodeBody;
