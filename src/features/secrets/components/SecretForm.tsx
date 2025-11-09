import React, { useState } from 'react';
import { X, Plus, Trash2 } from 'lucide-react';
import type { Secret, SecretCreateRequest } from '../../../types/secret';

interface SecretFormProps {
  secret?: Secret;
  onSubmit: (data: SecretCreateRequest) => void;
  onCancel: () => void;
  isSubmitting?: boolean;
}

export const SecretForm: React.FC<SecretFormProps> = ({
  secret,
  onSubmit,
  onCancel,
  isSubmitting = false,
}) => {
  const [name, setName] = useState(secret?.name || '');
  const [description, setDescription] = useState(secret?.description || '');
  const [tags, setTags] = useState<string[]>(secret?.tags || []);
  const [tagInput, setTagInput] = useState('');
  const [secrets, setSecrets] = useState<Record<string, string>>(
    secret?.secrets || 
    (secret?.secretDataMasked ? Object.fromEntries(Object.keys(secret.secretDataMasked).map(k => [k, ''])) : {})
  );
  const [keyInput, setKeyInput] = useState('');
  const [valueInput, setValueInput] = useState('');

  const handleAddTag = () => {
    const trimmedTag = tagInput.trim();
    if (trimmedTag && !tags.includes(trimmedTag)) {
      setTags([...tags, trimmedTag]);
      setTagInput('');
    }
  };

  const handleRemoveTag = (tag: string) => {
    setTags(tags.filter(t => t !== tag));
  };

  const handleAddSecret = () => {
    const trimmedKey = keyInput.trim();
    if (trimmedKey && valueInput) {
      setSecrets({ ...secrets, [trimmedKey]: valueInput });
      setKeyInput('');
      setValueInput('');
    }
  };

  const handleRemoveSecret = (key: string) => {
    const newSecrets = { ...secrets };
    delete newSecrets[key];
    setSecrets(newSecrets);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      alert('Name is required');
      return;
    }

    if (Object.keys(secrets).length === 0) {
      alert('At least one secret key-value pair is required');
      return;
    }

    onSubmit({
      name: name.trim(),
      description: description.trim() || undefined,
      tags: tags.length > 0 ? tags : undefined,
      secrets,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Name */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Name <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
          placeholder="e.g., prod-api-secrets"
          required
        />
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Description
        </label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
          placeholder="Brief description of this secret"
          rows={3}
        />
      </div>

      {/* Tags */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Tags
        </label>
        <div className="flex gap-2 mb-2">
          <input
            type="text"
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleAddTag();
              }
            }}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
            placeholder="Add a tag"
          />
          <button
            type="button"
            onClick={handleAddTag}
            className="px-3 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {tags.map(tag => (
              <span
                key={tag}
                className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
              >
                {tag}
                <button
                  type="button"
                  onClick={() => handleRemoveTag(tag)}
                  className="hover:text-blue-900"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Secret Key-Value Pairs */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Secrets <span className="text-red-500">*</span>
        </label>
        <div className="border border-gray-300 rounded-md p-4 space-y-3">
          {/* Add Secret Form */}
          <div className="flex gap-2">
            <input
              type="text"
              value={keyInput}
              onChange={(e) => setKeyInput(e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
              placeholder="Key (e.g., API_KEY)"
            />
            <input
              type="password"
              value={valueInput}
              onChange={(e) => setValueInput(e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
              placeholder="Value"
            />
            <button
              type="button"
              onClick={handleAddSecret}
              className="px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          {/* Existing Secrets */}
          {Object.keys(secrets).length > 0 ? (
            <div className="space-y-2">
              {Object.entries(secrets).map(([key, value]) => (
                <div
                  key={key}
                  className="flex items-center justify-between p-2 bg-gray-50 rounded border border-gray-200"
                >
                  <div className="flex-1 grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-xs text-gray-500">Key:</span>
                      <p className="font-mono text-sm">{key}</p>
                    </div>
                    <div>
                      <span className="text-xs text-gray-500">Value:</span>
                      <p className="font-mono text-sm">••••••••</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveSecret(key)}
                    className="ml-2 p-1 text-red-600 hover:bg-red-50 rounded"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500 text-center py-4">
              No secrets added yet. Add your first key-value pair above.
            </p>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-3">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
          disabled={isSubmitting}
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Saving...' : secret ? 'Update Secret' : 'Create Secret'}
        </button>
      </div>
    </form>
  );
};
