export type WorkflowStatus = 'PENDING' | 'RUNNING' | 'SUCCESS' | 'FAILED';
export type TriggerType = 'MANUAL' | 'API' | 'INGESTED';
export type NodePhase = 'START' | 'UPDATE' | 'COMPLETE' | 'FAIL';

export type NodeType =
  | 'START'
  | 'END'
  | 'HTTP_REQUEST'
  | 'DELAY'
  | 'CONDITIONAL'
  | 'JOIN'
  | 'SUB_WORKFLOW';

export interface WorkflowDefinition {
  id: string;
  name: string;
  description?: string;
  tags?: string[];
  globals?: Record<string, any>;
  inputs?: {
    schema?: any;
    defaults?: Record<string, any>;
    example?: Record<string, any>;
  };
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
  createdAt: string;
  createdBy: string;
}

export interface WorkflowNode {
  id: string;
  name: string;
  type: NodeType;
  position: { x: number; y: number };
  data?: Record<string, any>;
  config?: {
    timeout?: number;
    retries?: number;
    [key: string]: any;
  };
}

export interface WorkflowEdge {
  id: string;
  source: string;
  target: string;
  sourcePort?: string;
  targetPort?: string;
  sourceHandle?: string;
  targetHandle?: string;
  condition?: string;
  label?: string;
}

export interface WorkflowExecution {
  id: string;
  workflowId: string;
  correlationId: string;
  status: WorkflowStatus;
  triggerType: TriggerType;
  triggerInput?: Record<string, any>;
  definitionSnapshot: WorkflowDefinition;
  startedAt: string;
  endedAt?: string;
  duration?: number;
  stepExecutions?: StepExecution[];
}

export interface StepExecution {
  id: string;
  workflowExecutionId: string;
  nodeIdRef: string;
  status: WorkflowStatus;
  inputPayload?: Record<string, any>;
  outputPayload?: Record<string, any>;
  error?: string;
  startedAt: string;
  endedAt?: string;
  durationMs?: number;
}

export interface ExecutionSnapshot {
  executionId: string;
  workflowId: string;
  correlationId: string;
  builtFrom: 'INGESTED' | 'ENGINE';
  triggerInput?: Record<string, any>;
  nodes: ExecutionNode[];
  edges: ExecutionEdge[];
  summary: {
    status: WorkflowStatus;
    startedAt: string;
    endedAt?: string;
    duration?: number;
  };
}

export interface ExecutionNode extends WorkflowNode {
  status: WorkflowStatus;
  timings?: {
    startedAt?: string;
    endedAt?: string;
    duration?: number;
  };
  input?: Record<string, any>;
  output?: Record<string, any>;
  error?: string;
}

export interface ExecutionEdge extends WorkflowEdge {
  reason?: string;
  traversed?: boolean;
  traversedAt?: string;
}

export interface IngestionEvent {
  workflowId: string;
  correlationId: string;
  triggerInput?: Record<string, any>;
  occurredAt: string;
  step: {
    id: string;
    name: string;
    type?: NodeType;
    parents?: string[];
    phase: NodePhase;
  };
  input?: Record<string, any>;
  output?: Record<string, any>;
  error?: string;
  meta?: {
    sequence?: number;
    idempotencyKey?: string;
    attributes?: Record<string, any>;
  };
}

export interface ExecutionCreateRequest {
  workflowId: string;
  triggerType: TriggerType;
  triggerInput?: Record<string, any>;
  correlationId?: string;
}

export interface ExecutionStatusResponse {
  id: string;
  status: WorkflowStatus;
  startedAt: string;
  endedAt?: string;
  duration?: number;
}

export interface PaginatedResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
  first: boolean;
  last: boolean;
  empty: boolean;
}

export interface ExecutionFilters {
  workflowId?: string;
  status?: WorkflowStatus;
  page?: number;
  size?: number;
}
