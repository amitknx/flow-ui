import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiManagementService } from '../../../services/api-new-service';
import type {
  ApiCreateRequest,
  ApiUpdateRequest,
  ApiSearchParams,
} from '../../../types/api-new';

/**
 * Hook for fetching APIs list
 */
export const useApis = (params?: ApiSearchParams) => {
  return useQuery({
    queryKey: ['apis', params],
    queryFn: () => apiManagementService.getApis(params),
    staleTime: 30000,
  });
};

/**
 * Hook for fetching single API
 */
export const useApi = (id: string | undefined) => {
  return useQuery({
    queryKey: ['api', id],
    queryFn: () => (id ? apiManagementService.getApi(id) : null),
    enabled: !!id,
  });
};

/**
 * Hook for fetching API by name and version
 */
export const useApiByNameVersion = (name: string | undefined, version: string | undefined) => {
  return useQuery({
    queryKey: ['api', 'name', name, version],
    queryFn: () =>
      name && version ? apiManagementService.getApiByNameAndVersion(name, version) : null,
    enabled: !!name && !!version,
  });
};

/**
 * Hook for fetching APIs by secret
 */
export const useApisBySecret = (secretId: string | undefined) => {
  return useQuery({
    queryKey: ['apis', 'secret', secretId],
    queryFn: () => (secretId ? apiManagementService.getApisBySecret(secretId) : []),
    enabled: !!secretId,
  });
};

/**
 * Hook for creating API
 */
export const useCreateApi = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: ApiCreateRequest) => apiManagementService.createApi(request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['apis'] });
    },
  });
};

/**
 * Hook for updating API
 */
export const useUpdateApi = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, request }: { id: string; request: ApiUpdateRequest }) =>
      apiManagementService.updateApi(id, request),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['apis'] });
      queryClient.invalidateQueries({ queryKey: ['api', data.id] });
    },
  });
};

/**
 * Hook for deleting API
 */
export const useDeleteApi = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => apiManagementService.deleteApi(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['apis'] });
    },
  });
};
