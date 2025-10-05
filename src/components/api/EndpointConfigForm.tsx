

import React, { useState } from 'react';
import { Controller } from 'react-hook-form';
import type { Control, UseFieldArrayReturn } from 'react-hook-form';
import { 
  Plus, 
  Trash2, 
  ChevronDown, 
  ChevronRight, 
  Code, 
  Clock, 
  RotateCcw,
  FileText 
} from 'lucide-react';
import clsx from 'clsx';

import type { HttpMethod, SecretStoreConfig } from '../../types/api';
import { httpMethodConfig } from '../../utils/api-helpers';
import { SecretReferenceInput } from './SecretReferenceInput';

interface EndpointConfigFormProps {
  control: Control<any>;
  fields: any[];
  append: UseFieldArrayReturn<any>['append'];
  remove: UseFieldArrayReturn<any>['remove'];
  secretStores: SecretStoreConfig[];
  errors?: any;
}

/**
 * Endpoint configuration form component
 */
export const EndpointConfigForm: React.FC<EndpointConfigFormProps> = ({
  control,
  fields,
  append,
  remove,
  secretStores,
  errors,
}) => {
  const [expandedEndpoints, setExpandedEndpoints] = useState<Set<number>>(new Set([0]));

  const toggleEndpointExpansion = (index: number) => {
    const newExpanded = new Set(expandedEndpoints);
    if (newExpanded.has(index)) {
      newExpanded.delete(index);
    } else {
      newExpanded.add(index);
    }
    setExpandedEndpoints(newExpanded);
  };

  const addEndpoint = () => {
    const newEndpoint = {
      id: `endpoint_${Date.now()}`,
      name: 'New Endpoint',
      description: '',
      method: 'GET' as HttpMethod,
      path: '/',
      headers: [],
      queryParams: {},
      timeout: 30000,
      retryConfig: {
        maxRetries: 3,
        backoffStrategy: 'exponential' as const,
        retryDelay: 1000,
      },
    };
    append(newEndpoint);
    setExpandedEndpoints(prev => new Set([...prev, fields.length]));
  };

  const renderMethodBadge = (method: HttpMethod) => {
    const config = httpMethodConfig[method];
    return (
      <span className={clsx(
        'inline-flex items-center px-2 py-1 rounded-full text-xs font-medium',
        config.color
      )}>
        {config.label}
      </span>
    );
  };

  const renderEndpointHeader = (field: any, index: number) => {
    const isExpanded = expandedEndpoints.has(index);
    
    return (
      <div
        className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50"
        onClick={() => toggleEndpointExpansion(index)}
      >
        <div className="flex items-center gap-3">
          {isExpanded ? (
            <ChevronDown className="w-4 h-4 text-gray-400" />
          ) : (
            <ChevronRight className="w-4 h-4 text-gray-400" />
          )}
          
          <Controller
            name={`endpoints.${index}.method`}
            control={control}
            render={({ field: methodField }) => renderMethodBadge(methodField.value)}
          />
          
          <div>
            <Controller
              name={`endpoints.${index}.name`}
              control={control}
              render={({ field: nameField }) => (
                <h4 className="text-sm font-medium text-gray-900">
                  {nameField.value || 'Unnamed Endpoint'}
                </h4>
              )}
            />
            <Controller
              name={`endpoints.${index}.path`}
              control={control}
              render={({ field: pathField }) => (
                <p className="text-xs text-gray-500 font-mono">
                  {pathField.value || '/'}
                </p>
              )}
            />
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              remove(index);
            }}
            className="p-1 text-red-600 hover:text-red-700"
            title="Delete endpoint"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  };

  const renderEndpointDetails = (field: any, index: number) => (
    <div className="px-4 pb-4 space-y-6">
      {/* Basic Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Endpoint Name *
          </label>
          <Controller
            name={`endpoints.${index}.name`}
            control={control}
            render={({ field: nameField }) => (
              <input
                {...nameField}
                type="text"
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                placeholder="Get User Profile"
              />
            )}
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            HTTP Method *
          </label>
          <Controller
            name={`endpoints.${index}.method`}
            control={control}
            render={({ field: methodField }) => (
              <select
                {...methodField}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              >
                {Object.entries(httpMethodConfig).map(([method, config]) => (
                  <option key={method} value={method}>
                    {config.label} - {config.description}
                  </option>
                ))}
              </select>
            )}
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Path *
        </label>
        <Controller
          name={`endpoints.${index}.path`}
          control={control}
          render={({ field: pathField }) => (
            <input
              {...pathField}
              type="text"
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm font-mono"
              placeholder="/api/v1/users/{id}"
            />
          )}
        />
        <p className="text-xs text-gray-500 mt-1">
          Use {'{}'} for path parameters, e.g., /users/{'{id}'}
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Description
        </label>
        <Controller
          name={`endpoints.${index}.description`}
          control={control}
          render={({ field: descField }) => (
            <textarea
              {...descField}
              rows={2}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              placeholder="Describe what this endpoint does..."
            />
          )}
        />
      </div>

      {/* Headers */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <label className="block text-sm font-medium text-gray-700">
            Headers
          </label>
          <Controller
            name={`endpoints.${index}.headers`}
            control={control}
            render={({ field: headersField }) => (
              <button
                type="button"
                onClick={() => {
                  const newHeaders = [...(headersField.value || []), {
                    name: '',
                    value: '',
                    required: false,
                    description: '',
                  }];
                  headersField.onChange(newHeaders);
                }}
                className="inline-flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700"
              >
                <Plus className="w-4 h-4" />
                Add Header
              </button>
            )}
          />
        </div>
        
        <Controller
          name={`endpoints.${index}.headers`}
          control={control}
          render={({ field: headersField }) => (
            <div className="space-y-2">
              {(headersField.value || []).map((header: any, headerIndex: number) => (
                <div key={headerIndex} className="grid grid-cols-12 gap-2 items-center">
                  <div className="col-span-3">
                    <input
                      type="text"
                      value={header.name}
                      onChange={(e) => {
                        const newHeaders = [...headersField.value];
                        newHeaders[headerIndex] = { ...header, name: e.target.value };
                        headersField.onChange(newHeaders);
                      }}
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                      placeholder="Header name"
                    />
                  </div>
                  <div className="col-span-4">
                    <input
                      type="text"
                      value={typeof header.value === 'string' ? header.value : ''}
                      onChange={(e) => {
                        const newHeaders = [...headersField.value];
                        newHeaders[headerIndex] = { ...header, value: e.target.value };
                        headersField.onChange(newHeaders);
                      }}
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                      placeholder="Header value"
                    />
                  </div>
                  <div className="col-span-3">
                    <input
                      type="text"
                      value={header.description || ''}
                      onChange={(e) => {
                        const newHeaders = [...headersField.value];
                        newHeaders[headerIndex] = { ...header, description: e.target.value };
                        headersField.onChange(newHeaders);
                      }}
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                      placeholder="Description"
                    />
                  </div>
                  <div className="col-span-1 flex items-center justify-center">
                    <input
                      type="checkbox"
                      checked={header.required || false}
                      onChange={(e) => {
                        const newHeaders = [...headersField.value];
                        newHeaders[headerIndex] = { ...header, required: e.target.checked };
                        headersField.onChange(newHeaders);
                      }}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      title="Required"
                    />
                  </div>
                  <div className="col-span-1">
                    <button
                      type="button"
                      onClick={() => {
                        const newHeaders = headersField.value.filter((_: any, i: number) => i !== headerIndex);
                        headersField.onChange(newHeaders);
                      }}
                      className="p-1 text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        />
      </div>

      {/* Query Parameters */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Query Parameters
        </label>
        <Controller
          name={`endpoints.${index}.queryParams`}
          control={control}
          render={({ field: queryField }) => (
            <textarea
              {...queryField}
              rows={3}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm font-mono"
              placeholder={`{
  "page": "1",
  "limit": "10",
  "filter": "active"
}`}
              value={typeof queryField.value === 'object' ? JSON.stringify(queryField.value, null, 2) : queryField.value}
              onChange={(e) => {
                try {
                  queryField.onChange(JSON.parse(e.target.value));
                } catch {
                  queryField.onChange(e.target.value);
                }
              }}
            />
          )}
        />
        <p className="text-xs text-gray-500 mt-1">
          Enter query parameters as JSON object
        </p>
      </div>

      {/* Request Body (for methods that support it) */}
      <Controller
        name={`endpoints.${index}.method`}
        control={control}
        render={({ field: methodField }) => {
          const config = httpMethodConfig[methodField.value as HttpMethod];
          if (!config.hasBody) return null;

          return (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                <Code className="w-4 h-4" />
                Request Body
              </label>
              <div className="space-y-3">
                <div>
                  <label className="block text-xs text-gray-600 mb-1">
                    Content Type
                  </label>
                  <Controller
                    name={`endpoints.${index}.requestBody.contentType`}
                    control={control}
                    render={({ field: contentTypeField }) => (
                      <select
                        {...contentTypeField}
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                      >
                        <option value="application/json">application/json</option>
                        <option value="application/x-www-form-urlencoded">application/x-www-form-urlencoded</option>
                        <option value="multipart/form-data">multipart/form-data</option>
                        <option value="text/plain">text/plain</option>
                        <option value="application/xml">application/xml</option>
                      </select>
                    )}
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-600 mb-1">
                    Example Body
                  </label>
                  <Controller
                    name={`endpoints.${index}.requestBody.example`}
                    control={control}
                    render={({ field: exampleField }) => (
                      <textarea
                        {...exampleField}
                        rows={4}
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm font-mono"
                        placeholder={`{
  "name": "John Doe",
  "email": "john@example.com"
}`}
                        value={typeof exampleField.value === 'object' ? JSON.stringify(exampleField.value, null, 2) : exampleField.value}
                        onChange={(e) => {
                          try {
                            exampleField.onChange(JSON.parse(e.target.value));
                          } catch {
                            exampleField.onChange(e.target.value);
                          }
                        }}
                      />
                    )}
                  />
                </div>
              </div>
            </div>
          );
        }}
      />

      {/* Advanced Settings */}
      <div className="border-t border-gray-200 pt-6">
        <h4 className="text-sm font-medium text-gray-700 mb-4 flex items-center gap-2">
          <Clock className="w-4 h-4" />
          Advanced Settings
        </h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-gray-600 mb-1">
              Timeout (ms)
            </label>
            <Controller
              name={`endpoints.${index}.timeout`}
              control={control}
              render={({ field: timeoutField }) => (
                <input
                  {...timeoutField}
                  type="number"
                  min="1000"
                  step="1000"
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  placeholder="30000"
                />
              )}
            />
          </div>
        </div>

        {/* Retry Configuration */}
        <div className="mt-4">
          <h5 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
            <RotateCcw className="w-4 h-4" />
            Retry Configuration
          </h5>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm text-gray-600 mb-1">
                Max Retries
              </label>
              <Controller
                name={`endpoints.${index}.retryConfig.maxRetries`}
                control={control}
                render={({ field: retriesField }) => (
                  <input
                    {...retriesField}
                    type="number"
                    min="0"
                    max="10"
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                    placeholder="3"
                  />
                )}
              />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">
                Backoff Strategy
              </label>
              <Controller
                name={`endpoints.${index}.retryConfig.backoffStrategy`}
                control={control}
                render={({ field: strategyField }) => (
                  <select
                    {...strategyField}
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  >
                    <option value="linear">Linear</option>
                    <option value="exponential">Exponential</option>
                  </select>
                )}
              />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">
                Retry Delay (ms)
              </label>
              <Controller
                name={`endpoints.${index}.retryConfig.retryDelay`}
                control={control}
                render={({ field: delayField }) => (
                  <input
                    {...delayField}
                    type="number"
                    min="100"
                    step="100"
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                    placeholder="1000"
                  />
                )}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium text-gray-900 flex items-center gap-2">
          <FileText className="w-5 h-5" />
          API Endpoints
        </h3>
        <button
          type="button"
          onClick={addEndpoint}
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-blue-700 bg-blue-100 border border-blue-200 rounded-md hover:bg-blue-200"
        >
          <Plus className="w-4 h-4" />
          Add Endpoint
        </button>
      </div>

      {fields.length === 0 ? (
        <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
          <FileText className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No endpoints</h3>
          <p className="mt-1 text-sm text-gray-500">
            Add your first API endpoint to get started.
          </p>
          <div className="mt-6">
            <button
              type="button"
              onClick={addEndpoint}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700"
            >
              <Plus className="w-4 h-4" />
              Add Endpoint
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {fields.map((field, index) => (
            <div
              key={field.id}
              className="border border-gray-200 rounded-lg overflow-hidden"
            >
              {renderEndpointHeader(field, index)}
              {expandedEndpoints.has(index) && renderEndpointDetails(field, index)}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
