

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiManagementService, secretStoreService } from '../services/api-management';
import type { 
  ApiConfig, 
  SecretStoreConfig, 
  ApiTestRequest,
  ApiTestResult,
  SecretStoreTestResult,
  ApiUsageStats
} from '../types/api';

/**
 * Query keys for React Query cache management
 */
export const apiQueryKeys = {
  all: ['apis'] as const,
  lists: () => [...apiQueryKeys.all, 'list'] as const,
  list: (filters: any) => [...apiQueryKeys.lists(), { filters }] as const,
  details: () => [...apiQueryKeys.all, 'detail'] as const,
  detail: (id: string) => [...apiQueryKeys.details(), id] as const,
  stats: (id: string) => [...apiQueryKeys.detail(id), 'stats'] as const,
  search: (query: string, tags?: string[]) => [...apiQueryKeys.all, 'search', { query, tags }] as const,
};

export const secretStoreQueryKeys = {
  all: ['secret-stores'] as const,
  lists: () => [...secretStoreQueryKeys.all, 'list'] as const,
  list: (filters: any) => [...secretStoreQueryKeys.lists(), { filters }] as const,
  details: () => [...secretStoreQueryKeys.all, 'detail'] as const,
  detail: (id: string) => [...secretStoreQueryKeys.details(), id] as const,
  secrets: (id: string, path?: string) => [...secretStoreQueryKeys.detail(id), 'secrets', { path }] as const,
};

/**
 * Hook for fetching all APIs
 */
export const useApis = () => {
  return useQuery({
    queryKey: apiQueryKeys.lists(),
    queryFn: () => apiManagementService.getApis(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

/**
 * Hook for fetching a single API
 */
export const useApi = (id: string) => {
  return useQuery({
    queryKey: apiQueryKeys.detail(id),
    queryFn: () => apiManagementService.getApi(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });
};

/**
 * Hook for API usage statistics
 */
export const useApiStats = (id: string) => {
  return useQuery({
    queryKey: apiQueryKeys.stats(id),
    queryFn: () => apiManagementService.getApiUsageStats(id),
    enabled: !!id,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

/**
 * Hook for searching APIs
 */
export const useApiSearch = (query: string, tags?: string[]) => {
  return useQuery({
    queryKey: apiQueryKeys.search(query, tags),
    queryFn: () => apiManagementService.searchApis(query, tags),
    enabled: !!query.trim(),
    staleTime: 30 * 1000, // 30 seconds
  });
};

/**
 * Hook for creating an API
 */
export const useCreateApi = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (api: Omit<ApiConfig, 'id' | 'createdAt' | 'updatedAt' | 'createdBy'>) =>
      apiManagementService.createApi(api),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: apiQueryKeys.lists() });
    },
  });
};

/**
 * Hook for updating an API
 */
export const useUpdateApi = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, api }: { id: string; api: Partial<ApiConfig> }) =>
      apiManagementService.updateApi(id, api),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: apiQueryKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: apiQueryKeys.lists() });
    },
  });
};

/**
 * Hook for deleting an API
 */
export const useDeleteApi = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => apiManagementService.deleteApi(id),
    onSuccess: (_, id) => {
      queryClient.removeQueries({ queryKey: apiQueryKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: apiQueryKeys.lists() });
    },
  });
};

/**
 * Hook for testing an API
 */
export const useTestApi = () => {
  return useMutation({
    mutationFn: (request: ApiTestRequest) => apiManagementService.testApi(request),
  });
};

/**
 * Hook for duplicating an API
 */
export const useDuplicateApi = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, newName }: { id: string; newName: string }) =>
      apiManagementService.duplicateApi(id, newName),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: apiQueryKeys.lists() });
    },
  });
};

/**
 * Hook for exporting an API
 */
export const useExportApi = () => {
  return useMutation({
    mutationFn: ({ id, format }: { id: string; format?: 'json' | 'openapi' | 'postman' }) =>
      apiManagementService.exportApi(id, format),
  });
};

/**
 * Hook for importing an API
 */
export const useImportApi = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ data, format }: { data: any; format?: 'json' | 'openapi' | 'postman' }) =>
      apiManagementService.importApi(data, format),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: apiQueryKeys.lists() });
    },
  });
};

// Secret Store Hooks

/**
 * Hook for fetching all secret stores
 */
export const useSecretStores = () => {
  return useQuery({
    queryKey: secretStoreQueryKeys.lists(),
    queryFn: () => secretStoreService.getSecretStores(),
    staleTime: 5 * 60 * 1000,
  });
};

/**
 * Hook for fetching a single secret store
 */
export const useSecretStore = (id: string) => {
  return useQuery({
    queryKey: secretStoreQueryKeys.detail(id),
    queryFn: () => secretStoreService.getSecretStore(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });
};

/**
 * Hook for listing secrets in a store
 */
export const useSecretsList = (id: string, path?: string) => {
  return useQuery({
    queryKey: secretStoreQueryKeys.secrets(id, path),
    queryFn: () => secretStoreService.listSecrets(id, path),
    enabled: !!id,
    staleTime: 2 * 60 * 1000,
  });
};

/**
 * Hook for creating a secret store
 */
export const useCreateSecretStore = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (store: Omit<SecretStoreConfig, 'id' | 'createdAt' | 'updatedAt' | 'createdBy'>) =>
      secretStoreService.createSecretStore(store),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: secretStoreQueryKeys.lists() });
    },
  });
};

/**
 * Hook for updating a secret store
 */
export const useUpdateSecretStore = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, store }: { id: string; store: Partial<SecretStoreConfig> }) =>
      secretStoreService.updateSecretStore(id, store),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: secretStoreQueryKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: secretStoreQueryKeys.lists() });
    },
  });
};

/**
 * Hook for deleting a secret store
 */
export const useDeleteSecretStore = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => secretStoreService.deleteSecretStore(id),
    onSuccess: (_, id) => {
      queryClient.removeQueries({ queryKey: secretStoreQueryKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: secretStoreQueryKeys.lists() });
    },
  });
};

/**
 * Hook for testing a secret store connection
 */
export const useTestSecretStore = () => {
  return useMutation({
    mutationFn: (id: string) => secretStoreService.testSecretStore(id),
  });
};

/**
 * Hook for validating a secret path
 */
export const useValidateSecretPath = () => {
  return useMutation({
    mutationFn: ({ id, path, key }: { id: string; path: string; key?: string }) =>
      secretStoreService.validateSecretPath(id, path, key),
  });
};

/**
 * Combined hook for API management operations
 */
export const useApiManagement = () => {
  const apis = useApis();
  const createApi = useCreateApi();
  const updateApi = useUpdateApi();
  const deleteApi = useDeleteApi();
  const testApi = useTestApi();
  const duplicateApi = useDuplicateApi();
  const exportApi = useExportApi();
  const importApi = useImportApi();

  return {
    // Queries
    apis,
    
    // Mutations
    createApi,
    updateApi,
    deleteApi,
    testApi,
    duplicateApi,
    exportApi,
    importApi,
    
    // Computed states
    isLoading: apis.isLoading,
    isError: apis.isError,
    error: apis.error,
    
    // Helper functions
    refetchApis: apis.refetch,
  };
};

/**
 * Combined hook for secret store management operations
 */
export const useSecretStoreManagement = () => {
  const secretStores = useSecretStores();
  const createSecretStore = useCreateSecretStore();
  const updateSecretStore = useUpdateSecretStore();
  const deleteSecretStore = useDeleteSecretStore();
  const testSecretStore = useTestSecretStore();
  const validateSecretPath = useValidateSecretPath();

  return {
    // Queries
    secretStores,
    
    // Mutations
    createSecretStore,
    updateSecretStore,
    deleteSecretStore,
    testSecretStore,
    validateSecretPath,
    
    // Computed states
    isLoading: secretStores.isLoading,
    isError: secretStores.isError,
    error: secretStores.error,
    
    // Helper functions
    refetchSecretStores: secretStores.refetch,
  };
};
