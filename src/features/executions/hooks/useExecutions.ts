import { useQuery } from '@tanstack/react-query';
import { executionApi } from '../../../services/api';
import type { ExecutionFilters, PaginatedResponse, WorkflowExecution } from '../../../types/workflow';

export const useExecutions = (filters?: ExecutionFilters) => {
  return useQuery<PaginatedResponse<WorkflowExecution>>({
    queryKey: ['executions', filters],
    queryFn: () => executionApi.getAllExecutions(filters),
    staleTime: 30000,
  });
};

export const useExecutionsByWorkflow = (
  workflowId: string,
  params?: { page?: number; size?: number }
) => {
  return useQuery<PaginatedResponse<WorkflowExecution>>({
    queryKey: ['executions', 'workflow', workflowId, params],
    queryFn: () => executionApi.getExecutionsByWorkflow(workflowId, params),
    enabled: !!workflowId,
    staleTime: 30000,
  });
};

export const useExecution = (id: string | undefined) => {
  return useQuery({
    queryKey: ['execution', id],
    queryFn: () => (id ? executionApi.getExecution(id) : null),
    enabled: !!id,
    refetchInterval: (query) => {
      return query.state.data?.status === 'RUNNING' ? 5000 : false;
    },
  });
};

export const useExecutionStatus = (id: string | undefined) => {
  return useQuery({
    queryKey: ['execution-status', id],
    queryFn: () => (id ? executionApi.getExecutionStatus(id) : null),
    enabled: !!id,
    refetchInterval: (query) => {
      return query.state.data?.status === 'RUNNING' ? 3000 : false;
    },
  });
};

export const useExecutionSnapshot = (id: string | undefined) => {
  return useQuery({
    queryKey: ['execution-snapshot', id],
    queryFn: () => (id ? executionApi.getExecutionSnapshot(id) : null),
    enabled: !!id,
    refetchInterval: (query) => {
      return query.state.data?.summary.status === 'RUNNING' ? 3000 : false;
    },
  });
};
