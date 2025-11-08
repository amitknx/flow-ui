import { useMutation, useQueryClient } from '@tanstack/react-query';
import { executionApi } from '../../../services/api';
import type { ExecutionCreateRequest } from '../../../types/workflow';

export const useExecuteWorkflow = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: ExecutionCreateRequest) => executionApi.createExecution(request),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['executions'] });
      queryClient.invalidateQueries({ queryKey: ['executions', 'workflow', data.workflowId] });
    },
  });
};
