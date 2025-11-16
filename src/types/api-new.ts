// Three-Tier API Structure matching backend

export type HttpMethod =
  | 'GET'
  | 'POST'
  | 'PUT'
  | 'PATCH'
  | 'DELETE'
  | 'HEAD'
  | 'OPTIONS';

/**
 * Parameter definition for API endpoints
 */
export interface ParameterDefinition {
  type?: 'string' | 'integer' | 'boolean' | 'number' | 'array' | 'object';
  required?: boolean;
  default?: any;
  description?: string;
  example?: any;
}

/**
 * API Endpoint (Tier 3)
 * Individual endpoints within an API
 */
export interface ApiEndpoint {
  id: string;
  apiId?: string;
  versionNum?: number; // Backend version number for optimistic locking
  name: string;
  httpMethod: HttpMethod;
  endpointPath: string;
  description?: string;

  // Parameters
  pathParams?: Record<string, ParameterDefinition>;
  queryParams?: Record<string, ParameterDefinition>;
  headers?: Record<string, ParameterDefinition> | Record<string, string>; // Can be string values

  // Request/Response
  requestBodyTemplate?: any;
  responseMapping?: Record<string, string>; // JSONPath mappings
  contentType?: string;

  // Configuration
  timeoutMs?: number;
  retryConfig?: {
    maxRetries: number;
    backoffStrategy?: 'linear' | 'exponential';
    retryDelayMs?: number;
    backoffMs?: number; // Backend uses this
    exponentialBackoff?: boolean; // Backend uses this
    retryableStatuses?: number[];
  };

  // Metadata
  createdAt?: string;
  updatedAt?: string;
}

/**
 * API Configuration (Tier 2)
 * Top-level API configuration
 */
export interface Api {
  id: string;
  name: string;
  version?: string;
  versionNum?: number; // Backend version number for optimistic locking
  baseUrl: string;
  description?: string;

  // References secret from Tier 1
  secretId?: string;
  authentication?: any; // Backend may return null

  // Categorization
  tags: string[];

  // Configuration
  timeoutMs?: number;
  retryConfig?: any;
  rateLimiting?: {
    requestsPerSecond?: number;
    burstSize?: number;
  };
  circuitBreaker?: {
    enabled: boolean;
    failureThreshold?: number;
    recoveryTimeout?: number;
  };

  // Summary data
  endpointCount?: number; // Number of endpoints (from list view)
  endpoints?: ApiEndpoint[]; // Full endpoints data (from detail view)

  // Metadata
  createdAt: string;
  updatedAt?: string; // May be modifiedAt in backend
  modifiedAt?: string;
  createdBy?: string;
  modifiedBy?: string;
  active?: boolean; // Backend uses 'active' instead of 'isActive'
  isActive?: boolean; // For compatibility
}

/**
 * API with embedded endpoints (for creation/display)
 */
export interface ApiWithEndpoints extends Api {
  endpoints?: ApiEndpoint[];
}

/**
 * Create API Request
 */
export interface ApiCreateRequest {
  name: string;
  version?: string;
  baseUrl: string;
  description?: string;
  secretId?: string;
  tags?: string[];
  endpoints?: Omit<ApiEndpoint, 'id' | 'apiId' | 'createdAt' | 'updatedAt'>[];
}

/**
 * Update API Request
 */
export interface ApiUpdateRequest {
  name?: string;
  version?: string;
  baseUrl?: string;
  description?: string;
  secretId?: string;
  tags?: string[];
}

/**
 * Create Endpoint Request
 */
export interface EndpointCreateRequest {
  name: string;
  httpMethod: HttpMethod;
  endpointPath: string;
  description?: string;
  pathParams?: Record<string, ParameterDefinition>;
  queryParams?: Record<string, ParameterDefinition>;
  headers?: Record<string, ParameterDefinition>;
  requestBodyTemplate?: any;
  responseMapping?: Record<string, string>;
  contentType?: string;
  timeoutMs?: number;
  retryConfig?: {
    maxRetries: number;
    backoffStrategy?: 'linear' | 'exponential';
    retryDelayMs?: number;
  };
}

/**
 * Update Endpoint Request
 */
export interface EndpointUpdateRequest {
  name?: string;
  httpMethod?: HttpMethod;
  endpointPath?: string;
  description?: string;
  pathParams?: Record<string, ParameterDefinition>;
  queryParams?: Record<string, ParameterDefinition>;
  headers?: Record<string, ParameterDefinition>;
  requestBodyTemplate?: any;
  responseMapping?: Record<string, string>;
  contentType?: string;
  timeoutMs?: number;
  retryConfig?: {
    maxRetries?: number;
    backoffStrategy?: 'linear' | 'exponential';
    retryDelayMs?: number;
  };
}

/**
 * API Search Parameters
 */
export interface ApiSearchParams {
  query?: string;
  secretId?: string;
  tags?: string[];
  page?: number;
  size?: number;
}

/**
 * Endpoint Search Parameters
 */
export interface EndpointSearchParams {
  query?: string;
  apiId?: string;
  httpMethod?: HttpMethod;
  page?: number;
  size?: number;
}
