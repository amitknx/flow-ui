import type {
  Secret,
  SecretCreateRequest,
  SecretUpdateRequest,
  SecretSearchParams,
} from '../types/secret';
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

export class SecretApi {
  constructor(private client: ApiClient = new ApiClient()) {}

  async createSecret(request: SecretCreateRequest): Promise<Secret> {
    return this.client.post<Secret>('/api/v1/secrets', request);
  }

  async getSecrets(params?: SecretSearchParams): Promise<PaginatedResponse<Secret>> {
    const queryParams = new URLSearchParams();

    if (params?.query) queryParams.append('query', params.query);
    if (params?.tags?.length) {
      params.tags.forEach(tag => queryParams.append('tags', tag));
    }
    if (params?.page !== undefined) queryParams.append('page', params.page.toString());
    if (params?.size !== undefined) queryParams.append('size', params.size.toString());

    const queryString = queryParams.toString();
    const endpoint = queryString ? `/api/v1/secrets?${queryString}` : '/api/v1/secrets';

    return this.client.get<PaginatedResponse<Secret>>(endpoint);
  }

  async getSecret(id: string): Promise<Secret> {
    return this.client.get<Secret>(`/api/v1/secrets/${id}`);
  }

  async getSecretByName(name: string): Promise<Secret> {
    return this.client.get<Secret>(`/api/v1/secrets/name/${name}`);
  }

  async updateSecret(id: string, request: SecretUpdateRequest): Promise<Secret> {
    return this.client.put<Secret>(`/api/v1/secrets/${id}`, request);
  }

  async deleteSecret(id: string): Promise<void> {
    return this.client.delete<void>(`/api/v1/secrets/${id}`);
  }
}

export const secretApi = new SecretApi();
export { ApiError };
