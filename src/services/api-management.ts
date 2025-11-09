

import type { 
  ApiConfig, 
  SecretStoreConfig, 
  ApiTestRequest, 
  ApiTestResult,
  SecretStoreTestResult,
  ApiUsageStats
} from '../types/api';

/**
 * Base API client for making HTTP requests
 */
class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080') {
    this.baseUrl = baseUrl;
  }

  private async request<T>(
    endpoint: string, 
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
    }

    return response.json();
  }

  async get<T>(endpoint: string, headers?: Record<string, string>): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET', headers });
  }

  async post<T>(endpoint: string, data?: any, headers?: Record<string, string>): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
      headers,
    });
  }

  async put<T>(endpoint: string, data?: any, headers?: Record<string, string>): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
      headers,
    });
  }

  async patch<T>(endpoint: string, data?: any, headers?: Record<string, string>): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
      headers,
    });
  }

  async delete<T>(endpoint: string, headers?: Record<string, string>): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE', headers });
  }
}

/**
 * API Management Service
 * Handles CRUD operations for API configurations
 */
export class ApiManagementService {
  private client: ApiClient;

  constructor(baseUrl?: string) {
    this.client = new ApiClient(baseUrl);
  }

  /**
   * Get all API configurations
   */
  async getApis(): Promise<ApiConfig[]> {
    const response = await this.client.get<{ content: ApiConfig[] }>('/api/v1/apis');
    return response.content || [];
  }

  /**
   * Get API configuration by ID
   */
  async getApi(id: string): Promise<ApiConfig> {
    return this.client.get<ApiConfig>(`/api/v1/apis/${id}`);
  }

  /**
   * Create new API configuration
   */
  async createApi(api: Omit<ApiConfig, 'id' | 'createdAt' | 'updatedAt' | 'createdBy'>): Promise<ApiConfig> {
    return this.client.post<ApiConfig>('/api/v1/apis', api);
  }

  /**
   * Update API configuration
   */
  async updateApi(id: string, api: Partial<ApiConfig>): Promise<ApiConfig> {
    return this.client.put<ApiConfig>(`/api/v1/apis/${id}`, api);
  }

  /**
   * Delete API configuration
   */
  async deleteApi(id: string): Promise<void> {
    return this.client.delete<void>(`/api/v1/apis/${id}`);
  }

  /**
   * Test API connection
   */
  async testApi(request: ApiTestRequest): Promise<ApiTestResult> {
    return this.client.post<ApiTestResult>('/api/v1/apis/test', request);
  }

  /**
   * Get API usage statistics
   */
  async getApiUsageStats(id: string): Promise<ApiUsageStats> {
    return this.client.get<ApiUsageStats>(`/api/v1/apis/${id}/stats`);
  }

  /**
   * Search APIs by name or tag
   */
  async searchApis(query: string, tags?: string[]): Promise<ApiConfig[]> {
    const params = new URLSearchParams();
    params.append('q', query);
    if (tags?.length) {
      tags.forEach(tag => params.append('tags', tag));
    }
    return this.client.get<ApiConfig[]>(`/api/v1/apis/search?${params.toString()}`);
  }

  /**
   * Duplicate API configuration
   */
  async duplicateApi(id: string, newName: string): Promise<ApiConfig> {
    return this.client.post<ApiConfig>(`/api/v1/apis/${id}/duplicate`, { name: newName });
  }

  /**
   * Export API configuration
   */
  async exportApi(id: string, format: 'json' | 'openapi' | 'postman' = 'json'): Promise<any> {
    return this.client.get<any>(`/api/v1/apis/${id}/export?format=${format}`);
  }

  /**
   * Import API configuration
   */
  async importApi(data: any, format: 'json' | 'openapi' | 'postman' = 'json'): Promise<ApiConfig> {
    return this.client.post<ApiConfig>(`/api/v1/apis/import?format=${format}`, data);
  }
}

/**
 * Secret Store Service
 * Handles CRUD operations for secret store configurations
 */
export class SecretStoreService {
  private client: ApiClient;

  constructor(baseUrl?: string) {
    this.client = new ApiClient(baseUrl);
  }

  /**
   * Get all secret store configurations
   */
  async getSecretStores(): Promise<SecretStoreConfig[]> {
    return this.client.get<SecretStoreConfig[]>('/api/v1/secret-stores');
  }

  /**
   * Get secret store configuration by ID
   */
  async getSecretStore(id: string): Promise<SecretStoreConfig> {
    return this.client.get<SecretStoreConfig>(`/api/v1/secret-stores/${id}`);
  }

  /**
   * Create new secret store configuration
   */
  async createSecretStore(
    store: Omit<SecretStoreConfig, 'id' | 'createdAt' | 'updatedAt' | 'createdBy'>
  ): Promise<SecretStoreConfig> {
    return this.client.post<SecretStoreConfig>('/api/v1/secret-stores', store);
  }

  /**
   * Update secret store configuration
   */
  async updateSecretStore(id: string, store: Partial<SecretStoreConfig>): Promise<SecretStoreConfig> {
    return this.client.put<SecretStoreConfig>(`/api/v1/secret-stores/${id}`, store);
  }

  /**
   * Delete secret store configuration
   */
  async deleteSecretStore(id: string): Promise<void> {
    return this.client.delete<void>(`/api/v1/secret-stores/${id}`);
  }

  /**
   * Test secret store connection
   */
  async testSecretStore(id: string): Promise<SecretStoreTestResult> {
    return this.client.post<SecretStoreTestResult>(`/api/v1/secret-stores/${id}/test`);
  }

  /**
   * List secrets in a secret store
   */
  async listSecrets(id: string, path?: string): Promise<string[]> {
    const params = path ? `?path=${encodeURIComponent(path)}` : '';
    return this.client.get<string[]>(`/api/v1/secret-stores/${id}/secrets${params}`);
  }

  /**
   * Get secret value (for testing/validation only)
   */
  async getSecretValue(id: string, path: string, key?: string): Promise<any> {
    const params = key ? `?key=${encodeURIComponent(key)}` : '';
    return this.client.get<any>(`/api/v1/secret-stores/${id}/secrets/${encodeURIComponent(path)}${params}`);
  }

  /**
   * Validate secret path exists
   */
  async validateSecretPath(id: string, path: string, key?: string): Promise<boolean> {
    try {
      const params = key ? `?key=${encodeURIComponent(key)}` : '';
      await this.client.get(`/api/v1/secret-stores/${id}/secrets/${encodeURIComponent(path)}/validate${params}`);
      return true;
    } catch {
      return false;
    }
  }
}

/**
 * Singleton instances for global use
 */
export const apiManagementService = new ApiManagementService();
export const secretStoreService = new SecretStoreService();
