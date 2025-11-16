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

  // Parse path parameters from endpoint path
  const pathParamKeys = React.useMemo(() => {
    const matches = endpoint.endpointPath.match(/\{([^}]+)\}/g);
    return matches ? matches.map(m => m.slice(1, -1)) : [];
  }, [endpoint.endpointPath]);

  // Parse query parameters from endpoint config
  const queryParamKeys = React.useMemo(() => {
    return endpoint.queryParams ? Object.keys(endpoint.queryParams) : [];
  }, [endpoint.queryParams]);

  const handleTest = async () => {
    const params: any = {};

    if (pathParamKeys.length > 0) {
      params.pathParams = pathParams;
    }

    if (queryParamKeys.length > 0 || Object.keys(queryParams).length > 0) {
      params.queryParams = queryParams;
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

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Test Endpoint</h2>
            <p className="text-sm text-gray-600 mt-1">
              {endpoint.httpMethod} {endpoint.endpointPath}
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
        <div className="p-6 space-y-6">
          {/* Path Parameters */}
          {pathParamKeys.length > 0 && (
            <div>
              <h3 className="text-sm font-medium text-gray-900 mb-3">Path Parameters</h3>
              <div className="space-y-3">
                {pathParamKeys.map(key => (
                  <div key={key}>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {key}
                    </label>
                    <input
                      type="text"
                      value={pathParams[key] || ''}
                      onChange={(e) => updatePathParam(key, e.target.value)}
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                      placeholder={`Enter ${key}`}
                      disabled={testing}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Query Parameters */}
          {queryParamKeys.length > 0 && (
            <div>
              <h3 className="text-sm font-medium text-gray-900 mb-3">Query Parameters</h3>
              <div className="space-y-3">
                {queryParamKeys.map(key => (
                  <div key={key}>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {key}
                    </label>
                    <input
                      type="text"
                      value={queryParams[key] || ''}
                      onChange={(e) => updateQueryParam(key, e.target.value)}
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                      placeholder={`Enter ${key}`}
                      disabled={testing}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Additional Query Parameters */}
          <div>
            <h3 className="text-sm font-medium text-gray-900 mb-3">
              Additional Query Parameters (Optional)
            </h3>
            <div className="text-xs text-gray-500 mb-2">
              You can add custom query parameters that will be sent with the request
            </div>
            {Object.entries(queryParams)
              .filter(([key]) => !queryParamKeys.includes(key))
              .map(([key, value]) => (
                <div key={key} className="grid grid-cols-2 gap-3 mb-2">
                  <input
                    type="text"
                    value={key}
                    disabled
                    className="block w-full rounded-md border-gray-300 bg-gray-50 shadow-sm sm:text-sm"
                  />
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={value}
                      onChange={(e) => updateQueryParam(key, e.target.value)}
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                      disabled={testing}
                    />
                    <button
                      onClick={() => {
                        const newParams = { ...queryParams };
                        delete newParams[key];
                        setQueryParams(newParams);
                      }}
                      className="text-red-600 hover:text-red-700"
                      disabled={testing}
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            <button
              onClick={() => {
                const key = prompt('Enter parameter name:');
                if (key && key.trim() && !queryParams[key]) {
                  setQueryParams(prev => ({ ...prev, [key.trim()]: '' }));
                }
              }}
              className="text-sm text-blue-600 hover:text-blue-700 font-medium"
              disabled={testing}
            >
              + Add parameter
            </button>
          </div>

          {/* Custom Authentication */}
          <div>
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
              <div className="space-y-3 pl-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Authentication Type
                  </label>
                  <select
                    value={authType}
                    onChange={(e) => setAuthType(e.target.value)}
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
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
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                    placeholder="Enter token or credentials"
                    disabled={testing}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Info */}
          <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
            <div className="flex gap-2">
              <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-blue-800">
                <p className="font-medium">Testing endpoint</p>
                <p className="mt-1">
                  This will execute the endpoint using the configured API settings.
                  {useCustomAuth && ' Authentication will be overridden with the values provided above.'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            disabled={testing}
          >
            Cancel
          </button>
          <button
            onClick={handleTest}
            disabled={testing}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
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
