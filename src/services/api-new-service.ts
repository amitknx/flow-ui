import type {
  Api,
  ApiWithEndpoints,
  ApiCreateRequest,
  ApiUpdateRequest,
  ApiEndpoint,
  EndpointCreateRequest,
  EndpointUpdateRequest,
  ApiSearchParams,
  EndpointSearchParams,
} from '../types/api-new';
import type { PaginatedResponse } from '../types/workflow';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public response?: any
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

class ApiClient {
  private baseURL: string;

  constructor(baseURL: string = API_BASE_URL) {
    this.baseURL = baseURL;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;

    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new ApiError(
        errorData.message || `HTTP ${response.status}: ${response.statusText}`,
        response.status,
        errorData
      );
    }

    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      return {} as T;
    }

    const text = await response.text();
    if (!text || text.trim() === '') {
      return {} as T;
    }

    return JSON.parse(text);
  }

  async get<T>(endpoint: string, options?: RequestInit): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET', ...options });
  }

  async post<T>(endpoint: string, data?: any, options?: RequestInit): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
      ...options,
    });
  }

  async put<T>(endpoint: string, data?: any, options?: RequestInit): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
      ...options,
    });
  }

  async delete<T>(endpoint: string, options?: RequestInit): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE', ...options });
  }
}

/**
 * API Management Service (Tier 2)
 */
export class ApiManagementService {
  constructor(private client: ApiClient = new ApiClient()) {}

  // Create API with optional endpoints
  async createApi(request: ApiCreateRequest): Promise<ApiWithEndpoints> {
    return this.client.post<ApiWithEndpoints>('/api/v1/apis', request);
  }

  // List all APIs with search
  async getApis(params?: ApiSearchParams): Promise<PaginatedResponse<Api>> {
    const queryParams = new URLSearchParams();

    if (params?.query) queryParams.append('query', params.query);
    if (params?.secretId) queryParams.append('secretId', params.secretId);
    if (params?.tags) params.tags.forEach(tag => queryParams.append('tags', tag));
    if (params?.page !== undefined) queryParams.append('page', params.page.toString());
    if (params?.size !== undefined) queryParams.append('size', params.size.toString());

    const queryString = queryParams.toString();
    const endpoint = queryString ? `/api/v1/apis?${queryString}` : '/api/v1/apis';

    return this.client.get<PaginatedResponse<Api>>(endpoint);
  }

  // Get API by ID
  async getApi(id: string): Promise<ApiWithEndpoints> {
    return this.client.get<ApiWithEndpoints>(`/api/v1/apis/${id}`);
  }

  // Get API by name and version
  async getApiByNameAndVersion(name: string, version: string): Promise<ApiWithEndpoints> {
    return this.client.get<ApiWithEndpoints>(`/api/v1/apis/${encodeURIComponent(name)}/${encodeURIComponent(version)}`);
  }

  // Get APIs by secret
  async getApisBySecret(secretId: string): Promise<Api[]> {
    return this.client.get<Api[]>(`/api/v1/apis/secret/${secretId}`);
  }

  // Update API
  async updateApi(id: string, request: ApiUpdateRequest): Promise<Api> {
    return this.client.put<Api>(`/api/v1/apis/${id}`, request);
  }

  // Delete API (cascades to endpoints)
  async deleteApi(id: string): Promise<void> {
    return this.client.delete<void>(`/api/v1/apis/${id}`);
  }
}

/**
 * API Endpoint Service (Tier 3)
 */
export class ApiEndpointService {
  constructor(private client: ApiClient = new ApiClient()) {}

  // Create endpoint for an API
  async createEndpoint(apiId: string, request: EndpointCreateRequest): Promise<ApiEndpoint> {
    return this.client.post<ApiEndpoint>(`/api/v1/apis/${apiId}/endpoints`, request);
  }

  // List endpoints in an API
  async getEndpointsByApi(apiId: string): Promise<ApiEndpoint[]> {
    return this.client.get<ApiEndpoint[]>(`/api/v1/apis/${apiId}/endpoints`);
  }

  // Get endpoint by name within API
  async getEndpointByName(apiId: string, name: string): Promise<ApiEndpoint> {
    return this.client.get<ApiEndpoint>(
      `/api/v1/apis/${apiId}/endpoints/${encodeURIComponent(name)}`
    );
  }

  // Get endpoint by ID
  async getEndpoint(id: string): Promise<ApiEndpoint> {
    return this.client.get<ApiEndpoint>(`/api/v1/endpoints/${id}`);
  }

  // Search all endpoints
  async searchEndpoints(params?: EndpointSearchParams): Promise<PaginatedResponse<ApiEndpoint>> {
    const queryParams = new URLSearchParams();

    if (params?.query) queryParams.append('query', params.query);
    if (params?.apiId) queryParams.append('apiId', params.apiId);
    if (params?.httpMethod) queryParams.append('httpMethod', params.httpMethod);
    if (params?.page !== undefined) queryParams.append('page', params.page.toString());
    if (params?.size !== undefined) queryParams.append('size', params.size.toString());

    const queryString = queryParams.toString();
    const endpoint = queryString ? `/api/v1/endpoints?${queryString}` : '/api/v1/endpoints';

    return this.client.get<PaginatedResponse<ApiEndpoint>>(endpoint);
  }

  // Update endpoint
  async updateEndpoint(id: string, request: EndpointUpdateRequest): Promise<ApiEndpoint> {
    return this.client.put<ApiEndpoint>(`/api/v1/endpoints/${id}`, request);
  }

  // Delete endpoint
  async deleteEndpoint(id: string): Promise<void> {
    return this.client.delete<void>(`/api/v1/endpoints/${id}`);
  }
}

// Export singleton instances
export const apiManagementService = new ApiManagementService();
export const apiEndpointService = new ApiEndpointService();
export { ApiError };
