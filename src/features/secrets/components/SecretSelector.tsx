import React from 'react';
import { Plus, Key } from 'lucide-react';
import { useSecrets } from '../hooks/useSecrets';
import type { Secret } from '../../../types/secret';

interface SecretSelectorProps {
  selectedSecretId?: string;
  onSelect: (secretId: string | undefined) => void;
  onCreateNew?: () => void;
}

export const SecretSelector: React.FC<SecretSelectorProps> = ({
  selectedSecretId,
  onSelect,
  onCreateNew,
}) => {
  const { data, isLoading } = useSecrets({ size: 100 });
  const secrets = data?.content || [];

  const selectedSecret = secrets.find(s => s.id === selectedSecretId);

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <select
          value={selectedSecretId || ''}
          onChange={(e) => onSelect(e.target.value || undefined)}
          className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
          disabled={isLoading}
        >
          <option value="">-- Select Secret --</option>
          {secrets.map(secret => (
            <option key={secret.id} value={secret.id}>
              {secret.name}
              {secret.tags.length > 0 && ` (${secret.tags.join(', ')})`}
            </option>
          ))}
        </select>

        {onCreateNew && (
          <button
            type="button"
            onClick={onCreateNew}
            className="px-3 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
            title="Create new secret"
          >
            <Plus className="w-4 h-4" />
          </button>
        )}
      </div>

      {selectedSecret && (
        <div className="p-3 bg-gray-50 border border-gray-200 rounded-md">
          <div className="flex items-start gap-2">
            <Key className="w-4 h-4 text-gray-400 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900">{selectedSecret.name}</p>
              {selectedSecret.description && (
                <p className="text-xs text-gray-600 mt-1">{selectedSecret.description}</p>
              )}
              {selectedSecret.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {selectedSecret.tags.map(tag => (
                    <span
                      key={tag}
                      className="inline-flex items-center px-2 py-0.5 rounded-full text-xs bg-blue-100 text-blue-800"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
              <div className="mt-2">
                <p className="text-xs text-gray-500">
                  Contains {Object.keys(selectedSecret.secrets).length} secret
                  {Object.keys(selectedSecret.secrets).length !== 1 ? 's' : ''}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
