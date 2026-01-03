import React, { useState, useEffect } from 'react';
import { useWorkflowStore } from '../../../stores/workflow';
import { useApis, useApi } from '../../../hooks/useApiManagement';


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

  // Use the centralized hook for fetching APIs
  const { data: apis, isLoading: isLoadingApis } = useApis();

  // Fetch full details for the selected API
  const { data: selectedApiDetails, isLoading: isLoadingDetails } = useApi(selectedApiId);

  // Use the detailed API data if available, otherwise fall back to the list item
  const selectedApi = selectedApiDetails || apis?.find(api => api.id === selectedApiId);

  const selectedEndpoint = selectedApi?.endpoints.find(ep => ep.id === selectedEndpointId);

  // Reset local state when nodeId changes
  useEffect(() => {
    setSelectedApiId(data?.apiId || '');
    setSelectedEndpointId(data?.endpointId || '');
    setRequestBody(data?.requestBody ? JSON.stringify(data.requestBody, null, 2) : '');
    setHeaderOverrides(data?.headers || {});
    setQueryParamOverrides(data?.queryParams || {});
  }, [nodeId]);

  // Update store when local state changes
  useEffect(() => {
    if (selectedApiId || selectedEndpointId) {
      let bodyData = undefined;
      try {
        bodyData = requestBody ? JSON.parse(requestBody) : undefined;
      } catch (e) {
        // Ignore invalid JSON
      }

      updateNodeData(nodeId, {
        apiId: selectedApiId,
        endpointId: selectedEndpointId,
        requestBody: bodyData,
        headers: headerOverrides,
        queryParams: queryParamOverrides,
      });
    }
  }, [selectedApiId, selectedEndpointId, requestBody, headerOverrides, queryParamOverrides, nodeId, updateNodeData]);

  const handleApiChange = (apiId: string) => {
    setSelectedApiId(apiId);
    setSelectedEndpointId('');
    setHeaderOverrides({});
    setQueryParamOverrides({});
  };

  const handleHeaderChange = (name: string, value: string) => {
    setHeaderOverrides(prev => ({ ...prev, [name]: value }));
  };

  const handleQueryParamChange = (name: string, value: string) => {
    setQueryParamOverrides(prev => ({ ...prev, [name]: value }));
  };

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
              {selectedApi?.endpoints.map((endpoint) => (
                <option key={endpoint.id} value={endpoint.id}>
                  {endpoint.method} - {endpoint.name}
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
                <span className="text-gray-900 font-mono">{selectedEndpoint.method}</span>
              </div>
              <div>
                <span className="font-medium text-gray-700 block">Path</span>
                <span className="text-gray-900 font-mono break-all">{selectedEndpoint.path}</span>
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
          {selectedEndpoint.headers && selectedEndpoint.headers.length > 0 && (
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Headers</label>
              <div className="space-y-2">
                {selectedEndpoint.headers.map((header, idx) => {
                  const currentValue = headerOverrides[header.name] ?? (typeof header.value === 'string' ? header.value : '');
                  return (
                    <div key={idx} className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <label className="font-medium text-gray-700">
                          {header.name} {header.required && <span className="text-red-500">*</span>}
                        </label>
                        {header.description && (
                          <span className="text-gray-500 italic">{header.description}</span>
                        )}
                      </div>
                      <input
                        type="text"
                        value={currentValue}
                        onChange={(e) => handleHeaderChange(header.name, e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
                        placeholder={typeof header.value === 'string' ? header.value : 'Value'}
                      />
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Query Params Input */}
          {selectedEndpoint.queryParams && Array.isArray(selectedEndpoint.queryParams) && selectedEndpoint.queryParams.length > 0 && (
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Query Parameters</label>
              <div className="space-y-2">
                {selectedEndpoint.queryParams.map((param, idx) => {
                  const currentValue = queryParamOverrides[param.name] ?? (typeof param.value === 'string' ? param.value : '');
                  return (
                    <div key={idx} className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <label className="font-medium text-gray-700">
                          {param.name} {param.required && <span className="text-red-500">*</span>}
                        </label>
                        {param.description && (
                          <span className="text-gray-500 italic">{param.description}</span>
                        )}
                      </div>
                      <input
                        type="text"
                        value={currentValue}
                        onChange={(e) => handleQueryParamChange(param.name, e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
                        placeholder={typeof param.value === 'string' ? param.value : 'Value'}
                      />
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Request Body */}
          {['POST', 'PUT', 'PATCH'].includes(selectedEndpoint.method) && (
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="block text-sm font-medium text-gray-700">
                  Request Body (JSON)
                </label>
                {selectedEndpoint.requestBody?.example && (
                  <button
                    onClick={() => setRequestBody(JSON.stringify(selectedEndpoint.requestBody?.example, null, 2))}
                    className="text-xs text-primary-600 hover:text-primary-700 font-medium"
                  >
                    Load Example
                  </button>
                )}
              </div>
              <textarea
                value={requestBody}
                onChange={(e) => setRequestBody(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 font-mono text-xs"
                rows={8}
                placeholder='{\n  "key": "value"\n}'
              />
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
