import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

import { ApiConfigForm } from '../../components/api';
import { useApi, useUpdateApi } from '../apis-new/hooks/useApiManagement';
import { apiEndpointService } from '../../services/api-new-service';
import { transformApiFormToDto } from '../../utils/api-helpers';
import { LoadingSpinner, ErrorState } from '../../components/ui';
import type { ApiConfig } from '../../types/api';
import type { ApiEndpoint } from '../../types/api-new';

/**
 * API edit page
 */
export const ApiEditPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: api, isLoading, isError, error } = useApi(id);
  const updateApi = useUpdateApi();

  const [endpoints, setEndpoints] = useState<ApiEndpoint[]>([]);
  const [loadingEndpoints, setLoadingEndpoints] = useState(false);
  const [apiWithEndpoints, setApiWithEndpoints] = useState<any>(null);

  // Load endpoints when API is loaded
  useEffect(() => {
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

      // Merge API data with endpoints for the form
      const mergedData = {
        ...api,
        // Set default authentication if null
        authentication: api.authentication || { type: 'none' },
        // Convert endpoints to form format
        endpoints: data.map(endpoint => ({
          id: endpoint.id,
          name: endpoint.name,
          description: endpoint.description,
          method: endpoint.httpMethod,
          path: endpoint.endpointPath,
          headers: endpoint.headers ? Object.entries(endpoint.headers).map(([name, value]) => ({
            name,
            value,
            required: false,
          })) : [],
          queryParams: endpoint.queryParams || {},
          pathParams: endpoint.pathParams || {},
          requestBodyTemplate: endpoint.requestBodyTemplate,
          responseMapping: endpoint.responseMapping,
          contentType: endpoint.contentType,
          timeout: endpoint.timeoutMs,
          retryConfig: endpoint.retryConfig,
        })),
        // Set default values for form fields
        defaultHeaders: [
          {
            name: 'Content-Type',
            value: 'application/json',
            required: true,
            description: 'Request content type',
          },
        ],
        isActive: api.active !== undefined ? api.active : true,
        rateLimiting: api.rateLimiting || {},
        circuitBreaker: api.circuitBreaker || { enabled: false },
      };

      setApiWithEndpoints(mergedData);
    } catch (error) {
      console.error('Failed to load endpoints:', error);
    } finally {
      setLoadingEndpoints(false);
    }
  };

  const handleSave = async (config: Partial<ApiConfig>) => {
    if (!id) return;

    try {
      // Transform form data to backend DTO format
      const dto = transformApiFormToDto(config);
      await updateApi.mutateAsync({ id, request: dto });
      // Navigate back to detail page
      navigate(`/apis/${id}`);
    } catch (error) {
      console.error('Failed to update API:', error);
      // Show error to user
      alert(`Failed to update API: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  if (isLoading || loadingEndpoints) {
    return (
      <div className="flex items-center justify-center h-96">
        <LoadingSpinner size="lg" text={isLoading ? "Loading API..." : "Loading endpoints..."} />
      </div>
    );
  }

  if (isError || !api) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <ErrorState
            title="Failed to load API"
            message={error?.message || 'API not found'}
            onRetry={() => navigate('/apis')}
          />
        </div>
      </div>
    );
  }

  // Wait for endpoints to be loaded and merged
  if (!apiWithEndpoints) {
    return (
      <div className="flex items-center justify-center h-96">
        <LoadingSpinner size="lg" text="Preparing form..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate(`/apis/${id}`)}
            className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to API Details
          </button>
          <h1 className="text-3xl font-bold text-gray-900">Edit API</h1>
          <p className="text-gray-600 mt-2">
            Update your API configuration
          </p>
        </div>

        {/* Form */}
        <ApiConfigForm
          api={apiWithEndpoints}
          onSave={handleSave}
          isLoading={updateApi.isPending}
        />
      </div>
    </div>
  );
};
