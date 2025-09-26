import type { NodeType, WorkflowStatus } from './workflow';

export interface BaseNodeData {
  name: string;
  type: NodeType;
  description?: string;
  config?: Record<string, any>;
}

export interface ExecutionNodeData extends BaseNodeData {
  status?: WorkflowStatus;
  duration?: number;
  error?: string;
  input?: Record<string, any>;
  output?: Record<string, any>;
  timings?: {
    startedAt?: string;
    endedAt?: string;
    duration?: number;
  };
}

export interface AuthoringNodeData extends BaseNodeData {
  isConfigured?: boolean;
  validationErrors?: string[];
}

export interface NodeActionHandler {
  onConfigure?: (nodeId: string) => void;
  onDuplicate?: (nodeId: string) => void;
  onDelete?: (nodeId: string) => void;
}

export interface NodeProps<T extends BaseNodeData = BaseNodeData> {
  id: string;
  data: T & { mode?: 'authoring' | 'execution' };
  selected?: boolean;
  actionHandler?: NodeActionHandler;
}

export type NodeAction = 'configure' | 'duplicate' | 'delete';

export interface NodeSize {
  width: number;
  height: number;
  compact?: boolean;
}

export const NODE_SIZES: Record<'default' | 'compact' | 'large', NodeSize> = {
  compact: { width: 90, height: 45, compact: true },
  default: { width: 110, height: 55 },
  large: { width: 140, height: 70 },
};
