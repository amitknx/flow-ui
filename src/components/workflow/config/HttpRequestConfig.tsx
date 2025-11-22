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

  // Use the centralized hook for fetching APIs
  const { data: apis, isLoading: isLoadingApis } = useApis();

  // Fetch full details for the selected API
  const { data: selectedApiDetails, isLoading: isLoadingDetails } = useApi(selectedApiId);

  // Use the detailed API data if available, otherwise fall back to the list item (which might be partial)
  // In this architecture, list items seem to be full ApiConfig objects too, but useApi ensures we have the latest
  const selectedApi = selectedApiDetails || apis?.find(api => api.id === selectedApiId);

  const selectedEndpoint = selectedApi?.endpoints.find(ep => ep.id === selectedEndpointId);

  useEffect(() => {
    // Only update if we have valid selections
    // We allow empty requestBody
    if (selectedApiId || selectedEndpointId) {
      let bodyData = undefined;
      try {
        bodyData = requestBody ? JSON.parse(requestBody) : undefined;
      } catch (e) {
        // Invalid JSON, don't update body yet or handle error
        // For now we just ignore invalid JSON in the store update
      }

      updateNodeData(nodeId, {
        apiId: selectedApiId,
        endpointId: selectedEndpointId,
        requestBody: bodyData,
      });
    }
  }, [selectedApiId, selectedEndpointId, requestBody, nodeId, updateNodeData]);

  const handleApiChange = (apiId: string) => {
    setSelectedApiId(apiId);
    setSelectedEndpointId(''); // Reset endpoint when API changes
  };

  const handleRequestBodyChange = (value: string) => {
    setRequestBody(value);
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

      {/* Endpoint Details */}
      {selectedEndpoint && (
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

          {/* Headers */}
          {selectedEndpoint.headers && selectedEndpoint.headers.length > 0 && (
            <div className="text-xs">
              <span className="font-medium text-gray-700 block mb-1">Headers</span>
              <div className="bg-white border border-gray-200 rounded p-2 max-h-24 overflow-y-auto">
                {selectedEndpoint.headers.map((header, idx) => (
                  <div key={idx} className="flex justify-between py-1 border-b border-gray-100 last:border-0">
                    <span className="text-gray-600 font-mono">{header.name}</span>
                    <span className="text-gray-400 italic">{header.required ? 'Required' : 'Optional'}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Query Params */}
          {selectedEndpoint.queryParams && Object.keys(selectedEndpoint.queryParams).length > 0 && (
            <div className="text-xs">
              <span className="font-medium text-gray-700 block mb-1">Query Parameters</span>
              <div className="bg-white border border-gray-200 rounded p-2 max-h-24 overflow-y-auto">
                {Object.entries(selectedEndpoint.queryParams).map(([key, value], idx) => (
                  <div key={idx} className="flex justify-between py-1 border-b border-gray-100 last:border-0">
                    <span className="text-gray-600 font-mono">{key}</span>
                    {/* Value might be a SecretReference or string, simplifying display */}
                    <span className="text-gray-400 italic truncate max-w-[100px]">
                      {typeof value === 'object' ? 'Secret' : value}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Request Body */}
      {selectedEndpoint && ['POST', 'PUT', 'PATCH'].includes(selectedEndpoint.method) && (
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
            onChange={(e) => handleRequestBodyChange(e.target.value)}
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
  );
};

export default HttpRequestConfig;
