

import type { 
  AuthenticationType, 
  SecretStoreType, 
  HttpMethod,
  SecretReference,
  AuthenticationConfig,
  ApiConfig,
  SecretStoreConfig
} from '../types/api';

/**
 * Configuration for authentication types
 */
export const authenticationTypeConfig: Record<AuthenticationType, {
  label: string;
  description: string;
  icon: string;
  fields: string[];
  securityLevel: 'low' | 'medium' | 'high';
}> = {
  none: {
    label: 'No Authentication',
    description: 'No authentication required',
    icon: '🚫',
    fields: [],
    securityLevel: 'low',
  },
  basic: {
    label: 'Basic Auth',
    description: 'Username and password authentication',
    icon: '🔐',
    fields: ['username', 'password'],
    securityLevel: 'medium',
  },
  bearer: {
    label: 'Bearer Token',
    description: 'Token-based authentication',
    icon: '🎫',
    fields: ['token'],
    securityLevel: 'high',
  },
  api_key: {
    label: 'API Key',
    description: 'API key authentication',
    icon: '🗝️',
    fields: ['key', 'location', 'name'],
    securityLevel: 'medium',
  },
  oauth2: {
    label: 'OAuth 2.0',
    description: 'OAuth 2.0 authentication',
    icon: '🔑',
    fields: ['grantType', 'clientId', 'clientSecret', 'tokenUrl'],
    securityLevel: 'high',
  },
  custom: {
    label: 'Custom',
    description: 'Custom authentication headers',
    icon: '⚙️',
    fields: ['headers'],
    securityLevel: 'medium',
  },
};

/**
 * Configuration for secret store types
 */
export const secretStoreTypeConfig: Record<SecretStoreType, {
  label: string;
  description: string;
  icon: string;
  vendor: string;
  docUrl: string;
  features: string[];
}> = {
  hashicorp_vault: {
    label: 'HashiCorp Vault',
    description: 'Enterprise secret management solution',
    icon: '🏛️',
    vendor: 'HashiCorp',
    docUrl: 'https://www.vaultproject.io/docs',
    features: ['Dynamic secrets', 'Encryption as a service', 'Identity-based access'],
  },
  aws_secrets_manager: {
    label: 'AWS Secrets Manager',
    description: 'AWS managed secret storage service',
    icon: '☁️',
    vendor: 'Amazon Web Services',
    docUrl: 'https://docs.aws.amazon.com/secretsmanager/',
    features: ['Automatic rotation', 'Fine-grained permissions', 'Cross-region replication'],
  },
  azure_key_vault: {
    label: 'Azure Key Vault',
    description: 'Microsoft Azure secret management service',
    icon: '🔷',
    vendor: 'Microsoft Azure',
    docUrl: 'https://docs.microsoft.com/en-us/azure/key-vault/',
    features: ['Hardware security modules', 'Certificate management', 'Key management'],
  },
  gcp_secret_manager: {
    label: 'GCP Secret Manager',
    description: 'Google Cloud secret management service',
    icon: '☁️',
    vendor: 'Google Cloud Platform',
    docUrl: 'https://cloud.google.com/secret-manager/docs',
    features: ['Automatic encryption', 'IAM integration', 'Audit logging'],
  },
  kubernetes_secrets: {
    label: 'Kubernetes Secrets',
    description: 'Kubernetes native secret storage',
    icon: '⚙️',
    vendor: 'Kubernetes',
    docUrl: 'https://kubernetes.io/docs/concepts/configuration/secret/',
    features: ['Native integration', 'Namespace isolation', 'Volume mounts'],
  },
  environment_variables: {
    label: 'Environment Variables',
    description: 'System environment variables',
    icon: '💻',
    vendor: 'System',
    docUrl: '',
    features: ['Simple setup', 'No external dependencies', 'Process isolation'],
  },
};

/**
 * HTTP method configuration
 */
export const httpMethodConfig: Record<HttpMethod, {
  label: string;
  color: string;
  description: string;
  hasBody: boolean;
  idempotent: boolean;
}> = {
  GET: {
    label: 'GET',
    color: 'text-blue-600 bg-blue-100',
    description: 'Retrieve data',
    hasBody: false,
    idempotent: true,
  },
  POST: {
    label: 'POST',
    color: 'text-green-600 bg-green-100',
    description: 'Create new resource',
    hasBody: true,
    idempotent: false,
  },
  PUT: {
    label: 'PUT',
    color: 'text-orange-600 bg-orange-100',
    description: 'Update/replace resource',
    hasBody: true,
    idempotent: true,
  },
  PATCH: {
    label: 'PATCH',
    color: 'text-purple-600 bg-purple-100',
    description: 'Partial update',
    hasBody: true,
    idempotent: false,
  },
  DELETE: {
    label: 'DELETE',
    color: 'text-red-600 bg-red-100',
    description: 'Delete resource',
    hasBody: false,
    idempotent: true,
  },
  HEAD: {
    label: 'HEAD',
    color: 'text-gray-600 bg-gray-100',
    description: 'Get headers only',
    hasBody: false,
    idempotent: true,
  },
  OPTIONS: {
    label: 'OPTIONS',
    color: 'text-indigo-600 bg-indigo-100',
    description: 'Get allowed methods',
    hasBody: false,
    idempotent: true,
  },
};

/**
 * Check if a value is a secret reference
 */
export const isSecretReference = (value: any): value is SecretReference => {
  return (
    typeof value === 'object' &&
    value !== null &&
    typeof value.secretStoreId === 'string' &&
    typeof value.secretPath === 'string'
  );
};

/**
 * Create a secret reference
 */
export const createSecretReference = (
  secretStoreId: string,
  secretPath: string,
  secretKey?: string,
  version?: string
): SecretReference => ({
  secretStoreId,
  secretPath,
  secretKey,
  version,
});

/**
 * Format secret reference for display
 */
export const formatSecretReference = (ref: SecretReference): string => {
  const base = `${ref.secretStoreId}:${ref.secretPath}`;
  const key = ref.secretKey ? `#${ref.secretKey}` : '';
  const version = ref.version ? `@${ref.version}` : '';
  return `${base}${key}${version}`;
};

/**
 * Parse secret reference from string
 */
export const parseSecretReference = (str: string): SecretReference | null => {
  const match = str.match(/^([^:]+):([^#@]+)(?:#([^@]+))?(?:@(.+))?$/);
  if (!match) return null;

  const [, secretStoreId, secretPath, secretKey, version] = match;
  return {
    secretStoreId,
    secretPath,
    secretKey,
    version,
  };
};

/**
 * Validate API configuration
 */
export const validateApiConfig = (config: Partial<ApiConfig>): string[] => {
  const errors: string[] = [];

  if (!config.name?.trim()) {
    errors.push('API name is required');
  }

  if (!config.baseUrl?.trim()) {
    errors.push('Base URL is required');
  } else {
    try {
      new URL(config.baseUrl);
    } catch {
      errors.push('Base URL must be a valid URL');
    }
  }

  if (!config.authentication) {
    errors.push('Authentication configuration is required');
  }

  if (config.endpoints) {
    config.endpoints.forEach((endpoint, index) => {
      if (!endpoint.name?.trim()) {
        errors.push(`Endpoint ${index + 1}: Name is required`);
      }
      if (!endpoint.path?.trim()) {
        errors.push(`Endpoint ${index + 1}: Path is required`);
      }
      if (!endpoint.method) {
        errors.push(`Endpoint ${index + 1}: HTTP method is required`);
      }
    });
  }

  return errors;
};

/**
 * Validate secret store configuration
 */
export const validateSecretStoreConfig = (config: Partial<SecretStoreConfig>): string[] => {
  const errors: string[] = [];

  if (!config.name?.trim()) {
    errors.push('Secret store name is required');
  }

  if (!config.type) {
    errors.push('Secret store type is required');
  }

  // Type-specific validations
  if (config.type === 'hashicorp_vault' && config.config) {
    const vaultConfig = config.config as any;
    if (!vaultConfig.url?.trim()) {
      errors.push('Vault URL is required');
    }
    if (!vaultConfig.authMethod) {
      errors.push('Vault authentication method is required');
    }
  }

  if (config.type === 'aws_secrets_manager' && config.config) {
    const awsConfig = config.config as any;
    if (!awsConfig.region?.trim()) {
      errors.push('AWS region is required');
    }
  }

  if (config.type === 'azure_key_vault' && config.config) {
    const azureConfig = config.config as any;
    if (!azureConfig.vaultUrl?.trim()) {
      errors.push('Azure Key Vault URL is required');
    }
    if (!azureConfig.tenantId?.trim()) {
      errors.push('Azure tenant ID is required');
    }
    if (!azureConfig.clientId?.trim()) {
      errors.push('Azure client ID is required');
    }
  }

  if (config.type === 'gcp_secret_manager' && config.config) {
    const gcpConfig = config.config as any;
    if (!gcpConfig.projectId?.trim()) {
      errors.push('GCP project ID is required');
    }
  }

  return errors;
};

/**
 * Generate API configuration template
 */
export const createApiConfigTemplate = (name: string): Partial<ApiConfig> => ({
  name,
  description: '',
  baseUrl: 'https://api.example.com',
  version: '1.0',
  authentication: {
    type: 'none',
  },
  defaultHeaders: [
    {
      name: 'Content-Type',
      value: 'application/json',
      required: true,
      description: 'Request content type',
    },
  ],
  endpoints: [
    {
      id: 'get-example',
      name: 'Get Example',
      description: 'Example GET endpoint',
      method: 'GET',
      path: '/example',
      headers: [],
      queryParams: {},
    },
  ],
  tags: [],
  isActive: true,
});

/**
 * Generate secret store configuration template
 */
export const createSecretStoreTemplate = (
  name: string, 
  type: SecretStoreType
): Partial<SecretStoreConfig> => {
  const base = {
    name,
    type,
    description: '',
    isActive: true,
  };

  switch (type) {
    case 'hashicorp_vault':
      return {
        ...base,
        config: {
          url: 'https://vault.example.com',
          authMethod: 'token',
          mount: 'secret',
        },
      };
    case 'aws_secrets_manager':
      return {
        ...base,
        config: {
          region: 'us-east-1',
        },
      };
    case 'azure_key_vault':
      return {
        ...base,
        config: {
          vaultUrl: 'https://your-vault.vault.azure.net/',
          tenantId: '',
          clientId: '',
        },
      };
    case 'gcp_secret_manager':
      return {
        ...base,
        config: {
          projectId: 'your-project-id',
        },
      };
    case 'environment_variables':
      return {
        ...base,
        config: {
          prefix: 'APP_',
        },
      };
    default:
      return base;
  }
};

/**
 * Mask sensitive values for display
 */
export const maskSensitiveValue = (value: string | SecretReference): string => {
  if (isSecretReference(value)) {
    return formatSecretReference(value);
  }
  
  if (typeof value === 'string' && value.length > 4) {
    return `${value.substring(0, 2)}${'*'.repeat(value.length - 4)}${value.substring(value.length - 2)}`;
  }
  
  return '***';
};

/**
 * Get authentication config summary
 */
export const getAuthSummary = (auth: AuthenticationConfig): string => {
  const config = authenticationTypeConfig[auth.type];

  switch (auth.type) {
    case 'basic':
      return `${config.label} (${(auth as any).username})`;
    case 'api_key':
      return `${config.label} in ${(auth as any).location}`;
    case 'oauth2':
      return `${config.label} (${(auth as any).grantType})`;
    default:
      return config.label;
  }
};

/**
 * Transform API form data to backend DTO format
 *
 * Transformations applied:
 * 1. Content-Type header is automatically set by ApiClient
 * 2. Remove defaultHeaders field (not part of DTO)
 * 3. Remove id from endpoints (auto-generated by backend)
 * 4. Change method to httpMethod
 * 5. Change path to endpointPath
 * 6. Change headers from array to object (key-value pairs)
 * 7. Change queryParams to object
 * 8. Change timeout to timeoutMs (integer)
 * 9. Change retryDelay to retryDelayMs (integer)
 * 10. Remove isActive field (not part of DTO)
 */
export const transformApiFormToDto = (formData: any): any => {
  const dto: any = {
    name: formData.name,
    baseUrl: formData.baseUrl,
  };

  // Optional fields
  if (formData.description) dto.description = formData.description;
  if (formData.version) dto.version = formData.version;
  if (formData.secretId) dto.secretId = formData.secretId;
  if (formData.tags && formData.tags.length > 0) {
    dto.tags = formData.tags.filter((tag: string) => tag.trim() !== '');
  }

  // Note: defaultHeaders and isActive are NOT included in DTO

  // Transform endpoints
  if (formData.endpoints && formData.endpoints.length > 0) {
    dto.endpoints = formData.endpoints.map((endpoint: any) => {
      // Note: id is NOT included (auto-generated by backend)
      const transformedEndpoint: any = {
        name: endpoint.name,
        httpMethod: endpoint.method || endpoint.httpMethod, // Support both field names
        endpointPath: endpoint.path || endpoint.endpointPath, // Support both field names
      };

      // Optional fields
      if (endpoint.description) transformedEndpoint.description = endpoint.description;
      if (endpoint.contentType) transformedEndpoint.contentType = endpoint.contentType;

      // Transform headers from array to object (key-value pairs)
      if (endpoint.headers) {
        if (Array.isArray(endpoint.headers)) {
          const headersObj = endpoint.headers.reduce((acc: any, header: any) => {
            if (header.name && header.value !== undefined) {
              acc[header.name] = header.value;
            }
            return acc;
          }, {});
          // Only add if not empty
          if (Object.keys(headersObj).length > 0) {
            transformedEndpoint.headers = headersObj;
          }
        } else if (typeof endpoint.headers === 'object' && Object.keys(endpoint.headers).length > 0) {
          transformedEndpoint.headers = endpoint.headers;
        }
      }

      // Transform queryParams to object
      if (endpoint.queryParams) {
        if (typeof endpoint.queryParams === 'object' && !Array.isArray(endpoint.queryParams)) {
          if (Object.keys(endpoint.queryParams).length > 0) {
            transformedEndpoint.queryParams = endpoint.queryParams;
          }
        }
      }

      // Transform pathParams
      if (endpoint.pathParams && typeof endpoint.pathParams === 'object') {
        if (Object.keys(endpoint.pathParams).length > 0) {
          transformedEndpoint.pathParams = endpoint.pathParams;
        }
      }

      // Request body template
      if (endpoint.requestBodyTemplate !== undefined && endpoint.requestBodyTemplate !== null) {
        transformedEndpoint.requestBodyTemplate = endpoint.requestBodyTemplate;
      }

      // Response mapping
      if (endpoint.responseMapping && typeof endpoint.responseMapping === 'object') {
        if (Object.keys(endpoint.responseMapping).length > 0) {
          transformedEndpoint.responseMapping = endpoint.responseMapping;
        }
      }

      // Transform timeout to timeoutMs (integer)
      if (endpoint.timeout !== undefined) {
        transformedEndpoint.timeoutMs = typeof endpoint.timeout === 'number'
          ? Math.floor(endpoint.timeout)
          : parseInt(endpoint.timeout, 10);
      } else if (endpoint.timeoutMs !== undefined) {
        transformedEndpoint.timeoutMs = Math.floor(endpoint.timeoutMs);
      }

      // Transform retry config
      if (endpoint.retryConfig) {
        transformedEndpoint.retryConfig = {
          maxRetries: endpoint.retryConfig.maxRetries || 0,
        };

        if (endpoint.retryConfig.backoffStrategy) {
          transformedEndpoint.retryConfig.backoffStrategy = endpoint.retryConfig.backoffStrategy;
        }

        // Transform retryDelay to retryDelayMs (integer)
        if (endpoint.retryConfig.retryDelay !== undefined) {
          transformedEndpoint.retryConfig.retryDelayMs = typeof endpoint.retryConfig.retryDelay === 'number'
            ? Math.floor(endpoint.retryConfig.retryDelay)
            : parseInt(endpoint.retryConfig.retryDelay, 10);
        } else if (endpoint.retryConfig.retryDelayMs !== undefined) {
          transformedEndpoint.retryConfig.retryDelayMs = Math.floor(endpoint.retryConfig.retryDelayMs);
        }
      }

      return transformedEndpoint;
    });
  }

  return dto;
};
