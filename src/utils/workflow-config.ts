import { 
  Play, 
  Square, 
  Globe, 
  Clock, 
  GitBranch, 
  Merge, 
  Workflow,
  AlertCircle,
  CheckCircle,
  Loader2,
  Pause,
  XCircle
} from 'lucide-react';
import type { NodeType, WorkflowStatus } from '../types/workflow';

export const nodeTypeConfig = {
  START: { 
    icon: Play, 
    color: 'node-start',
    bgColor: 'bg-green-500',
    textColor: 'text-white',
    label: 'Start',
    description: 'Workflow entry point'
  },
  END: { 
    icon: Square, 
    color: 'node-end',
    bgColor: 'bg-gray-500',
    textColor: 'text-white',
    label: 'End',
    description: 'Workflow completion'
  },
  HTTP_REQUEST: { 
    icon: Globe, 
    color: 'node-http',
    bgColor: 'bg-blue-500',
    textColor: 'text-white',
    label: 'HTTP Request',
    description: 'Make HTTP API call'
  },
  DELAY: { 
    icon: Clock, 
    color: 'node-delay',
    bgColor: 'bg-yellow-500',
    textColor: 'text-white',
    label: 'Delay',
    description: 'Wait for specified time'
  },
  CONDITIONAL: { 
    icon: GitBranch, 
    color: 'node-conditional',
    bgColor: 'bg-purple-500',
    textColor: 'text-white',
    label: 'Conditional',
    description: 'Branch based on condition'
  },
  JOIN: { 
    icon: Merge, 
    color: 'node-join',
    bgColor: 'bg-cyan-500',
    textColor: 'text-white',
    label: 'Join',
    description: 'Wait for multiple branches'
  },
  SUB_WORKFLOW: { 
    icon: Workflow, 
    color: 'node-subworkflow',
    bgColor: 'bg-pink-500',
    textColor: 'text-white',
    label: 'Sub-Workflow',
    description: 'Execute nested workflow'
  },
} as const;

export const statusConfig = {
  PENDING: { 
    icon: Pause, 
    color: 'text-yellow-500', 
    bgColor: 'bg-yellow-50',
    borderColor: 'border-yellow-200',
    label: 'Pending',
    animate: false
  },
  RUNNING: { 
    icon: Loader2, 
    color: 'text-blue-500', 
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
    label: 'Running',
    animate: true
  },
  SUCCESS: { 
    icon: CheckCircle, 
    color: 'text-green-500', 
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200',
    label: 'Success',
    animate: false
  },
  FAILED: { 
    icon: XCircle, 
    color: 'text-red-500', 
    bgColor: 'bg-red-50',
    borderColor: 'border-red-200',
    label: 'Failed',
    animate: false
  },
} as const;

export const getStatusIconConfig = (status?: WorkflowStatus) => {
  if (!status) {
    return {
      icon: AlertCircle,
      className: 'w-4 h-4 text-gray-500',
      animate: false
    };
  }
  
  const config = statusConfig[status];
  return {
    icon: config.icon,
    className: `w-4 h-4 ${config.color}`,
    animate: config.animate || false
  };
};

export const getNodeDescription = (type: NodeType): string => {
  return nodeTypeConfig[type]?.description || 'Workflow node';
};

export const getNodeColor = (type: NodeType, status?: WorkflowStatus): string => {
  if (status) {
    switch (status) {
      case 'SUCCESS': return '#10b981';
      case 'FAILED': return '#ef4444';
      case 'RUNNING': return '#3b82f6';
      case 'PENDING': return '#f59e0b';
      default: return '#94a3b8';
    }
  }
  
  switch (type) {
    case 'START': return '#10b981';
    case 'END': return '#6b7280';
    case 'HTTP_REQUEST': return '#3b82f6';
    case 'DELAY': return '#f59e0b';
    case 'CONDITIONAL': return '#8b5cf6';
    case 'JOIN': return '#06b6d4';
    case 'SUB_WORKFLOW': return '#ec4899';
    default: return '#94a3b8';
  }
};

export const getNodeConfigurationStatus = (type: NodeType, data?: Record<string, any>): boolean => {
  // Nodes that don't require configuration
  const noConfigRequired = ['START', 'END', 'JOIN'];
  if (noConfigRequired.includes(type)) {
    return true;
  }
  
  // Nodes that require specific configuration
  const hasData = data && Object.keys(data).length > 0;
  
  switch (type) {
    case 'HTTP_REQUEST':
      // HTTP requests need at least a URL
      return hasData && (data.url || data.endpoint);
    case 'DELAY':
      // Delay needs a duration
      return hasData && (data.duration || data.seconds || data.milliseconds);
    case 'CONDITIONAL':
      // Conditional needs a condition
      return hasData && (data.condition || data.expression);
    case 'SUB_WORKFLOW':
      // Sub-workflow needs a workflow reference
      return hasData && (data.workflowId || data.workflow);
    default:
      // For other types, any data is considered configured
      return hasData;
  }
};
