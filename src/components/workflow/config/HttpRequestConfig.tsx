import React, { useState, useEffect } from 'react';
import { useWorkflowStore } from '../../../stores/workflow';
import { useApis, useApi } from '../../../hooks/useApiManagement';


import { Plus, Trash2, Braces } from 'lucide-react';
import VariablePicker from './VariablePicker';

interface HttpRequestConfigProps {
  nodeId: string;
  data?: Record<string, any>;
}

const HttpRequestConfig: React.FC<HttpRequestConfigProps> = ({ nodeId, data }) => {
  const { updateNodeData } = useWorkflowStore();

  const [selectedApiId, setSelectedApiId] = useState<string>(data?.apiId || '');
  const [selectedEndpointId, setSelectedEndpointId] = useState<string>(data?.endpointId || '');
  const [requestBody, setRequestBody] = useState<string>(
    data?.requestBody ? JSON.stringify(data.requestBody, null, 2) : ''
  );

  // State for parameter overrides
  const [headerOverrides, setHeaderOverrides] = useState<Record<string, string>>(data?.headers || {});
  const [queryParamOverrides, setQueryParamOverrides] = useState<Record<string, string>>(data?.queryParams || {});

  // State for custom parameters
  const [customHeaders, setCustomHeaders] = useState<{ key: string; value: string }[]>([]);
  const [customQueryParams, setCustomQueryParams] = useState<{ key: string; value: string }[]>([]);

  // State for active variable picker
  const [activePicker, setActivePicker] = useState<{ id: string; rect: DOMRect } | null>(null);

  // Use the centralized hook for fetching APIs
  const { data: apis, isLoading: isLoadingApis } = useApis();

  // Fetch full details for the selected API
  const { data: selectedApiDetails, isLoading: isLoadingDetails } = useApi(selectedApiId);

  // Use the detailed API data if available, otherwise fall back to the list item
  const selectedApi = selectedApiDetails || apis?.find(api => api.id === selectedApiId);

  const selectedEndpoint = selectedApi?.endpoints.find(ep => ep.id === selectedEndpointId);

  // Reset local state when data changes (e.g. initial load)
  useEffect(() => {
    setSelectedApiId(data?.apiId || '');
    setSelectedEndpointId(data?.endpointId || '');
    setRequestBody(data?.requestBody ? JSON.stringify(data.requestBody, null, 2) : '');

    // Separate defined overrides from custom values
    // This logic runs when data is loaded from the node
    const headers = data?.headers || {};
    const queryParams = data?.queryParams || {};

    // We can't fully separate them without the endpoint definition, 
    // but we can initialize the overrides. 
    // The separation happens when we render or when we save.
    // For now, let's load everything into overrides if we don't have the endpoint yet,
    // or try to split if we do.

    // Actually, a simpler approach for initialization:
    // Load everything into overrides initially. 
    // Then, once the endpoint is loaded, we can filter out the ones that are NOT in the endpoint definition
    // and move them to custom.
    setHeaderOverrides(headers);
    setQueryParamOverrides(queryParams);
  }, [nodeId]);

  // Effect to split defined vs custom when endpoint is loaded
  useEffect(() => {
    if (selectedEndpoint && data) {
      const normalizeToParams = (input: any): { name: string; value: string; required?: boolean; description?: string }[] => {
        if (!input) return [];
        if (Array.isArray(input)) return input;
        if (typeof input === 'object') {
          return Object.entries(input).map(([key, value]) => ({
            name: key,
            value: String(value),
            required: false
          }));
        }
        return [];
      };

      const headersList = normalizeToParams(selectedEndpoint.headers);
      const queryParamsList = normalizeToParams(selectedEndpoint.queryParams);

      const definedHeaderNames = new Set(headersList.map(h => h.name));
      const definedQueryParamNames = new Set(queryParamsList.map(p => p.name));

      const allHeaders = data.headers || {};
      const allQueryParams = data.queryParams || {};

      const newHeaderOverrides: Record<string, string> = {};
      const newCustomHeaders: { key: string; value: string }[] = [];

      Object.entries(allHeaders).forEach(([key, value]) => {
        if (definedHeaderNames.has(key)) {
          newHeaderOverrides[key] = value as string;
        } else {
          newCustomHeaders.push({ key, value: value as string });
        }
      });

      const newQueryParamOverrides: Record<string, string> = {};
      const newCustomQueryParams: { key: string; value: string }[] = [];

      Object.entries(allQueryParams).forEach(([key, value]) => {
        if (definedQueryParamNames.has(key)) {
          newQueryParamOverrides[key] = value as string;
        } else {
          newCustomQueryParams.push({ key, value: value as string });
        }
      });

      setHeaderOverrides(newHeaderOverrides);
      setCustomHeaders(newCustomHeaders);
      setQueryParamOverrides(newQueryParamOverrides);
      setCustomQueryParams(newCustomQueryParams);
    }
  }, [selectedEndpoint, nodeId]); // Depend on selectedEndpoint to trigger split

  // Update store when local state changes
  useEffect(() => {
    if (selectedApiId || selectedEndpointId) {
      let bodyData = undefined;
      try {
        bodyData = requestBody ? JSON.parse(requestBody) : undefined;
      } catch (e) {
        // Ignore invalid JSON
      }

      // Merge overrides and custom values
      const mergedHeaders = { ...headerOverrides };
      customHeaders.forEach(({ key, value }) => {
        if (key && value) mergedHeaders[key] = value;
      });

      const mergedQueryParams = { ...queryParamOverrides };
      customQueryParams.forEach(({ key, value }) => {
        if (key && value) mergedQueryParams[key] = value;
      });

      updateNodeData(nodeId, {
        apiId: selectedApiId,
        endpointId: selectedEndpointId,
        method: (selectedEndpoint as any)?.method || (selectedEndpoint as any)?.httpMethod,
        path: (selectedEndpoint as any)?.path || (selectedEndpoint as any)?.endpointPath,
        requestBody: bodyData,
        headers: mergedHeaders,
        queryParams: mergedQueryParams,
      });
    }
  }, [selectedApiId, selectedEndpointId, selectedEndpoint, requestBody, headerOverrides, queryParamOverrides, customHeaders, customQueryParams, nodeId, updateNodeData]);

  const handleApiChange = (apiId: string) => {
    setSelectedApiId(apiId);
    setSelectedEndpointId('');
    setHeaderOverrides({});
    setQueryParamOverrides({});
    setCustomHeaders([]);
    setCustomQueryParams([]);
  };

  const handleHeaderChange = (name: string, value: string) => {
    setHeaderOverrides(prev => ({ ...prev, [name]: value }));
  };

  const handleQueryParamChange = (name: string, value: string) => {
    setQueryParamOverrides(prev => ({ ...prev, [name]: value }));
  };

  const insertVariable = (variable: string, currentValue: string, onChange: (val: string) => void, mode: 'replace' | 'append' = 'replace') => {
    if (mode === 'append') {
      onChange(currentValue + variable);
    } else {
      onChange(variable);
    }
    setActivePicker(null);
  };

  const renderInputWithPicker = (
    id: string,
    value: string,
    onChange: (val: string) => void,
    placeholder?: string,
    className: string = "w-full"
  ) => (
    <div className="relative flex-1">
      <div className="flex gap-1">
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={className}
          placeholder={placeholder}
        />
        <button
          type="button"
          onClick={(e) => {
            if (activePicker?.id === id) {
              setActivePicker(null);
            } else {
              const rect = e.currentTarget.getBoundingClientRect();
              setActivePicker({ id, rect });
            }
          }}
          className={`p-2 text-gray-400 hover:text-blue-600 rounded-md border border-transparent hover:bg-blue-50 ${activePicker?.id === id ? 'text-blue-600 bg-blue-50 border-blue-200' : ''}`}
          title="Insert Variable"
        >
          <Braces className="w-4 h-4" />
        </button>
      </div>
      {activePicker?.id === id && (
        <VariablePicker
          nodeId={nodeId}
          onSelect={(variable) => insertVariable(variable, value, onChange)}
          onClose={() => setActivePicker(null)}
          anchorRect={activePicker.rect}
        />
      )}
    </div>
  );

  return (
    <div className="space-y-4">
      {/* API Selection */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          API
        </label>
        <select
          value={selectedApiId}
          onChange={(e) => handleApiChange(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
          disabled={isLoadingApis}
        >
          <option value="">Select an API...</option>
          {apis?.map((api) => (
            <option key={api.id} value={api.id}>
              {api.name}
            </option>
          ))}
        </select>
        {isLoadingApis && (
          <p className="text-xs text-gray-500">Loading APIs...</p>
        )}
      </div>

      {/* Endpoint Selection */}
      {selectedApiId && (
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Endpoint
          </label>
          {isLoadingDetails ? (
            <p className="text-xs text-gray-500">Loading API details...</p>
          ) : (
            <select
              value={selectedEndpointId}
              onChange={(e) => setSelectedEndpointId(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              disabled={!selectedApi}
            >
              <option value="">Select an endpoint...</option>
              {selectedApi?.endpoints.map((endpoint: any) => (
                <option key={endpoint.id} value={endpoint.id}>
                  {endpoint.method || endpoint.httpMethod} - {endpoint.name}
                </option>
              ))}
            </select>
          )}
        </div>
      )}

      {/* Endpoint Details & Inputs */}
      {selectedEndpoint && (
        <div className="space-y-4">
          <div className="bg-gray-50 p-3 rounded-md space-y-3 border border-gray-200">
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <span className="font-medium text-gray-700 block">Method</span>
                {(() => {
                  const method = (selectedEndpoint as any).method || (selectedEndpoint as any).httpMethod;
                  return (
                    <span className={`font-mono font-bold ${method === 'GET' ? 'text-blue-600' :
                      method === 'POST' ? 'text-green-600' :
                        method === 'PUT' ? 'text-orange-600' :
                          method === 'DELETE' ? 'text-red-600' :
                            'text-gray-900'
                      }`}>{method}</span>
                  );
                })()}
              </div>
              <div>
                <span className="font-medium text-gray-700 block">Path</span>
                <span className="text-gray-900 font-mono break-all">{(selectedEndpoint as any).path || (selectedEndpoint as any).endpointPath}</span>
              </div>
              <div className="col-span-2">
                <span className="font-medium text-gray-700 block">Base URL</span>
                <span className="text-gray-900 font-mono break-all text-[10px]">{selectedApi?.baseUrl}</span>
              </div>
            </div>
            {selectedEndpoint.description && (
              <div className="text-xs">
                <span className="font-medium text-gray-700 block">Description</span>
                <p className="text-gray-600">{selectedEndpoint.description}</p>
              </div>
            )}
          </div>

          {/* Headers Input */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="block text-sm font-medium text-gray-700">Headers</label>
              <button
                type="button"
                onClick={() => setCustomHeaders([...customHeaders, { key: '', value: '' }])}
                className="text-xs text-blue-600 hover:text-blue-700 flex items-center gap-1"
              >
                <Plus className="w-3 h-3" /> Add Header
              </button>
            </div>

            <div className="space-y-2">
              {/* Defined Headers */}
              {(() => {
                const normalizeToParams = (input: any): { name: string; value: string; required?: boolean; description?: string }[] => {
                  if (!input) return [];
                  if (Array.isArray(input)) return input;
                  if (typeof input === 'object') {
                    return Object.entries(input).map(([key, value]) => ({
                      name: key,
                      value: String(value),
                      required: false
                    }));
                  }
                  return [];
                };

                const headersList = normalizeToParams(selectedEndpoint.headers);

                return headersList.map((header, idx) => {
                  const isOverridden = header.name in headerOverrides;
                  const currentValue = headerOverrides[header.name] ?? (typeof header.value === 'string' ? header.value : '');

                  return (
                    <div key={`defined-${idx}`} className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <label className="font-medium text-gray-700 flex items-center gap-1">
                          {header.name}
                          {header.required && <span className="text-red-500">*</span>}
                          {isOverridden && <span className="text-[10px] bg-blue-100 text-blue-700 px-1 rounded">Overridden</span>}
                        </label>
                        {header.description && (
                          <span className="text-gray-500 italic">{header.description}</span>
                        )}
                      </div>
                      {renderInputWithPicker(
                        `header-defined-${header.name}`,
                        currentValue,
                        (val) => handleHeaderChange(header.name, val),
                        typeof header.value === 'string' ? header.value : 'Value',
                        `w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm ${isOverridden ? 'border-blue-300 bg-blue-50' : 'border-gray-300'}`
                      )}
                    </div>
                  );
                });
              })()}

              {/* Custom Headers */}
              {customHeaders.map((header, idx) => (
                <div key={`custom-${idx}`} className="flex gap-2 items-start">
                  <input
                    type="text"
                    value={header.key}
                    onChange={(e) => {
                      const newHeaders = [...customHeaders];
                      newHeaders[idx].key = e.target.value;
                      setCustomHeaders(newHeaders);
                    }}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
                    placeholder="Key"
                  />
                  {renderInputWithPicker(
                    `header-custom-${idx}`,
                    header.value,
                    (val) => {
                      const newHeaders = [...customHeaders];
                      newHeaders[idx].value = val;
                      setCustomHeaders(newHeaders);
                    },
                    "Value",
                    "w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
                  )}
                  <button
                    type="button"
                    onClick={() => {
                      const newHeaders = customHeaders.filter((_, i) => i !== idx);
                      setCustomHeaders(newHeaders);
                    }}
                    className="p-2 text-red-500 hover:text-red-700"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Query Params Input */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="block text-sm font-medium text-gray-700">Query Parameters</label>
              <button
                type="button"
                onClick={() => setCustomQueryParams([...customQueryParams, { key: '', value: '' }])}
                className="text-xs text-blue-600 hover:text-blue-700 flex items-center gap-1"
              >
                <Plus className="w-3 h-3" /> Add Param
              </button>
            </div>

            <div className="space-y-2">
              {/* Defined Query Params */}
              {(() => {
                const normalizeToParams = (input: any): { name: string; value: string; required?: boolean; description?: string }[] => {
                  if (!input) return [];
                  if (Array.isArray(input)) return input;
                  if (typeof input === 'object') {
                    return Object.entries(input).map(([key, value]) => ({
                      name: key,
                      value: String(value),
                      required: false
                    }));
                  }
                  return [];
                };

                const queryParamsList = normalizeToParams(selectedEndpoint.queryParams);

                return queryParamsList.map((param, idx) => {
                  const isOverridden = param.name in queryParamOverrides;
                  const currentValue = queryParamOverrides[param.name] ?? (typeof param.value === 'string' ? param.value : '');

                  return (
                    <div key={`defined-${idx}`} className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <label className="font-medium text-gray-700 flex items-center gap-1">
                          {param.name}
                          {param.required && <span className="text-red-500">*</span>}
                          {isOverridden && <span className="text-[10px] bg-blue-100 text-blue-700 px-1 rounded">Overridden</span>}
                        </label>
                        {param.description && (
                          <span className="text-gray-500 italic">{param.description}</span>
                        )}
                      </div>
                      {renderInputWithPicker(
                        `query-defined-${param.name}`,
                        currentValue,
                        (val) => handleQueryParamChange(param.name, val),
                        typeof param.value === 'string' ? param.value : 'Value',
                        `w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm ${isOverridden ? 'border-blue-300 bg-blue-50' : 'border-gray-300'}`
                      )}
                    </div>
                  );
                });
              })()}

              {/* Custom Query Params */}
              {customQueryParams.map((param, idx) => (
                <div key={`custom-${idx}`} className="flex gap-2 items-start">
                  <input
                    type="text"
                    value={param.key}
                    onChange={(e) => {
                      const newParams = [...customQueryParams];
                      newParams[idx].key = e.target.value;
                      setCustomQueryParams(newParams);
                    }}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
                    placeholder="Key"
                  />
                  {renderInputWithPicker(
                    `query-custom-${idx}`,
                    param.value,
                    (val) => {
                      const newParams = [...customQueryParams];
                      newParams[idx].value = val;
                      setCustomQueryParams(newParams);
                    },
                    "Value",
                    "w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
                  )}
                  <button
                    type="button"
                    onClick={() => {
                      const newParams = customQueryParams.filter((_, i) => i !== idx);
                      setCustomQueryParams(newParams);
                    }}
                    className="p-2 text-red-500 hover:text-red-700"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Request Body */}
          {['POST', 'PUT', 'PATCH'].includes((selectedEndpoint as any).method || (selectedEndpoint as any).httpMethod) && (
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="block text-sm font-medium text-gray-700">
                  Request Body (JSON)
                </label>
                <div className="flex gap-2">
                  {requestBody && requestBody !== (selectedEndpoint.requestBody?.example ? JSON.stringify(selectedEndpoint.requestBody.example, null, 2) : '') && (
                    <button
                      onClick={() => setRequestBody('')}
                      className="text-xs text-red-600 hover:text-red-700 font-medium"
                    >
                      Clear
                    </button>
                  )}
                  {selectedEndpoint.requestBody?.example && (
                    <button
                      onClick={() => setRequestBody(JSON.stringify(selectedEndpoint.requestBody?.example, null, 2))}
                      className="text-xs text-primary-600 hover:text-primary-700 font-medium"
                    >
                      Load Example
                    </button>
                  )}
                </div>
              </div>
              <div className="relative">
                <textarea
                  value={requestBody}
                  onChange={(e) => setRequestBody(e.target.value)}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 font-mono text-xs ${requestBody ? 'border-blue-300 bg-blue-50' : 'border-gray-300'
                    }`}
                  rows={8}
                  placeholder='{\n  "key": "value"\n}'
                />
                <div className="absolute top-2 right-2">
                  <button
                    type="button"
                    onClick={(e) => {
                      if (activePicker?.id === 'body') {
                        setActivePicker(null);
                      } else {
                        const rect = e.currentTarget.getBoundingClientRect();
                        setActivePicker({ id: 'body', rect });
                      }
                    }}
                    className={`p-1.5 text-gray-400 hover:text-blue-600 rounded-md border border-gray-200 bg-white shadow-sm hover:bg-blue-50 ${activePicker?.id === 'body' ? 'text-blue-600 border-blue-200' : ''}`}
                    title="Insert Variable"
                  >
                    <Braces className="w-4 h-4" />
                  </button>
                  {activePicker?.id === 'body' && (
                    <VariablePicker
                      nodeId={nodeId}
                      onSelect={(variable) => insertVariable(variable, requestBody, setRequestBody, 'append')}
                      onClose={() => setActivePicker(null)}
                      anchorRect={activePicker.rect}
                    />
                  )}
                </div>
              </div>
              {selectedEndpoint.requestBody?.schema && (
                <p className="text-xs text-gray-500 italic">
                  Schema validation available
                </p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default HttpRequestConfig;
