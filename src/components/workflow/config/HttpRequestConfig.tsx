import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useWorkflowStore } from '../../../stores/workflow';
import { apiManagementService } from '../../../services/api-management';
import type { ApiConfig, ApiEndpoint } from '../../../types/api';

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

  const { data: apis, isLoading } = useQuery({
    queryKey: ['apis'],
    queryFn: () => apiManagementService.listApis(),
  });

  const selectedApi = apis?.find(api => api.id === selectedApiId);
  const selectedEndpoint = selectedApi?.endpoints.find(ep => ep.id === selectedEndpointId);

  useEffect(() => {
    if (selectedApiId || selectedEndpointId || requestBody) {
      const bodyData = requestBody ? JSON.parse(requestBody) : undefined;
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
          disabled={isLoading}
        >
          <option value="">Select an API...</option>
          {apis?.map((api) => (
            <option key={api.id} value={api.id}>
              {api.name}
            </option>
          ))}
        </select>
        {isLoading && (
          <p className="text-xs text-gray-500">Loading APIs...</p>
        )}
      </div>

      {/* Endpoint Selection */}
      {selectedApi && (
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Endpoint
          </label>
          <select
            value={selectedEndpointId}
            onChange={(e) => setSelectedEndpointId(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="">Select an endpoint...</option>
            {selectedApi.endpoints.map((endpoint) => (
              <option key={endpoint.id} value={endpoint.id}>
                {endpoint.method} - {endpoint.name}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Endpoint Details */}
      {selectedEndpoint && (
        <div className="bg-gray-50 p-3 rounded-md space-y-2">
          <div className="text-xs">
            <span className="font-medium text-gray-700">Method:</span>
            <span className="ml-2 text-gray-900">{selectedEndpoint.method}</span>
          </div>
          <div className="text-xs">
            <span className="font-medium text-gray-700">Path:</span>
            <span className="ml-2 text-gray-900">{selectedEndpoint.path}</span>
          </div>
          {selectedEndpoint.description && (
            <div className="text-xs">
              <span className="font-medium text-gray-700">Description:</span>
              <p className="ml-2 text-gray-600">{selectedEndpoint.description}</p>
            </div>
          )}
        </div>
      )}

      {/* Request Body */}
      {selectedEndpoint && ['POST', 'PUT', 'PATCH'].includes(selectedEndpoint.method) && (
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Request Body (JSON)
          </label>
          <textarea
            value={requestBody}
            onChange={(e) => handleRequestBodyChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 font-mono text-xs"
            rows={8}
            placeholder='{\n  "key": "value"\n}'
          />
          {selectedEndpoint.requestBody?.example && (
            <button
              onClick={() => setRequestBody(JSON.stringify(selectedEndpoint.requestBody?.example, null, 2))}
              className="text-xs text-primary-600 hover:text-primary-700"
            >
              Use example
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default HttpRequestConfig;
