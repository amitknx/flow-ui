import React, { useState } from 'react';
import { X, Play, AlertCircle } from 'lucide-react';
import type { ApiEndpoint } from '../../types/api-new';

interface TestEndpointModalProps {
  endpoint: ApiEndpoint;
  onClose: () => void;
  onTest: (params: {
    pathParams?: Record<string, string>;
    queryParams?: Record<string, string>;
    overrideAuthentication?: any;
  }) => Promise<void>;
  testing: boolean;
}

export const TestEndpointModal: React.FC<TestEndpointModalProps> = ({
  endpoint,
  onClose,
  onTest,
  testing,
}) => {
  const [pathParams, setPathParams] = useState<Record<string, string>>({});
  const [queryParams, setQueryParams] = useState<Record<string, string>>({});
  const [useCustomAuth, setUseCustomAuth] = useState(false);
  const [authType, setAuthType] = useState<string>('BEARER');
  const [authToken, setAuthToken] = useState('');
  const [newParamName, setNewParamName] = useState('');

  const [headers, setHeaders] = useState<Record<string, string>>({});
  const [newHeaderName, setNewHeaderName] = useState('');
  const [requestBody, setRequestBody] = useState<string>(
    endpoint.requestBody?.example ? JSON.stringify(endpoint.requestBody.example, null, 2) : ''
  );

  // Parse path parameters from endpoint path
  const pathParamKeys = React.useMemo(() => {
    const matches = endpoint.endpointPath.match(/\{([^}]+)\}/g);
    return matches ? matches.map(m => m.slice(1, -1)) : [];
  }, [endpoint.endpointPath]);

  // Parse query parameters from endpoint config
  const queryParamKeys = React.useMemo(() => {
    return endpoint.queryParams ? (Array.isArray(endpoint.queryParams) ? endpoint.queryParams.map(p => p.name) : Object.keys(endpoint.queryParams)) : [];
  }, [endpoint.queryParams]);

  // Initialize headers from endpoint config
  React.useEffect(() => {
    if (endpoint.headers) {
      const initialHeaders: Record<string, string> = {};
      if (Array.isArray(endpoint.headers)) {
        endpoint.headers.forEach(h => {
          initialHeaders[h.name] = typeof h.value === 'string' ? h.value : '';
        });
      } else {
        Object.entries(endpoint.headers).forEach(([k, v]) => {
          initialHeaders[k] = typeof v === 'string' ? v : '';
        });
      }
      setHeaders(initialHeaders);
    }
  }, [endpoint.headers]);

  const handleTest = async () => {
    const params: any = {};

    if (pathParamKeys.length > 0) {
      params.pathParams = pathParams;
    }

    if (queryParamKeys.length > 0 || Object.keys(queryParams).length > 0) {
      params.queryParams = queryParams;
    }

    if (Object.keys(headers).length > 0) {
      params.headers = headers;
    }

    if (['POST', 'PUT', 'PATCH'].includes(endpoint.httpMethod) && requestBody) {
      try {
        params.requestBody = JSON.parse(requestBody);
      } catch (e) {
        console.error('Invalid JSON body');
        // You might want to show an error to the user here
      }
    }

    if (useCustomAuth && authToken) {
      params.overrideAuthentication = {
        type: authType,
        token: authToken,
      };
    }

    await onTest(params);
  };

  const updatePathParam = (key: string, value: string) => {
    setPathParams(prev => ({ ...prev, [key]: value }));
  };

  const updateQueryParam = (key: string, value: string) => {
    setQueryParams(prev => ({ ...prev, [key]: value }));
  };

  const updateHeader = (key: string, value: string) => {
    setHeaders(prev => ({ ...prev, [key]: value }));
  };



  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 sticky top-0 bg-white z-10">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Test Endpoint</h2>
            <p className="text-sm text-gray-600 mt-1 font-mono">
              <span className={`inline-block px-2 py-0.5 rounded text-xs font-bold mr-2 ${endpoint.httpMethod === 'GET' ? 'bg-blue-100 text-blue-800' :
                endpoint.httpMethod === 'POST' ? 'bg-green-100 text-green-800' :
                  endpoint.httpMethod === 'PUT' ? 'bg-orange-100 text-orange-800' :
                    endpoint.httpMethod === 'DELETE' ? 'bg-red-100 text-red-800' :
                      'bg-gray-100 text-gray-800'
                }`}>
                {endpoint.httpMethod}
              </span>
              {endpoint.endpointPath}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
            disabled={testing}
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-8">
          {/* Path Parameters */}
          {pathParamKeys.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-3 uppercase tracking-wider">Path Parameters</h3>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {pathParamKeys.map(key => (
                  <div key={key}>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      {key} <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={pathParams[key] || ''}
                      onChange={(e) => updatePathParam(key, e.target.value)}
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm px-3 py-2"
                      placeholder={`Value for {${key}}`}
                      disabled={testing}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Query Parameters */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-3 uppercase tracking-wider">Query Parameters</h3>
            <div className="space-y-3 bg-gray-50 p-4 rounded-lg border border-gray-200">
              {/* Defined Params */}
              {queryParamKeys.map(key => (
                <div key={key} className="grid grid-cols-3 gap-3 items-center">
                  <label className="block text-sm font-medium text-gray-700 col-span-1 truncate" title={key}>
                    {key}
                  </label>
                  <input
                    type="text"
                    value={queryParams[key] || ''}
                    onChange={(e) => updateQueryParam(key, e.target.value)}
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm px-3 py-2 col-span-2"
                    placeholder="Value"
                    disabled={testing}
                  />
                </div>
              ))}

              {/* Custom Params */}
              {Object.entries(queryParams)
                .filter(([key]) => !queryParamKeys.includes(key))
                .map(([key, value]) => (
                  <div key={key} className="grid grid-cols-3 gap-3 items-center">
                    <div className="col-span-1 flex items-center gap-2">
                      <button
                        onClick={() => {
                          const newParams = { ...queryParams };
                          delete newParams[key];
                          setQueryParams(newParams);
                        }}
                        className="text-gray-400 hover:text-red-600"
                        disabled={testing}
                      >
                        <X className="w-3 h-3" />
                      </button>
                      <span className="text-sm font-medium text-gray-700 truncate" title={key}>{key}</span>
                    </div>
                    <input
                      type="text"
                      value={value}
                      onChange={(e) => updateQueryParam(key, e.target.value)}
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm px-3 py-2 col-span-2"
                      disabled={testing}
                    />
                  </div>
                ))}

              {/* Add New Param */}
              <div className="flex gap-2 pt-2 border-t border-gray-200 mt-2">
                <input
                  type="text"
                  value={newParamName}
                  onChange={(e) => setNewParamName(e.target.value)}
                  className="block w-1/3 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-xs px-2 py-1.5"
                  placeholder="New param name"
                  disabled={testing}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      if (newParamName.trim() && !queryParams[newParamName.trim()]) {
                        setQueryParams(prev => ({ ...prev, [newParamName.trim()]: '' }));
                        setNewParamName('');
                      }
                    }
                  }}
                />
                <button
                  onClick={() => {
                    if (newParamName.trim() && !queryParams[newParamName.trim()]) {
                      setQueryParams(prev => ({ ...prev, [newParamName.trim()]: '' }));
                      setNewParamName('');
                    }
                  }}
                  className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded text-blue-700 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                  disabled={testing || !newParamName.trim()}
                >
                  Add
                </button>
              </div>
            </div>
          </div>

          {/* Headers */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-3 uppercase tracking-wider">Headers</h3>
            <div className="space-y-3 bg-gray-50 p-4 rounded-lg border border-gray-200">
              {Object.entries(headers).map(([key, value]) => (
                <div key={key} className="grid grid-cols-3 gap-3 items-center">
                  <div className="col-span-1 flex items-center gap-2">
                    <button
                      onClick={() => {
                        const newHeaders = { ...headers };
                        delete newHeaders[key];
                        setHeaders(newHeaders);
                      }}
                      className="text-gray-400 hover:text-red-600"
                      disabled={testing}
                    >
                      <X className="w-3 h-3" />
                    </button>
                    <span className="text-sm font-medium text-gray-700 truncate" title={key}>{key}</span>
                  </div>
                  <input
                    type="text"
                    value={value}
                    onChange={(e) => updateHeader(key, e.target.value)}
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm px-3 py-2 col-span-2"
                    placeholder="Value"
                    disabled={testing}
                  />
                </div>
              ))}

              {/* Add New Header */}
              <div className="flex gap-2 pt-2 border-t border-gray-200 mt-2">
                <input
                  type="text"
                  value={newHeaderName}
                  onChange={(e) => setNewHeaderName(e.target.value)}
                  className="block w-1/3 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-xs px-2 py-1.5"
                  placeholder="New header name"
                  disabled={testing}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      if (newHeaderName.trim() && !headers[newHeaderName.trim()]) {
                        setHeaders(prev => ({ ...prev, [newHeaderName.trim()]: '' }));
                        setNewHeaderName('');
                      }
                    }
                  }}
                />
                <button
                  onClick={() => {
                    if (newHeaderName.trim() && !headers[newHeaderName.trim()]) {
                      setHeaders(prev => ({ ...prev, [newHeaderName.trim()]: '' }));
                      setNewHeaderName('');
                    }
                  }}
                  className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded text-blue-700 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                  disabled={testing || !newHeaderName.trim()}
                >
                  Add
                </button>
              </div>
            </div>
          </div>

          {/* Request Body */}
          {['POST', 'PUT', 'PATCH'].includes(endpoint.httpMethod) && (
            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-3 uppercase tracking-wider">Request Body</h3>
              <div className="relative">
                <textarea
                  value={requestBody}
                  onChange={(e) => setRequestBody(e.target.value)}
                  rows={8}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 font-mono text-sm px-3 py-2"
                  placeholder='{\n  "key": "value"\n}'
                  disabled={testing}
                />
                <div className="absolute top-2 right-2">
                  <button
                    onClick={() => {
                      try {
                        const formatted = JSON.stringify(JSON.parse(requestBody), null, 2);
                        setRequestBody(formatted);
                      } catch (e) {
                        // Ignore error
                      }
                    }}
                    className="text-xs text-gray-500 hover:text-blue-600 bg-white bg-opacity-80 px-2 py-1 rounded border border-gray-200"
                    title="Format JSON"
                  >
                    Format
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Custom Authentication */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-3 uppercase tracking-wider">Authentication</h3>
            <div className="flex items-center gap-2 mb-3">
              <input
                type="checkbox"
                id="customAuth"
                checked={useCustomAuth}
                onChange={(e) => setUseCustomAuth(e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                disabled={testing}
              />
              <label htmlFor="customAuth" className="text-sm font-medium text-gray-900">
                Override Authentication
              </label>
            </div>

            {useCustomAuth && (
              <div className="space-y-3 pl-6 border-l-2 border-gray-200 ml-1">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Authentication Type
                  </label>
                  <select
                    value={authType}
                    onChange={(e) => setAuthType(e.target.value)}
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm px-3 py-2"
                    disabled={testing}
                  >
                    <option value="BEARER">Bearer Token</option>
                    <option value="BASIC">Basic Auth</option>
                    <option value="API_KEY">API Key</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Token / Credentials
                  </label>
                  <input
                    type="text"
                    value={authToken}
                    onChange={(e) => setAuthToken(e.target.value)}
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm px-3 py-2"
                    placeholder="Enter token or credentials"
                    disabled={testing}
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 bg-gray-50">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 shadow-sm"
            disabled={testing}
          >
            Cancel
          </button>
          <button
            onClick={handleTest}
            disabled={testing}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
          >
            {testing ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                Testing...
              </>
            ) : (
              <>
                <Play className="w-4 h-4" />
                Run Test
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
