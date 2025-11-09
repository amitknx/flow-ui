import React, { useState } from 'react';
import { Plus, Search, Edit, Trash2, Key, X } from 'lucide-react';
import { useSecrets, useCreateSecret, useUpdateSecret, useDeleteSecret } from './hooks';
import { SecretForm } from './components/SecretForm';
import type { Secret } from '../../types/secret';

export const SecretsPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(0);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingSecret, setEditingSecret] = useState<Secret | null>(null);

  const { data, isLoading, error } = useSecrets({
    query: searchQuery || undefined,
    page,
    size: 20,
  });

  const createSecret = useCreateSecret();
  const updateSecret = useUpdateSecret();
  const deleteSecret = useDeleteSecret();

  const secrets = data?.content || [];
  const totalPages = data?.totalPages || 0;

  const handleCreateSecret = async (secretData: any) => {
    try {
      await createSecret.mutateAsync(secretData);
      setShowCreateModal(false);
    } catch (error) {
      console.error('Failed to create secret:', error);
      alert('Failed to create secret. Please try again.');
    }
  };

  const handleUpdateSecret = async (secretData: any) => {
    if (!editingSecret) return;

    try {
      await updateSecret.mutateAsync({
        id: editingSecret.id,
        request: secretData,
      });
      setEditingSecret(null);
    } catch (error) {
      console.error('Failed to update secret:', error);
      alert('Failed to update secret. Please try again.');
    }
  };

  const handleDeleteSecret = async (secret: Secret) => {
    if (!window.confirm(`Are you sure you want to delete "${secret.name}"? This action cannot be undone.`)) {
      return;
    }

    try {
      await deleteSecret.mutateAsync(secret.id);
    } catch (error) {
      console.error('Failed to delete secret:', error);
      alert('Failed to delete secret. Please try again.');
    }
  };

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Secrets</h1>
          <p className="text-gray-600 mt-1">
            Manage your secrets and key-value pairs
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
        >
          <Plus className="w-4 h-4" />
          New Secret
        </button>
      </div>

      {/* Search */}
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search secrets by name..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setPage(0);
            }}
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">Loading secrets...</div>
        </div>
      )}

      {/* Error State */}
      {error && !isLoading && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">Failed to load secrets. Please try again.</p>
        </div>
      )}

      {/* Content */}
      {!isLoading && !error && (
        <>
          {secrets.length === 0 ? (
            <div className="bg-white border border-gray-200 rounded-lg p-12 text-center">
              <Key className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No secrets found</h3>
              <p className="text-gray-600 mb-4">
                {searchQuery
                  ? 'No secrets match your search. Try adjusting your search.'
                  : "You haven't created any secrets yet. Create your first secret to get started."}
              </p>
              {!searchQuery && (
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
                >
                  <Plus className="w-4 h-4" />
                  Create Secret
                </button>
              )}
            </div>
          ) : (
            <>
              <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Name
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Description
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Tags
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Secrets
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {secrets.map(secret => (
                      <tr key={secret.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <Key className="w-4 h-4 text-gray-400" />
                            <span className="font-medium text-gray-900">{secret.name}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {secret.description || '-'}
                        </td>
                        <td className="px-6 py-4">
                          {secret.tags.length > 0 ? (
                            <div className="flex flex-wrap gap-1">
                              {secret.tags.map(tag => (
                                <span
                                  key={tag}
                                  className="inline-flex items-center px-2 py-0.5 rounded-full text-xs bg-blue-100 text-blue-800"
                                >
                                  {tag}
                                </span>
                              ))}
                            </div>
                          ) : (
                            <span className="text-sm text-gray-400">-</span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {secret.secretDataMasked
                            ? `${Object.keys(secret.secretDataMasked).length} key${
                                Object.keys(secret.secretDataMasked).length !== 1 ? 's' : ''
                              }`
                            : '0 keys'}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => setEditingSecret(secret)}
                              className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                              title="Edit"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteSecret(secret)}
                              className="p-1 text-red-600 hover:bg-red-50 rounded"
                              title="Delete"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between">
                  <p className="text-sm text-gray-600">
                    Page {page + 1} of {totalPages}
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setPage(Math.max(0, page - 1))}
                      disabled={page === 0}
                      className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Previous
                    </button>
                    <button
                      onClick={() => setPage(Math.min(totalPages - 1, page + 1))}
                      disabled={page >= totalPages - 1}
                      className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </>
      )}

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Create New Secret</h2>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="px-6 py-4">
              <SecretForm
                onSubmit={handleCreateSecret}
                onCancel={() => setShowCreateModal(false)}
                isSubmitting={createSecret.isPending}
              />
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editingSecret && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Edit Secret</h2>
              <button
                onClick={() => setEditingSecret(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="px-6 py-4">
              <SecretForm
                secret={editingSecret}
                onSubmit={handleUpdateSecret}
                onCancel={() => setEditingSecret(null)}
                isSubmitting={updateSecret.isPending}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SecretsPage;
