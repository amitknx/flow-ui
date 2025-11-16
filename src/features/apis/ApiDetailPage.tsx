import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Edit,
  Copy,
  Trash2,
  Globe,
  Lock,
  Clock,
  TrendingUp,
  Play,
  Settings,
  Code,
} from 'lucide-react';

import { useApi, useDeleteApi, useCreateApi } from '../apis-new/hooks/useApiManagement';
import { apiEndpointService } from '../../services/api-new-service';
import { formatDate } from '../../utils/formatters';
import { LoadingSpinner, ErrorState } from '../../components/ui';
import { TestEndpointModal } from '../../components/api';
import { transformApiFormToDto } from '../../utils/api-helpers';
import type { ApiEndpoint } from '../../types/api-new';

/**
 * API detail page - shows API details and endpoints with test functionality
 */
export const ApiDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: api, isLoading, isError, error } = useApi(id);
  const deleteApi = useDeleteApi();
  const createApi = useCreateApi();

  const [endpoints, setEndpoints] = useState<ApiEndpoint[]>([]);
  const [loadingEndpoints, setLoadingEndpoints] = useState(false);
  const [selectedEndpoint, setSelectedEndpoint] = useState<ApiEndpoint | null>(null);
  const [testResult, setTestResult] = useState<any>(null);
  const [testing, setTesting] = useState(false);
  const [cloning, setCloning] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showTestModal, setShowTestModal] = useState(false);

  // Load endpoints when API is loaded
  React.useEffect(() => {
    if (api?.id) {
      loadEndpoints();
    }
  }, [api?.id]);

  const loadEndpoints = async () => {
    if (!api?.id) return;
    setLoadingEndpoints(true);
    try {
      const data = await apiEndpointService.getEndpointsByApi(api.id);
      setEndpoints(data);
    } catch (error) {
      console.error('Failed to load endpoints:', error);
    } finally {
      setLoadingEndpoints(false);
    }
  };

  const handleDelete = async () => {
    if (!api) return;
    if (window.confirm(`Are you sure you want to delete "${api.name}"? This action cannot be undone.`)) {
      setDeleting(true);
      try {
        await deleteApi.mutateAsync(api.id);
        navigate('/apis');
      } catch (error) {
        console.error('Failed to delete API:', error);
        alert(`Failed to delete API: ${error instanceof Error ? error.message : 'Unknown error'}`);
        setDeleting(false);
      }
    }
  };

  const handleClone = async () => {
    if (!api) return;
    const newName = prompt('Enter name for the cloned API:', `${api.name} (Copy)`);
    if (!newName || !newName.trim()) return;

    setCloning(true);
    try {
      // Prepare cloned API data
      const clonedApiData = {
        name: newName.trim(),
        version: api.version,
        baseUrl: api.baseUrl,
        description: api.description,
        secretId: api.secretId,
        tags: api.tags || [],
        endpoints: endpoints.map(endpoint => ({
          name: endpoint.name,
          httpMethod: endpoint.httpMethod,
          endpointPath: endpoint.endpointPath,
          description: endpoint.description,
          pathParams: endpoint.pathParams,
          queryParams: endpoint.queryParams,
          headers: endpoint.headers,
          requestBodyTemplate: endpoint.requestBodyTemplate,
          responseMapping: endpoint.responseMapping,
          contentType: endpoint.contentType,
          timeoutMs: endpoint.timeoutMs,
          retryConfig: endpoint.retryConfig,
        })),
      };

      // Transform and create the cloned API
      const dto = transformApiFormToDto(clonedApiData);
      const newApi = await createApi.mutateAsync(dto);

      // Navigate to the new API detail page
      navigate(`/apis/${newApi.id}`);
    } catch (error) {
      console.error('Failed to clone API:', error);
      alert(`Failed to clone API: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setCloning(false);
    }
  };

  const handleTestEndpoint = (endpoint: ApiEndpoint) => {
    setSelectedEndpoint(endpoint);
    setTestResult(null);
    setShowTestModal(true);
  };

  const handleExecuteTest = async (params: {
    pathParams?: Record<string, string>;
    queryParams?: Record<string, string>;
    overrideAuthentication?: any;
  }) => {
    if (!selectedEndpoint) return;

    setTesting(true);
    setTestResult(null);

    try {
      // Call the real backend API to execute the endpoint
      const response = await apiEndpointService.executeEndpoint(selectedEndpoint.id, params);

      // Parse the actual API execution result from the backend response
      // Backend returns metadata about the external API call
      setTestResult({
        success: response.status === 'SUCCESS',
        status: response.httpStatusCode,
        statusText: response.httpStatusText,
        error: response.errorMessage,
        data: response.responseBody,
        responseTime: response.durationMs,
        requestUrl: response.requestUrl,
        httpMethod: response.httpMethod,
        requestTimestamp: response.requestTimestamp,
        responseTimestamp: response.responseTimestamp,
        responseHeaders: response.responseHeaders,
      });

      // Close modal after test execution
      setShowTestModal(false);
    } catch (error: any) {
      // This handles errors from the backend API itself (not the external API)
      setTestResult({
        success: false,
        status: error.status || 500,
        statusText: 'Backend Error',
        error: error.message || 'Failed to execute test - backend error',
        data: error.response,
        responseTime: 0,
      });

      // Close modal even on error so user can see results
      setShowTestModal(false);
    } finally {
      setTesting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <LoadingSpinner size="lg" text="Loading API details..." />
      </div>
    );
  }

  if (isError || !api) {
    return (
      <div className="p-8">
        <ErrorState
          title="Failed to load API"
          message={error?.message || 'API not found'}
          onRetry={() => navigate('/apis')}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/apis')}
            className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to APIs
          </button>

          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl font-bold text-gray-900">{api.name}</h1>
                {api.version && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800">
                    v{api.version}
                  </span>
                )}
              </div>
              <p className="text-gray-600 mt-2">
                {api.description || 'No description provided'}
              </p>
            </div>

            <div className="flex items-center gap-3">
              <Link
                to={`/apis/${api.id}/edit`}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              >
                <Edit className="w-4 h-4" />
                Edit
              </Link>
              <button
                onClick={handleClone}
                disabled={cloning || loadingEndpoints}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {cloning ? <LoadingSpinner size="sm" /> : <Copy className="w-4 h-4" />}
                {cloning ? 'Cloning...' : 'Clone'}
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-700 bg-white border border-red-300 rounded-md hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {deleting ? <LoadingSpinner size="sm" /> : <Trash2 className="w-4 h-4" />}
                {deleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>

        {/* API Details */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Info Card */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">API Details</h2>
              <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <dt className="text-sm font-medium text-gray-500 flex items-center gap-2">
                    <Globe className="w-4 h-4" />
                    Base URL
                  </dt>
                  <dd className="mt-1 text-sm text-gray-900 font-mono break-all">{api.baseUrl}</dd>
                </div>

                {api.secretId && (
                  <div>
                    <dt className="text-sm font-medium text-gray-500 flex items-center gap-2">
                      <Lock className="w-4 h-4" />
                      Authentication
                    </dt>
                    <dd className="mt-1 text-sm text-gray-900">Using Secret</dd>
                  </div>
                )}

                <div>
                  <dt className="text-sm font-medium text-gray-500 flex items-center gap-2">
                    <TrendingUp className="w-4 h-4" />
                    Endpoints
                  </dt>
                  <dd className="mt-1 text-sm text-gray-900">{api.endpointCount || 0} endpoints</dd>
                </div>

                {api.timeoutMs && (
                  <div>
                    <dt className="text-sm font-medium text-gray-500 flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      Timeout
                    </dt>
                    <dd className="mt-1 text-sm text-gray-900">{api.timeoutMs}ms</dd>
                  </div>
                )}

                <div>
                  <dt className="text-sm font-medium text-gray-500 flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    Created
                  </dt>
                  <dd className="mt-1 text-sm text-gray-900">{formatDate(api.createdAt)}</dd>
                </div>

                {api.modifiedAt && (
                  <div>
                    <dt className="text-sm font-medium text-gray-500 flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      Modified
                    </dt>
                    <dd className="mt-1 text-sm text-gray-900">{formatDate(api.modifiedAt)}</dd>
                  </div>
                )}
              </dl>

              {/* Tags */}
              {api.tags && api.tags.length > 0 && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <dt className="text-sm font-medium text-gray-500 mb-2">Tags</dt>
                  <div className="flex flex-wrap gap-2">
                    {api.tags.map(tag => (
                      <span
                        key={tag}
                        className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Endpoints List */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">Endpoints</h2>
                <span className="text-sm text-gray-500">
                  {endpoints.length} {endpoints.length === 1 ? 'endpoint' : 'endpoints'}
                </span>
              </div>

              {loadingEndpoints ? (
                <div className="flex justify-center py-8">
                  <LoadingSpinner size="md" text="Loading endpoints..." />
                </div>
              ) : endpoints.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Code className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                  <p>No endpoints configured</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {endpoints.map(endpoint => (
                    <div
                      key={endpoint.id}
                      className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <span
                              className={`inline-flex items-center px-2 py-1 rounded text-xs font-semibold ${
                                endpoint.httpMethod === 'GET'
                                  ? 'bg-blue-100 text-blue-800'
                                  : endpoint.httpMethod === 'POST'
                                  ? 'bg-green-100 text-green-800'
                                  : endpoint.httpMethod === 'PUT'
                                  ? 'bg-orange-100 text-orange-800'
                                  : endpoint.httpMethod === 'DELETE'
                                  ? 'bg-red-100 text-red-800'
                                  : 'bg-gray-100 text-gray-800'
                              }`}
                            >
                              {endpoint.httpMethod}
                            </span>
                            <h3 className="text-sm font-semibold text-gray-900">{endpoint.name}</h3>
                          </div>
                          <p className="text-sm text-gray-600 font-mono mb-2">{endpoint.endpointPath}</p>
                          {endpoint.description && (
                            <p className="text-xs text-gray-500">{endpoint.description}</p>
                          )}
                        </div>

                        <button
                          onClick={() => handleTestEndpoint(endpoint)}
                          disabled={testing}
                          className="inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-blue-700 bg-blue-100 border border-blue-200 rounded-md hover:bg-blue-200 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {testing && selectedEndpoint?.id === endpoint.id ? (
                            <LoadingSpinner size="sm" />
                          ) : (
                            <Play className="w-4 h-4" />
                          )}
                          Test
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Sidebar - Test Results */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 sticky top-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Settings className="w-5 h-5" />
                Test Results
              </h2>

              {!selectedEndpoint && (
                <div className="text-center py-8 text-gray-500">
                  <Play className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                  <p className="text-sm">Click "Test" on an endpoint to see results</p>
                </div>
              )}

              {selectedEndpoint && !testResult && !testing && (
                <div className="text-center py-8 text-gray-500">
                  <LoadingSpinner size="md" text="Preparing test..." />
                </div>
              )}

              {testing && (
                <div className="text-center py-8">
                  <LoadingSpinner size="md" text="Testing endpoint..." />
                </div>
              )}

              {testResult && (
                <div className="space-y-4">
                  {/* Request Info */}
                  <div>
                    <h3 className="text-sm font-medium text-gray-700 mb-2">Request</h3>
                    <div className="text-xs space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-gray-500">Method:</span>
                        <span className="font-mono text-gray-900">{testResult.httpMethod || selectedEndpoint?.httpMethod}</span>
                      </div>
                      {testResult.requestUrl && (
                        <div>
                          <span className="font-medium text-gray-500">URL:</span>
                          <p className="font-mono text-gray-900 break-all mt-1">{testResult.requestUrl}</p>
                        </div>
                      )}
                      {testResult.requestTimestamp && (
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-gray-500">Sent:</span>
                          <span className="text-gray-900">{new Date(testResult.requestTimestamp).toLocaleString()}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Status */}
                  <div
                    className={`p-3 rounded-md border ${
                      testResult.success
                        ? 'bg-green-50 border-green-200'
                        : 'bg-red-50 border-red-200'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <span
                        className={`inline-flex items-center px-2 py-1 rounded text-xs font-semibold ${
                          testResult.success ? 'bg-green-200 text-green-900' : 'bg-red-200 text-red-900'
                        }`}
                      >
                        {testResult.success ? 'SUCCESS' : 'ERROR'}
                      </span>
                      {testResult.status && (
                        <span className="text-xs font-medium text-gray-700">
                          {testResult.status} {testResult.statusText}
                        </span>
                      )}
                    </div>

                    {testResult.responseTime !== undefined && (
                      <p className="text-xs text-gray-600">Duration: {testResult.responseTime}ms</p>
                    )}

                    {testResult.responseTimestamp && (
                      <p className="text-xs text-gray-600 mt-1">
                        Received: {new Date(testResult.responseTimestamp).toLocaleString()}
                      </p>
                    )}

                    {testResult.error && (
                      <div className="mt-2 pt-2 border-t border-red-300">
                        <p className="text-xs font-medium text-red-900 mb-1">Error Message:</p>
                        <p className="text-xs text-red-700">{testResult.error}</p>
                      </div>
                    )}
                  </div>

                  {/* Response Headers */}
                  {testResult.responseHeaders && Object.keys(testResult.responseHeaders).length > 0 && (
                    <div>
                      <h3 className="text-sm font-medium text-gray-700 mb-2">Response Headers</h3>
                      <div className="text-xs bg-gray-50 p-3 rounded-md border border-gray-200 max-h-48 overflow-auto">
                        {Object.entries(testResult.responseHeaders).map(([key, value]) => (
                          <div key={key} className="mb-1">
                            <span className="font-medium text-gray-700">{key}:</span>{' '}
                            <span className="text-gray-600">{String(value)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Response Body */}
                  {testResult.data && (
                    <div>
                      <h3 className="text-sm font-medium text-gray-700 mb-2">Response Body</h3>
                      <pre className="text-xs bg-gray-50 p-3 rounded-md overflow-auto max-h-96 border border-gray-200">
                        {typeof testResult.data === 'string'
                          ? testResult.data
                          : JSON.stringify(testResult.data, null, 2)}
                      </pre>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Test Endpoint Modal */}
      {showTestModal && selectedEndpoint && (
        <TestEndpointModal
          endpoint={selectedEndpoint}
          onClose={() => setShowTestModal(false)}
          onTest={handleExecuteTest}
          testing={testing}
        />
      )}
    </div>
  );
};
