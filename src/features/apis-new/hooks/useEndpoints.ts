import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiEndpointService } from '../../../services/api-new-service';
import type {
  EndpointCreateRequest,
  EndpointUpdateRequest,
  EndpointSearchParams,
} from '../../../types/api-new';

/**
 * Hook for fetching endpoints by API
 */
export const useEndpointsByApi = (apiId: string | undefined) => {
  return useQuery({
    queryKey: ['endpoints', 'api', apiId],
    queryFn: () => (apiId ? apiEndpointService.getEndpointsByApi(apiId) : []),
    enabled: !!apiId,
  });
};

/**
 * Hook for fetching single endpoint
 */
export const useEndpoint = (id: string | undefined) => {
  return useQuery({
    queryKey: ['endpoint', id],
    queryFn: () => (id ? apiEndpointService.getEndpoint(id) : null),
    enabled: !!id,
  });
};

/**
 * Hook for fetching endpoint by name
 */
export const useEndpointByName = (apiId: string | undefined, name: string | undefined) => {
  return useQuery({
    queryKey: ['endpoint', 'api', apiId, 'name', name],
    queryFn: () =>
      apiId && name ? apiEndpointService.getEndpointByName(apiId, name) : null,
    enabled: !!apiId && !!name,
  });
};

/**
 * Hook for searching endpoints
 */
export const useSearchEndpoints = (params?: EndpointSearchParams) => {
  return useQuery({
    queryKey: ['endpoints', 'search', params],
    queryFn: () => apiEndpointService.searchEndpoints(params),
    enabled: !!params,
  });
};

/**
 * Hook for creating endpoint
 */
export const useCreateEndpoint = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ apiId, request }: { apiId: string; request: EndpointCreateRequest }) =>
      apiEndpointService.createEndpoint(apiId, request),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['endpoints', 'api', data.apiId] });
      queryClient.invalidateQueries({ queryKey: ['api', data.apiId] });
    },
  });
};

/**
 * Hook for updating endpoint
 */
export const useUpdateEndpoint = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, request }: { id: string; request: EndpointUpdateRequest }) =>
      apiEndpointService.updateEndpoint(id, request),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['endpoint', data.id] });
      queryClient.invalidateQueries({ queryKey: ['endpoints', 'api', data.apiId] });
      queryClient.invalidateQueries({ queryKey: ['api', data.apiId] });
    },
  });
};

/**
 * Hook for deleting endpoint
 */
export const useDeleteEndpoint = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, apiId }: { id: string; apiId: string }) =>
      apiEndpointService.deleteEndpoint(id).then(() => apiId),
    onSuccess: (apiId) => {
      queryClient.invalidateQueries({ queryKey: ['endpoints', 'api', apiId] });
      queryClient.invalidateQueries({ queryKey: ['api', apiId] });
    },
  });
};
