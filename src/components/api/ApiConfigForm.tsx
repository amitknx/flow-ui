

import React, { useState, useEffect } from 'react';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { 
  Save, 
  TestTube, 
  Plus, 
  Trash2, 
  AlertTriangle,
  CheckCircle,
  Info
} from 'lucide-react';
import clsx from 'clsx';

import type { ApiConfig } from '../../types/api';
import { createApiConfigTemplate } from '../../utils/api-helpers';
import { useSecretStores } from '../../hooks/useApiManagement';
import { AuthenticationConfigForm } from './AuthenticationConfigForm';
import { EndpointConfigForm } from './EndpointConfigForm';
import { LoadingSpinner } from '../ui';

/**
 * Zod schema for API configuration validation
 */
const apiConfigSchema = z.object({
  name: z.string().min(1, 'API name is required').max(100, 'API name too long'),
  description: z.string().max(500, 'Description too long').optional(),
  baseUrl: z.string().url('Must be a valid URL'),
  version: z.string().max(20, 'Version too long').optional(),
  authentication: z.object({
    type: z.enum(['none', 'basic', 'bearer', 'api_key', 'oauth2', 'custom']),
  }).passthrough(),
  defaultHeaders: z.array(z.object({
    name: z.string().min(1, 'Header name is required'),
    value: z.union([z.string(), z.object({
      secretStoreId: z.string(),
      secretPath: z.string(),
      secretKey: z.string().optional(),
      version: z.string().optional(),
    })]),
    required: z.boolean(),
    description: z.string().optional(),
  })),
  endpoints: z.array(z.object({
    id: z.string(),
    name: z.string().min(1, 'Endpoint name is required'),
    description: z.string().optional(),
    method: z.enum(['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD', 'OPTIONS']),
    path: z.string().min(1, 'Endpoint path is required'),
  }).passthrough()),
  tags: z.array(z.string()),
  isActive: z.boolean(),
  rateLimiting: z.object({
    requestsPerSecond: z.number().positive().optional(),
    burstSize: z.number().positive().optional(),
  }).optional(),
  circuitBreaker: z.object({
    enabled: z.boolean(),
    failureThreshold: z.number().positive().optional(),
    recoveryTimeout: z.number().positive().optional(),
  }).optional(),
});

type ApiConfigFormData = z.infer<typeof apiConfigSchema>;

interface ApiConfigFormProps {
  api?: ApiConfig;
  onSave: (config: Partial<ApiConfig>) => void;
  onTest?: (config: Partial<ApiConfig>) => void;
  isLoading?: boolean;
  isTesting?: boolean;
  testResult?: any;
  className?: string;
}

/**
 * Comprehensive API configuration form component
 */
export const ApiConfigForm: React.FC<ApiConfigFormProps> = ({
  api,
  onSave,
  onTest,
  isLoading = false,
  isTesting = false,
  testResult,
  className = '',
}) => {
  const [activeTab, setActiveTab] = useState<'basic' | 'auth' | 'endpoints' | 'advanced'>('basic');

  const { data: secretStores = [] } = useSecretStores();

  const {
    control,
    handleSubmit,
    watch,
    
    formState: { errors, isDirty, isValid },
    reset,
  } = useForm<ApiConfigFormData>({
    resolver: zodResolver(apiConfigSchema),
    defaultValues: api || createApiConfigTemplate('New API'),
    mode: 'onChange',
  });

  const {
    fields: headerFields,
    append: appendHeader,
    remove: removeHeader,
  } = useFieldArray({
    control,
    name: 'defaultHeaders',
  });

  const {
    fields: endpointFields,
    append: appendEndpoint,
    remove: removeEndpoint,
  } = useFieldArray({
    control,
    name: 'endpoints',
  });

  const {
    fields: tagFields,
    append: appendTag,
    remove: removeTag,
  } = useFieldArray({
    control,
    name: 'tags',
  });

  const watchedValues = watch();

  // Reset form when API prop changes
  useEffect(() => {
    if (api) {
      reset(api);
    }
  }, [api, reset]);

  const onSubmit = (data: ApiConfigFormData) => {
    onSave(data);
  };

  const handleTest = () => {
    if (onTest) {
      onTest(watchedValues);
    }
  };

  const addDefaultHeader = () => {
    appendHeader({
      name: '',
      value: '',
      required: false,
      description: '',
    });
  };



  const addTag = () => {
    appendTag('');
  };

  const tabs = [
    { id: 'basic', label: 'Basic Info', icon: Info },
    { id: 'auth', label: 'Authentication', icon: CheckCircle },
    { id: 'endpoints', label: 'Endpoints', icon: Plus },
    { id: 'advanced', label: 'Advanced', icon: AlertTriangle },
  ];

  return (
    <div className={clsx('bg-white rounded-lg shadow-sm border', className)}>
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              {api ? 'Edit API Configuration' : 'Create New API'}
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              Configure your API connection and endpoints
            </p>
          </div>
          <div className="flex items-center gap-3">
            {onTest && (
              <button
                type="button"
                onClick={handleTest}
                disabled={!isValid || isTesting}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-blue-700 bg-blue-100 border border-blue-200 rounded-md hover:bg-blue-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isTesting ? (
                  <LoadingSpinner size="sm" />
                ) : (
                  <TestTube className="w-4 h-4" />
                )}
                Test Connection
              </button>
            )}
            <button
              type="submit"
              form="api-config-form"
              disabled={!isDirty || !isValid || isLoading}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <LoadingSpinner size="sm" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              {api ? 'Update API' : 'Create API'}
            </button>
          </div>
        </div>

        {/* Test Result */}
        {testResult && (
          <div className={clsx(
            'mt-4 p-3 rounded-md border',
            testResult.success
              ? 'bg-green-50 border-green-200 text-green-800'
              : 'bg-red-50 border-red-200 text-red-800'
          )}>
            <div className="flex items-center gap-2">
              {testResult.success ? (
                <CheckCircle className="w-4 h-4" />
              ) : (
                <AlertTriangle className="w-4 h-4" />
              )}
              <span className="text-sm font-medium">
                {testResult.success ? 'Connection successful' : 'Connection failed'}
              </span>
            </div>
            {testResult.error && (
              <p className="text-xs mt-1 opacity-75">{testResult.error}</p>
            )}
            {testResult.responseTime && (
              <p className="text-xs mt-1 opacity-75">
                Response time: {testResult.responseTime}ms
              </p>
            )}
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8 px-6" aria-label="Tabs">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={clsx(
                  'py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2',
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                )}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Form Content */}
      <form id="api-config-form" onSubmit={handleSubmit(onSubmit)} className="p-6">
        {activeTab === 'basic' && (
          <div className="space-y-6">
            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  API Name *
                </label>
                <Controller
                  name="name"
                  control={control}
                  render={({ field }) => (
                    <input
                      {...field}
                      type="text"
                      className={clsx(
                        'block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm',
                        errors.name && 'border-red-300 focus:border-red-500 focus:ring-red-500'
                      )}
                      placeholder="My API"
                    />
                  )}
                />
                {errors.name && (
                  <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Version
                </label>
                <Controller
                  name="version"
                  control={control}
                  render={({ field }) => (
                    <input
                      {...field}
                      type="text"
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                      placeholder="1.0"
                    />
                  )}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Base URL *
              </label>
              <Controller
                name="baseUrl"
                control={control}
                render={({ field }) => (
                  <input
                    {...field}
                    type="url"
                    className={clsx(
                      'block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm',
                      errors.baseUrl && 'border-red-300 focus:border-red-500 focus:ring-red-500'
                    )}
                    placeholder="https://api.example.com"
                  />
                )}
              />
              {errors.baseUrl && (
                <p className="mt-1 text-sm text-red-600">{errors.baseUrl.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <Controller
                name="description"
                control={control}
                render={({ field }) => (
                  <textarea
                    {...field}
                    rows={3}
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                    placeholder="Describe what this API does..."
                  />
                )}
              />
            </div>

            {/* Tags */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-gray-700">
                  Tags
                </label>
                <button
                  type="button"
                  onClick={addTag}
                  className="text-sm text-blue-600 hover:text-blue-700"
                >
                  Add Tag
                </button>
              </div>
              <div className="space-y-2">
                {tagFields.map((field, index) => (
                  <div key={field.id} className="flex items-center gap-2">
                    <Controller
                      name={`tags.${index}`}
                      control={control}
                      render={({ field: tagField }) => (
                        <input
                          {...tagField}
                          type="text"
                          className="block flex-1 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                          placeholder="Tag name"
                        />
                      )}
                    />
                    <button
                      type="button"
                      onClick={() => removeTag(index)}
                      className="p-2 text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Active Status */}
            <div className="flex items-center">
              <Controller
                name="isActive"
                control={control}
                render={({ field }) => (
                  <input
                    {...field}
                    type="checkbox"
                    checked={field.value}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                )}
              />
              <label className="ml-2 block text-sm text-gray-900">
                API is active and available for use
              </label>
            </div>
          </div>
        )}

        {activeTab === 'auth' && (
          <AuthenticationConfigForm
            control={control}
            secretStores={secretStores}
            errors={errors}
          />
        )}

        {activeTab === 'endpoints' && (
          <EndpointConfigForm
            control={control}
            fields={endpointFields}
            append={appendEndpoint}
            remove={removeEndpoint}
            secretStores={secretStores}
            errors={errors}
          />
        )}

        {activeTab === 'advanced' && (
          <div className="space-y-6">
            {/* Default Headers */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <label className="block text-sm font-medium text-gray-700">
                  Default Headers
                </label>
                <button
                  type="button"
                  onClick={addDefaultHeader}
                  className="inline-flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700"
                >
                  <Plus className="w-4 h-4" />
                  Add Header
                </button>
              </div>
              <div className="space-y-3">
                {headerFields.map((field, index) => (
                  <div key={field.id} className="grid grid-cols-12 gap-3 items-start">
                    <div className="col-span-3">
                      <Controller
                        name={`defaultHeaders.${index}.name`}
                        control={control}
                        render={({ field: headerField }) => (
                          <input
                            {...headerField}
                            type="text"
                            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                            placeholder="Header name"
                          />
                        )}
                      />
                    </div>
                    <div className="col-span-4">
                      <Controller
                        name={`defaultHeaders.${index}.value`}
                        control={control}
                        render={({ field: valueField }) => (
                          <input
                            {...valueField}
                            type="text"
                            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                            placeholder="Header value"
                          />
                        )}
                      />
                    </div>
                    <div className="col-span-3">
                      <Controller
                        name={`defaultHeaders.${index}.description`}
                        control={control}
                        render={({ field: descField }) => (
                          <input
                            {...descField}
                            type="text"
                            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                            placeholder="Description"
                          />
                        )}
                      />
                    </div>
                    <div className="col-span-1 flex items-center">
                      <Controller
                        name={`defaultHeaders.${index}.required`}
                        control={control}
                        render={({ field: requiredField }) => (
                          <input
                            {...requiredField}
                            type="checkbox"
                            checked={requiredField.value}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                            title="Required"
                          />
                        )}
                      />
                    </div>
                    <div className="col-span-1">
                      <button
                        type="button"
                        onClick={() => removeHeader(index)}
                        className="p-2 text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Rate Limiting */}
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-4">Rate Limiting</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-600 mb-1">
                    Requests per second
                  </label>
                  <Controller
                    name="rateLimiting.requestsPerSecond"
                    control={control}
                    render={({ field }) => (
                      <input
                        {...field}
                        type="number"
                        min="1"
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                        placeholder="100"
                      />
                    )}
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">
                    Burst size
                  </label>
                  <Controller
                    name="rateLimiting.burstSize"
                    control={control}
                    render={({ field }) => (
                      <input
                        {...field}
                        type="number"
                        min="1"
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                        placeholder="200"
                      />
                    )}
                  />
                </div>
              </div>
            </div>

            {/* Circuit Breaker */}
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-4">Circuit Breaker</h3>
              <div className="space-y-4">
                <div className="flex items-center">
                  <Controller
                    name="circuitBreaker.enabled"
                    control={control}
                    render={({ field }) => (
                      <input
                        {...field}
                        type="checkbox"
                        checked={field.value}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                    )}
                  />
                  <label className="ml-2 block text-sm text-gray-900">
                    Enable circuit breaker
                  </label>
                </div>
                
                {watchedValues.circuitBreaker?.enabled && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 ml-6">
                    <div>
                      <label className="block text-sm text-gray-600 mb-1">
                        Failure threshold
                      </label>
                      <Controller
                        name="circuitBreaker.failureThreshold"
                        control={control}
                        render={({ field }) => (
                          <input
                            {...field}
                            type="number"
                            min="1"
                            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                            placeholder="5"
                          />
                        )}
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-600 mb-1">
                        Recovery timeout (ms)
                      </label>
                      <Controller
                        name="circuitBreaker.recoveryTimeout"
                        control={control}
                        render={({ field }) => (
                          <input
                            {...field}
                            type="number"
                            min="1000"
                            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                            placeholder="30000"
                          />
                        )}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </form>
    </div>
  );
};
