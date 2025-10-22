

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Plus, 
  Search, 
  MoreVertical, 
  TestTube, 
  Edit, 
  Trash2,
  Key,
  CheckCircle,
  Clock,
  ExternalLink,
} from 'lucide-react';
 

import type { SecretStoreConfig } from '../../types/api';
import { useSecretStoreManagement, useDeleteSecretStore, useTestSecretStore } from '../../hooks/useApiManagement';
import { secretStoreTypeConfig } from '../../utils/api-helpers';
import { formatDate } from '../../utils/formatters';
import { LoadingSpinner, ErrorState, EmptyState, StatusBadge } from '../../components/ui';

/**
 * Secret Stores management page
 */
export const SecretStoresPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');

  const { secretStores, isLoading, isError, error } = useSecretStoreManagement();
  const deleteSecretStore = useDeleteSecretStore();
  const testSecretStore = useTestSecretStore();

  // Filter secret stores
  const filteredStores = React.useMemo(() => {
    if (!secretStores.data) return [];

    return secretStores.data.filter((store: SecretStoreConfig) => {
      const matchesSearch = !searchQuery || 
        store.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        store.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        secretStoreTypeConfig[store.type].label.toLowerCase().includes(searchQuery.toLowerCase());

      return matchesSearch;
    });
  }, [secretStores.data, searchQuery]);

  const handleDeleteStore = async (store: SecretStoreConfig) => {
    if (window.confirm(`Are you sure you want to delete "${store.name}"? This action cannot be undone.`)) {
      try {
        await deleteSecretStore.mutateAsync(store.id);
      } catch (error) {
        console.error('Failed to delete secret store:', error);
      }
    }
  };

  const handleTestConnection = async (store: SecretStoreConfig) => {
    try {
      await testSecretStore.mutateAsync(store.id);
    } catch (error) {
      console.error('Failed to test secret store:', error);
    }
  };

  const renderStoreCard = (store: SecretStoreConfig) => {
    const config = secretStoreTypeConfig[store.type];
    
    return (
      <div
        key={store.id}
        className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
      >
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 mb-2">
              <div className="flex-shrink-0 text-2xl">
                {config.icon}
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 truncate">
                  {store.name}
                </h3>
                <p className="text-sm text-gray-600">{config.label}</p>
              </div>
              <div className="flex items-center gap-2">
                <StatusBadge 
                  status={store.isActive ? 'active' : 'inactive'} 
                  variant={store.isActive ? 'success' : 'secondary'}
                />
              </div>
            </div>
            
            {store.description && (
              <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                {store.description}
              </p>
            )}
            
            <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
              <div className="flex items-center gap-1">
                <Key className="w-4 h-4" />
                <span>{config.vendor}</span>
              </div>
              {config.features.length > 0 && (
                <div className="flex items-center gap-1">
                  <CheckCircle className="w-4 h-4" />
                  <span>{config.features[0]}</span>
                </div>
              )}
            </div>
            
            <div className="flex items-center gap-4 text-xs text-gray-400">
              <div className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                <span>Created {formatDate(store.createdAt)}</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                <span>Updated {formatDate(store.updatedAt)}</span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2 ml-4">
            <button
              onClick={() => handleTestConnection(store)}
              disabled={testSecretStore.isPending}
              className="inline-flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-blue-700 bg-blue-100 border border-blue-200 rounded-md hover:bg-blue-200 disabled:opacity-50"
            >
              {testSecretStore.isPending ? (
                <LoadingSpinner size="sm" />
              ) : (
                <TestTube className="w-4 h-4" />
              )}
              Test
            </button>
            
            <div className="relative group">
              <button className="p-2 text-gray-400 hover:text-gray-600 rounded-md hover:bg-gray-100">
                <MoreVertical className="w-4 h-4" />
              </button>
              
              <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-md shadow-lg border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
                <div className="py-1">
                  <Link
                    to={`/secret-stores/${store.id}/edit`}
                    className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    <Edit className="w-4 h-4" />
                    Edit
                  </Link>
                  {config.docUrl && (
                    <a
                      href={config.docUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      <ExternalLink className="w-4 h-4" />
                      Documentation
                    </a>
                  )}
                  <div className="border-t border-gray-100 my-1" />
                  <button
                    onClick={() => handleDeleteStore(store)}
                    className="flex items-center gap-2 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Features */}
        {config.features.length > 1 && (
          <div className="mt-4 pt-4 border-t border-gray-100">
            <div className="flex flex-wrap gap-2">
              {config.features.slice(0, 3).map((feature, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700"
                >
                  {feature}
                </span>
              ))}
              {config.features.length > 3 && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-500">
                  +{config.features.length - 3} more
                </span>
              )}
            </div>
          </div>
        )}
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (isError) {
    return (
      <ErrorState
        title="Failed to load secret stores"
        message={error?.message || 'An unexpected error occurred'}
        onRetry={() => secretStores.refetch()}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Secret Stores</h1>
          <p className="text-gray-600 mt-1">
            Manage your secret store integrations for secure credential storage
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            to="/apis"
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
          >
            <Key className="w-4 h-4" />
            Back to APIs
          </Link>
          <Link
            to="/secret-stores/new"
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700"
          >
            <Plus className="w-4 h-4" />
            Add Secret Store
          </Link>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search secret stores by name, type, or description..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          />
        </div>
      </div>

      {/* Results */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm text-gray-600">
            {filteredStores.length} {filteredStores.length === 1 ? 'secret store' : 'secret stores'} found
          </p>
        </div>

        {filteredStores.length === 0 ? (
          <EmptyState
            icon={Key}
            title="No secret stores found"
            message={
              searchQuery
                ? "No secret stores match your search. Try adjusting your search terms."
                : "You haven't configured any secret stores yet. Add your first secret store to securely manage credentials."
            }
            action={
              searchQuery ? {
                label: 'Clear search',
                onClick: () => setSearchQuery('')
              } : {
                label: 'Add Secret Store',
                href: '/secret-stores/new'
              }
            }
          />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredStores.map(renderStoreCard)}
          </div>
        )}
      </div>

      {/* Info Section */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <div className="flex">
          <div className="flex-shrink-0">
            <Key className="h-6 w-6 text-blue-600" />
          </div>
          <div className="ml-3">
            <h3 className="text-lg font-medium text-blue-900">
              About Secret Stores
            </h3>
            <div className="mt-2 text-sm text-blue-700">
              <p className="mb-2">
                Secret stores provide secure, centralized management of sensitive credentials like API keys, 
                passwords, and certificates. Instead of hardcoding secrets in your workflows, you can 
                reference them from these secure vaults.
              </p>
              <ul className="list-disc list-inside space-y-1">
                <li>Keep sensitive data encrypted and secure</li>
                <li>Centralize credential management across workflows</li>
                <li>Support for industry-standard secret management solutions</li>
                <li>Automatic rotation and versioning capabilities</li>
                <li>Fine-grained access control and audit logging</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
