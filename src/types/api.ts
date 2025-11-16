

/**
 * API Authentication types (backend uses uppercase)
 */
export type AuthenticationType =
  | 'NONE'
  | 'BASIC'
  | 'BEARER'
  | 'API_KEY'
  | 'OAUTH2'
  | 'CUSTOM';

export type HttpMethod = 
  | 'GET' 
  | 'POST' 
  | 'PUT' 
  | 'PATCH' 
  | 'DELETE' 
  | 'HEAD' 
  | 'OPTIONS';

export type SecretStoreType = 
  | 'hashicorp_vault' 
  | 'aws_secrets_manager' 
  | 'azure_key_vault' 
  | 'gcp_secret_manager' 
  | 'kubernetes_secrets' 
  | 'environment_variables';

/**
 * Base secret store configuration
 */
export interface BaseSecretStoreConfig {
  id: string;
  name: string;
  type: SecretStoreType;
  description?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
}

/**
 * HashiCorp Vault configuration
 */
export interface VaultSecretStoreConfig extends BaseSecretStoreConfig {
  type: 'hashicorp_vault';
  config: {
    url: string;
    namespace?: string;
    authMethod: 'token' | 'userpass' | 'kubernetes' | 'aws' | 'gcp';
    mount: string;
    tokenPath?: string; // For token auth
    username?: string; // For userpass
    role?: string; // For kubernetes/cloud auth
    serviceAccountPath?: string; // For kubernetes
  };
}

/**
 * AWS Secrets Manager configuration
 */
export interface AwsSecretsManagerConfig extends BaseSecretStoreConfig {
  type: 'aws_secrets_manager';
  config: {
    region: string;
    accessKeyId?: string; // Optional if using IAM roles
    secretAccessKey?: string;
    roleArn?: string;
  };
}

/**
 * Azure Key Vault configuration
 */
export interface AzureKeyVaultConfig extends BaseSecretStoreConfig {
  type: 'azure_key_vault';
  config: {
    vaultUrl: string;
    tenantId: string;
    clientId: string;
    clientSecret?: string;
    certificatePath?: string;
  };
}

/**
 * GCP Secret Manager configuration
 */
export interface GcpSecretManagerConfig extends BaseSecretStoreConfig {
  type: 'gcp_secret_manager';
  config: {
    projectId: string;
    keyFilePath?: string;
    serviceAccountEmail?: string;
  };
}

/**
 * Environment Variables configuration
 */
export interface EnvironmentVariablesConfig extends BaseSecretStoreConfig {
  type: 'environment_variables';
  config: {
    prefix?: string; // Optional prefix for env vars
  };
}

/**
 * Union type for all secret store configurations
 */
export type SecretStoreConfig = 
  | VaultSecretStoreConfig 
  | AwsSecretsManagerConfig 
  | AzureKeyVaultConfig 
  | GcpSecretManagerConfig 
  | EnvironmentVariablesConfig;

/**
 * Secret reference for API configurations
 */
export interface SecretReference {
  secretStoreId: string;
  secretPath: string;
  secretKey?: string; // For nested secrets
  version?: string; // For versioned secrets
}

/**
 * Authentication configurations
 */
export interface NoAuthConfig {
  type: 'none';
}

export interface BasicAuthConfig {
  type: 'basic';
  username: string | SecretReference;
  password: string | SecretReference;
}

export interface BearerAuthConfig {
  type: 'bearer';
  token: string | SecretReference;
}

export interface ApiKeyAuthConfig {
  type: 'api_key';
  key: string | SecretReference;
  location: 'header' | 'query' | 'cookie';
  name: string; // Header/query parameter name
}

export interface OAuth2Config {
  type: 'oauth2';
  grantType: 'client_credentials' | 'authorization_code' | 'password';
  clientId: string | SecretReference;
  clientSecret: string | SecretReference;
  tokenUrl: string;
  scopes?: string[];
  username?: string | SecretReference; // For password grant
  password?: string | SecretReference; // For password grant
}

export interface CustomAuthConfig {
  type: 'custom';
  headers: Record<string, string | SecretReference>;
  queryParams?: Record<string, string | SecretReference>;
}

/**
 * Union type for all authentication configurations
 */
export type AuthenticationConfig = 
  | NoAuthConfig 
  | BasicAuthConfig 
  | BearerAuthConfig 
  | ApiKeyAuthConfig 
  | OAuth2Config 
  | CustomAuthConfig;

/**
 * HTTP header configuration
 */
export interface HttpHeader {
  name: string;
  value: string | SecretReference;
  required: boolean;
  description?: string;
}

/**
 * API endpoint configuration
 */
export interface ApiEndpoint {
  id?: string;
  name: string;
  description?: string;
  method: HttpMethod;
  path: string;
  headers: HttpHeader[];
  queryParams: Record<string, string | SecretReference>;
  requestBody?: {
    contentType: string;
    schema?: any; // JSON Schema for validation
    example?: any;
  };
  responseSchema?: any; // Expected response schema
  timeout?: number; // Request timeout in milliseconds
  retryConfig?: {
    maxRetries: number;
    backoffStrategy: 'linear' | 'exponential';
    retryDelay: number;
  };
}

/**
 * API configuration
 */
export interface ApiConfig {
  id: string;
  name: string;
  description?: string;
  baseUrl: string;
  version?: string;
  authentication: AuthenticationConfig;
  defaultHeaders: HttpHeader[];
  endpoints: ApiEndpoint[];
  rateLimiting?: {
    requestsPerSecond: number;
    burstSize: number;
  };
  circuitBreaker?: {
    enabled: boolean;
    failureThreshold: number;
    recoveryTimeout: number;
  };
  tags: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
}

/**
 * API test result
 */
export interface ApiTestResult {
  success: boolean;
  statusCode?: number;
  responseTime: number;
  response?: any;
  error?: string;
  timestamp: string;
}

/**
 * API usage statistics
 */
export interface ApiUsageStats {
  apiId: string;
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  averageResponseTime: number;
  lastUsed?: string;
  usageByEndpoint: Record<string, {
    requests: number;
    averageResponseTime: number;
    errorRate: number;
  }>;
}

/**
 * API connection test request
 */
export interface ApiTestRequest {
  apiId: string;
  endpointId?: string;
  testData?: any;
}

/**
 * Secret store test result
 */
export interface SecretStoreTestResult {
  success: boolean;
  error?: string;
  connectionTime: number;
  timestamp: string;
}
