import { useMutation, useQueryClient } from '@tanstack/react-query';
import { executionApi } from '../../../services/api';

export const useCancelExecution = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (executionId: string) => executionApi.cancelExecution(executionId),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['execution', data.id] });
      queryClient.invalidateQueries({ queryKey: ['execution-status', data.id] });
      queryClient.invalidateQueries({ queryKey: ['execution-snapshot', data.id] });
      queryClient.invalidateQueries({ queryKey: ['executions'] });
      queryClient.invalidateQueries({ queryKey: ['executions', 'workflow', data.workflowId] });
    },
  });
};
