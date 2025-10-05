

import React, { useState } from 'react';
import { Controller } from 'react-hook-form';
import type { Control } from 'react-hook-form';
import { Eye, EyeOff, Key, Shield, Lock, Settings } from 'lucide-react';
import clsx from 'clsx';

import type { AuthenticationType, SecretStoreConfig } from '../../types/api';
import { authenticationTypeConfig } from '../../utils/api-helpers';
import { SecretReferenceInput } from './SecretReferenceInput';

interface AuthenticationConfigFormProps {
  control: Control<any>;
  secretStores: SecretStoreConfig[];
  errors?: any;
}

/**
 * Authentication configuration form component
 */
export const AuthenticationConfigForm: React.FC<AuthenticationConfigFormProps> = ({
  control,
  secretStores,
  errors,
}) => {
  const [showSensitiveFields, setShowSensitiveFields] = useState<Record<string, boolean>>({});

  const toggleSensitiveField = (fieldName: string) => {
    setShowSensitiveFields(prev => ({
      ...prev,
      [fieldName]: !prev[fieldName],
    }));
  };

  const renderAuthTypeSelector = () => (
    <div className="space-y-4">
      <label className="block text-sm font-medium text-gray-700">
        Authentication Type *
      </label>
      <Controller
        name="authentication.type"
        control={control}
        render={({ field }) => (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(authenticationTypeConfig).map(([type, config]) => (
              <div
                key={type}
                className={clsx(
                  'relative cursor-pointer rounded-lg border p-4 hover:bg-gray-50 transition-colors',
                  field.value === type
                    ? 'border-blue-500 ring-2 ring-blue-500 ring-opacity-50'
                    : 'border-gray-300'
                )}
                onClick={() => field.onChange(type)}
              >
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <span className="text-2xl">{config.icon}</span>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-gray-900">
                      {config.label}
                    </h3>
                    <p className="text-xs text-gray-500 mt-1">
                      {config.description}
                    </p>
                    <div className="flex items-center mt-2">
                      <div className={clsx(
                        'inline-flex items-center px-2 py-1 rounded-full text-xs font-medium',
                        config.securityLevel === 'high' && 'bg-green-100 text-green-800',
                        config.securityLevel === 'medium' && 'bg-yellow-100 text-yellow-800',
                        config.securityLevel === 'low' && 'bg-red-100 text-red-800'
                      )}>
                        <Shield className="w-3 h-3 mr-1" />
                        {config.securityLevel}
                      </div>
                    </div>
                  </div>
                </div>
                {field.value === type && (
                  <div className="absolute -top-1 -right-1">
                    <div className="w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
                      <div className="w-2 h-2 bg-white rounded-full" />
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      />
    </div>
  );

  const renderBasicAuth = () => (
    <div className="space-y-4 mt-6">
      <h3 className="text-sm font-medium text-gray-700 flex items-center gap-2">
        <Key className="w-4 h-4" />
        Basic Authentication Configuration
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Username *
          </label>
          <SecretReferenceInput
            name="authentication.username"
            control={control}
            secretStores={secretStores}
            placeholder="Enter username or select from secret store"
            errors={errors}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Password *
          </label>
          <SecretReferenceInput
            name="authentication.password"
            control={control}
            secretStores={secretStores}
            placeholder="Enter password or select from secret store"
            sensitive
            errors={errors}
          />
        </div>
      </div>
    </div>
  );

  const renderBearerAuth = () => (
    <div className="space-y-4 mt-6">
      <h3 className="text-sm font-medium text-gray-700 flex items-center gap-2">
        <Shield className="w-4 h-4" />
        Bearer Token Configuration
      </h3>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Token *
        </label>
        <SecretReferenceInput
          name="authentication.token"
          control={control}
          secretStores={secretStores}
          placeholder="Enter bearer token or select from secret store"
          sensitive
          errors={errors}
        />
      </div>
    </div>
  );

  const renderApiKeyAuth = () => (
    <div className="space-y-4 mt-6">
      <h3 className="text-sm font-medium text-gray-700 flex items-center gap-2">
        <Key className="w-4 h-4" />
        API Key Configuration
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            API Key *
          </label>
          <SecretReferenceInput
            name="authentication.key"
            control={control}
            secretStores={secretStores}
            placeholder="Enter API key or select from secret store"
            sensitive
            errors={errors}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Key Name *
          </label>
          <Controller
            name="authentication.name"
            control={control}
            render={({ field }) => (
              <input
                {...field}
                type="text"
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                placeholder="X-API-Key"
              />
            )}
          />
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Location *
        </label>
        <Controller
          name="authentication.location"
          control={control}
          render={({ field }) => (
            <select
              {...field}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            >
              <option value="">Select location</option>
              <option value="header">Header</option>
              <option value="query">Query Parameter</option>
              <option value="cookie">Cookie</option>
            </select>
          )}
        />
      </div>
    </div>
  );

  const renderOAuth2Auth = () => (
    <div className="space-y-4 mt-6">
      <h3 className="text-sm font-medium text-gray-700 flex items-center gap-2">
        <Lock className="w-4 h-4" />
        OAuth 2.0 Configuration
      </h3>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Grant Type *
        </label>
        <Controller
          name="authentication.grantType"
          control={control}
          render={({ field }) => (
            <select
              {...field}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            >
              <option value="">Select grant type</option>
              <option value="client_credentials">Client Credentials</option>
              <option value="authorization_code">Authorization Code</option>
              <option value="password">Resource Owner Password</option>
            </select>
          )}
        />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Client ID *
          </label>
          <SecretReferenceInput
            name="authentication.clientId"
            control={control}
            secretStores={secretStores}
            placeholder="Enter client ID or select from secret store"
            errors={errors}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Client Secret *
          </label>
          <SecretReferenceInput
            name="authentication.clientSecret"
            control={control}
            secretStores={secretStores}
            placeholder="Enter client secret or select from secret store"
            sensitive
            errors={errors}
          />
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Token URL *
        </label>
        <Controller
          name="authentication.tokenUrl"
          control={control}
          render={({ field }) => (
            <input
              {...field}
              type="url"
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              placeholder="https://auth.example.com/oauth/token"
            />
          )}
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Scopes (optional)
        </label>
        <Controller
          name="authentication.scopes"
          control={control}
          render={({ field }) => (
            <input
              {...field}
              type="text"
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              placeholder="read write admin (space-separated)"
              onChange={(e) => field.onChange(e.target.value.split(' ').filter(Boolean))}
              value={Array.isArray(field.value) ? field.value.join(' ') : ''}
            />
          )}
        />
      </div>
    </div>
  );

  const renderCustomAuth = () => (
    <div className="space-y-4 mt-6">
      <h3 className="text-sm font-medium text-gray-700 flex items-center gap-2">
        <Settings className="w-4 h-4" />
        Custom Authentication Configuration
      </h3>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Custom Headers
        </label>
        <div className="space-y-3">
          <Controller
            name="authentication.headers"
            control={control}
            render={({ field }) => (
              <textarea
                {...field}
                rows={4}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                placeholder={`{
  "Authorization": "Custom token123",
  "X-Custom-Header": "value"
}`}
                value={typeof field.value === 'object' ? JSON.stringify(field.value, null, 2) : field.value}
                onChange={(e) => {
                  try {
                    field.onChange(JSON.parse(e.target.value));
                  } catch {
                    field.onChange(e.target.value);
                  }
                }}
              />
            )}
          />
        </div>
        <p className="text-xs text-gray-500 mt-1">
          Enter custom headers as JSON object. You can reference secret stores using the format: 
          {"{"}"secretStoreId": "store-id", "secretPath": "path/to/secret"{"}"}
        </p>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {renderAuthTypeSelector()}
      
      <Controller
        name="authentication.type"
        control={control}
        render={({ field }) => {
          switch (field.value) {
            case 'basic':
              return renderBasicAuth();
            case 'bearer':
              return renderBearerAuth();
            case 'api_key':
              return renderApiKeyAuth();
            case 'oauth2':
              return renderOAuth2Auth();
            case 'custom':
              return renderCustomAuth();
            default:
              return null;
          }
        }}
      />

      {/* Security Notice */}
      <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <Shield className="h-5 w-5 text-blue-400" />
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-blue-800">
              Security Best Practices
            </h3>
            <div className="mt-2 text-sm text-blue-700">
              <ul className="list-disc list-inside space-y-1">
                <li>Always use secret stores for sensitive credentials</li>
                <li>Prefer OAuth 2.0 or API keys over basic authentication</li>
                <li>Regularly rotate your API keys and tokens</li>
                <li>Use HTTPS endpoints to encrypt data in transit</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
