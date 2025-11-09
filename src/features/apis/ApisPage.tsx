

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Plus,
  Search,
  Filter,
  MoreVertical,
  Trash2,
  Settings,
  Globe,
  Lock,
  Clock,
  TrendingUp,
  Key
} from 'lucide-react';
import clsx from 'clsx';

import type { ApiConfig } from '../../types/api';
import { useApis, useDeleteApi } from '../apis-new/hooks/useApiManagement';
import { formatDate } from '../../utils/formatters';
import { LoadingSpinner, ErrorState, EmptyState } from '../../components/ui';

/**
 * Main APIs management page
 */
export const ApisPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState<'name' | 'created' | 'updated'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  const { data: apisData, isLoading, isError, error, refetch } = useApis();
  const deleteApi = useDeleteApi();

  // Filter and sort APIs
  const filteredApis = React.useMemo(() => {
    if (!apisData?.content) return [];

    const filtered = apisData.content.filter((api: ApiConfig) => {
      // Search filter
      const matchesSearch = !searchQuery ||
        api.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        api.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        api.baseUrl.toLowerCase().includes(searchQuery.toLowerCase());

      // Tags filter
      const matchesTags = selectedTags.length === 0 ||
        selectedTags.some(tag => api.tags?.includes(tag));

      return matchesSearch && matchesTags;
    });

    // Sort
    filtered.sort((a, b) => {
      let comparison = 0;

      switch (sortBy) {
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'created':
          comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
          break;
        case 'updated':
          comparison = new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime();
          break;
      }

      return sortOrder === 'asc' ? comparison : -comparison;
    });

    return filtered;
  }, [apisData?.content, searchQuery, selectedTags, sortBy, sortOrder]);

  // Get all unique tags
  const allTags = React.useMemo(() => {
    if (!apisData?.content) return [];
    const tags = new Set<string>();
    apisData.content.forEach((api: ApiConfig) => {
      api.tags?.forEach(tag => tags.add(tag));
    });
    return Array.from(tags).sort();
  }, [apisData?.content]);

  const handleDeleteApi = async (api: ApiConfig) => {
    if (window.confirm(`Are you sure you want to delete "${api.name}"? This action cannot be undone.`)) {
      try {
        await deleteApi.mutateAsync(api.id);
      } catch (error) {
        console.error('Failed to delete API:', error);
        alert(`Failed to delete API: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }
  };

  const renderApiCard = (api: ApiConfig) => {
    return (
      <div
        key={api.id}
        onClick={() => navigate(`/apis/${api.id}`)}
        className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow cursor-pointer"
      >
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 mb-2">
              <h3 className="text-lg font-semibold text-gray-900 truncate">
                {api.name}
              </h3>
              <div className="flex items-center gap-2">
                {api.version && (
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                    v{api.version}
                  </span>
                )}
              </div>
            </div>

            <p className="text-sm text-gray-600 mb-3 line-clamp-2">
              {api.description || 'No description provided'}
            </p>

            <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
              <div className="flex items-center gap-1">
                <Globe className="w-4 h-4" />
                <span className="font-mono text-xs truncate max-w-48">{api.baseUrl}</span>
              </div>
              {api.secretId && (
                <div className="flex items-center gap-1">
                  <Lock className="w-4 h-4" />
                  <span>With Secret</span>
                </div>
              )}
              <div className="flex items-center gap-1">
                <TrendingUp className="w-4 h-4" />
                <span>{api.endpointCount || 0} endpoints</span>
              </div>
            </div>
            
            {api.tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mb-4">
                {api.tags.map(tag => (
                  <span
                    key={tag}
                    className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
            
            <div className="flex items-center gap-4 text-xs text-gray-400">
              <div className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                <span>Created {formatDate(api.createdAt)}</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                <span>Updated {formatDate(api.updatedAt)}</span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2 ml-4">
            <div className="relative group">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                }}
                className="p-2 text-gray-400 hover:text-gray-600 rounded-md hover:bg-gray-100"
              >
                <MoreVertical className="w-4 h-4" />
              </button>

              <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-md shadow-lg border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
                <div className="py-1">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteApi(api);
                    }}
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
      </div>
    );
  };

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">APIs</h1>
          <p className="text-gray-600 mt-1">
            Manage your API configurations and integrations
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            to="/secrets"
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
          >
            <Key className="w-4 h-4" />
            Secrets
          </Link>
          <Link
            to="/secret-stores"
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
          >
            <Settings className="w-4 h-4" />
            Secret Stores
          </Link>
          <Link
            to="/apis/new"
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700"
          >
            <Plus className="w-4 h-4" />
            New API
          </Link>
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center h-64">
          <LoadingSpinner size="lg" text="Loading APIs..." />
        </div>
      )}

      {/* Error State */}
      {isError && !isLoading && (
        <ErrorState
          title="Failed to load APIs"
          message={error?.message || 'An unexpected error occurred'}
          onRetry={() => refetch()}
        />
      )}

      {/* Content - Only show when not loading and no error */}
      {!isLoading && !isError && (
        <>
          {/* Search and Filters */}
          <div className="bg-white border border-gray-200 rounded-lg p-4">
        <div className="flex items-center gap-4">
          <div className="flex-1 relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search APIs by name, description, or URL..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
          </div>
          
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={clsx(
              'inline-flex items-center gap-2 px-4 py-2 text-sm font-medium border rounded-md',
              showFilters
                ? 'text-blue-700 bg-blue-100 border-blue-200'
                : 'text-gray-700 bg-white border-gray-300 hover:bg-gray-50'
            )}
          >
            <Filter className="w-4 h-4" />
            Filters
          </button>
          
          <select
            value={`${sortBy}-${sortOrder}`}
            onChange={(e) => {
              const [field, order] = e.target.value.split('-');
              setSortBy(field as any);
              setSortOrder(order as any);
            }}
            className="px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="name-asc">Name (A-Z)</option>
            <option value="name-desc">Name (Z-A)</option>
            <option value="created-desc">Newest First</option>
            <option value="created-asc">Oldest First</option>
            <option value="updated-desc">Recently Updated</option>
          </select>
        </div>

        {/* Expanded Filters */}
        {showFilters && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tags
                </label>
                <div className="flex flex-wrap gap-2">
                  {allTags.map(tag => (
                    <button
                      key={tag}
                      onClick={() => {
                        if (selectedTags.includes(tag)) {
                          setSelectedTags(selectedTags.filter(t => t !== tag));
                        } else {
                          setSelectedTags([...selectedTags, tag]);
                        }
                      }}
                      className={clsx(
                        'inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border',
                        selectedTags.includes(tag)
                          ? 'bg-blue-100 text-blue-800 border-blue-200'
                          : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                      )}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Results */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm text-gray-600">
            {filteredApis.length} {filteredApis.length === 1 ? 'API' : 'APIs'} found
          </p>
        </div>

        {filteredApis.length === 0 ? (
          <EmptyState
            icon={Globe}
            title="No APIs found"
            message={
              searchQuery || selectedTags.length > 0
                ? "No APIs match your current filters. Try adjusting your search or filters."
                : "You haven't created any APIs yet. Create your first API to get started."
            }
            action={
              searchQuery || selectedTags.length > 0 ? {
                label: 'Clear filters',
                onClick: () => {
                  setSearchQuery('');
                  setSelectedTags([]);
                }
              } : {
                label: 'Create API',
                href: '/apis/new'
              }
            }
          />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredApis.map(renderApiCard)}
          </div>
        )}
      </div>
        </>
      )}
    </div>
  );
};
