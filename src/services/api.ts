import { z } from 'zod';
import type { 
  WorkflowDefinition, 
  WorkflowExecution, 
  StepExecution, 
  IngestionEvent,
  ExecutionSnapshot 
} from '../types/workflow';

// API Configuration
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

// Generic API client
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

    return response.json();
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

// API Services
export class WorkflowApi {
  constructor(private client: ApiClient = new ApiClient()) {}

  // Authoring APIs
  async createWorkflow(workflow: Omit<WorkflowDefinition, 'id' | 'createdAt' | 'createdBy'>): Promise<WorkflowDefinition> {
    return this.client.post<WorkflowDefinition>('/api/v1/workflows', workflow);
  }

  async cloneWorkflow(id: string): Promise<WorkflowDefinition> {
    return this.client.post<WorkflowDefinition>(`/api/v1/workflows/${id}/clone`);
  }

  async getWorkflows(): Promise<WorkflowDefinition[]> {
    return this.client.get<WorkflowDefinition[]>('/api/v1/workflows');
  }

  async getWorkflow(id: string): Promise<WorkflowDefinition> {
    return this.client.get<WorkflowDefinition>(`/api/v1/workflows/${id}`);
  }

  async updateWorkflow(id: string, workflow: Partial<WorkflowDefinition>): Promise<WorkflowDefinition> {
    return this.client.put<WorkflowDefinition>(`/api/v1/workflows/${id}`, workflow);
  }

  async deleteWorkflow(id: string): Promise<void> {
    return this.client.delete<void>(`/api/v1/workflows/${id}`);
  }

  // Execution APIs
  async executeWorkflow(id: string, input?: Record<string, any>): Promise<{ executionId: string }> {
    return this.client.post<{ executionId: string }>(`/api/v1/workflows/${id}/execute`, { input });
  }

  async getExecution(id: string): Promise<WorkflowExecution> {
    return this.client.get<WorkflowExecution>(`/api/v1/executions/${id}`);
  }

  async getExecutionSteps(id: string): Promise<StepExecution[]> {
    return this.client.get<StepExecution[]>(`/api/v1/executions/${id}/steps`);
  }

  async getExecutionSnapshot(id: string): Promise<ExecutionSnapshot> {
    return this.client.get<ExecutionSnapshot>(`/api/v1/executions/${id}/snapshot`);
  }

  async getWorkflowExecutions(workflowId: string): Promise<WorkflowExecution[]> {
    return this.client.get<WorkflowExecution[]>(`/api/v1/workflows/${workflowId}/executions`);
  }
}

export class IngestionApi {
  constructor(private client: ApiClient = new ApiClient()) {}

  async sendEvent(event: IngestionEvent): Promise<void> {
    return this.client.post<void>('/api/v1/events', event);
  }

  async sendBulkEvents(events: IngestionEvent[]): Promise<void> {
    return this.client.post<void>('/api/v1/events/bulk', { events });
  }
}

// Export singleton instances
export const workflowApi = new WorkflowApi();
export const ingestionApi = new IngestionApi();
export { ApiError };
