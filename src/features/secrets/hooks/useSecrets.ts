import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { secretApi } from '../../../services/secret-api';
import type {
  SecretCreateRequest,
  SecretUpdateRequest,
  SecretSearchParams,
} from '../../../types/secret';

/**
 * Hook for fetching secrets list
 */
export const useSecrets = (params?: SecretSearchParams) => {
  return useQuery({
    queryKey: ['secrets', params],
    queryFn: () => secretApi.getSecrets(params),
    staleTime: 30000,
  });
};

/**
 * Hook for fetching single secret
 */
export const useSecret = (id: string | undefined) => {
  return useQuery({
    queryKey: ['secret', id],
    queryFn: () => (id ? secretApi.getSecret(id) : null),
    enabled: !!id,
  });
};

/**
 * Hook for fetching secret by name
 */
export const useSecretByName = (name: string | undefined) => {
  return useQuery({
    queryKey: ['secret', 'name', name],
    queryFn: () => (name ? secretApi.getSecretByName(name) : null),
    enabled: !!name,
  });
};

/**
 * Hook for creating secret
 */
export const useCreateSecret = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: SecretCreateRequest) => secretApi.createSecret(request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['secrets'] });
    },
  });
};

/**
 * Hook for updating secret
 */
export const useUpdateSecret = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, request }: { id: string; request: SecretUpdateRequest }) =>
      secretApi.updateSecret(id, request),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['secrets'] });
      queryClient.invalidateQueries({ queryKey: ['secret', data.id] });
    },
  });
};

/**
 * Hook for deleting secret
 */
export const useDeleteSecret = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => secretApi.deleteSecret(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['secrets'] });
    },
  });
};
