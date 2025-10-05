

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Key } from 'lucide-react';

import { useCreateSecretStore } from '../../hooks/useApiManagement';
import { secretStoreTypeConfig } from '../../utils/api-helpers';
import type { SecretStoreConfig, SecretStoreType } from '../../types/api';

/**
 * Secret Store creation page
 */
export const SecretStoreCreatePage: React.FC = () => {
  const navigate = useNavigate();
  const createSecretStore = useCreateSecretStore();

  const handleCreateStore = async (type: SecretStoreType, name: string) => {
    try {
      const config = {
        name,
        type,
        description: `${secretStoreTypeConfig[type].label} integration`,
        isActive: true,
        config: secretStoreTypeConfig[type] === secretStoreTypeConfig.hashicorp_vault ? {
          url: 'https://vault.example.com',
          authMethod: 'token' as const,
          mount: 'secret',
        } : secretStoreTypeConfig[type] === secretStoreTypeConfig.aws_secrets_manager ? {
          region: 'us-east-1',
        } : {},
      };

      const newStore = await createSecretStore.mutateAsync(config as any);
      navigate(`/secret-stores/${newStore.id}/edit`);
    } catch (error) {
      console.error('Failed to create secret store:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/secret-stores')}
            className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Secret Stores
          </button>
          <h1 className="text-3xl font-bold text-gray-900">Add Secret Store</h1>
          <p className="text-gray-600 mt-2">
            Choose a secret store provider to integrate with your workflows
          </p>
        </div>

        {/* Provider Selection */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">
            Select Secret Store Provider
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {Object.entries(secretStoreTypeConfig).map(([type, config]) => (
              <div
                key={type}
                className="border border-gray-200 rounded-lg p-6 hover:border-blue-300 hover:shadow-md transition-all cursor-pointer"
                onClick={() => {
                  const name = prompt(`Enter a name for your ${config.label} integration:`, `${config.vendor} Store`);
                  if (name) {
                    handleCreateStore(type as SecretStoreType, name);
                  }
                }}
              >
                <div className="flex items-start gap-4">
                  <div className="text-3xl">{config.icon}</div>
                  <div className="flex-1">
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      {config.label}
                    </h3>
                    <p className="text-sm text-gray-600 mb-3">
                      {config.description}
                    </p>
                    <div className="text-xs text-gray-500 mb-3">
                      <strong>Vendor:</strong> {config.vendor}
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {config.features.slice(0, 2).map((feature, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700"
                        >
                          {feature}
                        </span>
                      ))}
                      {config.features.length > 2 && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-500">
                          +{config.features.length - 2} more
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Info */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <Key className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-3">
              <h3 className="text-lg font-medium text-blue-900">
                Why Use Secret Stores?
              </h3>
              <div className="mt-2 text-sm text-blue-700">
                <p className="mb-2">
                  Secret stores provide enterprise-grade security for managing sensitive credentials:
                </p>
                <ul className="list-disc list-inside space-y-1">
                  <li>Centralized secret management across all workflows</li>
                  <li>Encryption at rest and in transit</li>
                  <li>Access control and audit logging</li>
                  <li>Automatic secret rotation capabilities</li>
                  <li>Integration with existing infrastructure</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
