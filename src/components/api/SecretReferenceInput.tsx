

import React, { useState, useRef, useEffect } from 'react';
import { Controller } from 'react-hook-form';
import type { Control } from 'react-hook-form';
import { 
  Eye, 
  EyeOff, 
  Key, 
  ChevronDown, 
  Search,
  Check,
  AlertTriangle 
} from 'lucide-react';
import clsx from 'clsx';

import type { SecretStoreConfig, SecretReference } from '../../types/api';
import { 
  isSecretReference, 
  createSecretReference, 
  formatSecretReference,
  secretStoreTypeConfig 
} from '../../utils/api-helpers';
import { useSecretsList, useValidateSecretPath } from '../../hooks/useApiManagement';

interface SecretReferenceInputProps {
  name: string;
  control: Control<any>;
  secretStores: SecretStoreConfig[];
  placeholder?: string;
  sensitive?: boolean;
  errors?: any;
  className?: string;
}

/**
 * Input component that supports both plain text and secret store references
 */
export const SecretReferenceInput: React.FC<SecretReferenceInputProps> = ({
  name,
  control,
  secretStores,
  placeholder = '',
  sensitive = false,
  errors,
  className = '',
}) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [selectedStore, setSelectedStore] = useState<SecretStoreConfig | null>(null);
  const [secretPath, setSecretPath] = useState('');
  const [secretKey, setSecretKey] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [inputMode, setInputMode] = useState<'text' | 'secret'>('text');
  const [searchQuery, setSearchQuery] = useState('');

  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const { data: secrets = [] } = useSecretsList(
    selectedStore?.id || '',
    secretPath.split('/').slice(0, -1).join('/') || undefined
  );

  const validateSecretPath = useValidateSecretPath();

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredStores = secretStores.filter(store =>
    store.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    store.type.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSecretStoreSelect = (store: SecretStoreConfig) => {
    setSelectedStore(store);
    setSecretPath('');
    setSecretKey('');
    setInputMode('secret');
  };

  const handleSecretPathChange = (path: string) => {
    setSecretPath(path);
  };

  const handleCreateSecretReference = (onChange: (value: any) => void) => {
    if (selectedStore && secretPath) {
      const reference = createSecretReference(
        selectedStore.id,
        secretPath,
        secretKey || undefined
      );
      onChange(reference);
      setIsDropdownOpen(false);
    }
  };

  const handleTextModeChange = (value: string, onChange: (value: any) => void) => {
    onChange(value);
  };

  const renderSecretStoreOption = (store: SecretStoreConfig) => {
    const config = secretStoreTypeConfig[store.type];
    return (
      <div
        key={store.id}
        className="flex items-center p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100"
        onClick={() => handleSecretStoreSelect(store)}
      >
        <div className="flex-shrink-0">
          <span className="text-lg">{config.icon}</span>
        </div>
        <div className="ml-3 flex-1">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium text-gray-900">{store.name}</h4>
            <span className={clsx(
              'inline-flex items-center px-2 py-1 rounded-full text-xs font-medium',
              store.isActive 
                ? 'bg-green-100 text-green-800'
                : 'bg-gray-100 text-gray-800'
            )}>
              {store.isActive ? 'Active' : 'Inactive'}
            </span>
          </div>
          <p className="text-xs text-gray-500 mt-1">{config.label}</p>
        </div>
      </div>
    );
  };

  const renderSecretBrowser = (value: any, onChange: (value: any) => void) => (
    <div className="space-y-4">
      {/* Secret Store Selection */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Select Secret Store
        </label>
        <div className="relative">
          <input
            type="text"
            placeholder="Search secret stores..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          />
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-gray-400" />
          </div>
        </div>
        
        <div className="mt-2 max-h-48 overflow-y-auto border border-gray-200 rounded-md bg-white">
          {filteredStores.length > 0 ? (
            filteredStores.map(renderSecretStoreOption)
          ) : (
            <div className="p-4 text-center text-gray-500 text-sm">
              No secret stores found
            </div>
          )}
        </div>
      </div>

      {/* Secret Path Input */}
      {selectedStore && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Secret Path
          </label>
          <input
            type="text"
            value={secretPath}
            onChange={(e) => handleSecretPathChange(e.target.value)}
            placeholder="secret/path/to/credential"
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          />
          <p className="text-xs text-gray-500 mt-1">
            Enter the path to your secret in {selectedStore.name}
          </p>
        </div>
      )}

      {/* Secret Key Input (optional) */}
      {selectedStore && secretPath && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Secret Key (optional)
          </label>
          <input
            type="text"
            value={secretKey}
            onChange={(e) => setSecretKey(e.target.value)}
            placeholder="password"
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          />
          <p className="text-xs text-gray-500 mt-1">
            Specify a key if the secret contains multiple values
          </p>
        </div>
      )}

      {/* Action Buttons */}
      {selectedStore && secretPath && (
        <div className="flex items-center justify-between pt-4 border-t border-gray-200">
          <button
            type="button"
            onClick={() => {
              validateSecretPath.mutate(
                { id: selectedStore.id, path: secretPath, key: secretKey },
                {
                  onSuccess: (isValid) => {
                    if (isValid) {
                      handleCreateSecretReference(onChange);
                    }
                  }
                }
              );
            }}
            disabled={validateSecretPath.isPending}
            className="inline-flex items-center gap-2 px-3 py-2 text-sm text-blue-600 hover:text-blue-700"
          >
            {validateSecretPath.isPending ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600" />
            ) : (
              <AlertTriangle className="w-4 h-4" />
            )}
            Validate Path
          </button>
          
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                setInputMode('text');
                setSelectedStore(null);
                setSecretPath('');
                setSecretKey('');
              }}
              className="px-3 py-2 text-sm text-gray-600 hover:text-gray-700"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => handleCreateSecretReference(onChange)}
              disabled={!secretPath}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Check className="w-4 h-4" />
              Use Secret
            </button>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className={clsx('relative', className)}>
      <Controller
        name={name}
        control={control}
        render={({ field }) => (
          <>
            {inputMode === 'text' ? (
              <div className="relative">
                <input
                  {...field}
                  ref={inputRef}
                  type={sensitive && !showPassword ? 'password' : 'text'}
                  className={clsx(
                    'block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm',
                    sensitive && 'pr-20',
                    !sensitive && secretStores.length > 0 && 'pr-10',
                    errors?.[name] && 'border-red-300 focus:border-red-500 focus:ring-red-500'
                  )}
                  placeholder={placeholder}
                  value={isSecretReference(field.value) ? formatSecretReference(field.value) : field.value || ''}
                  onChange={(e) => handleTextModeChange(e.target.value, field.onChange)}
                />
                
                {/* Password visibility toggle */}
                {sensitive && (
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-10 flex items-center pr-3"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-gray-400" />
                    ) : (
                      <Eye className="h-4 w-4 text-gray-400" />
                    )}
                  </button>
                )}
                
                {/* Secret store selector button */}
                {secretStores.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className="absolute inset-y-0 right-0 flex items-center pr-3"
                    title="Use secret store"
                  >
                    <Key className="h-4 w-4 text-gray-400 hover:text-gray-600" />
                  </button>
                )}
              </div>
            ) : (
              <div className="p-4 border border-gray-300 rounded-md bg-gray-50">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm font-medium text-gray-700">
                    Configure Secret Reference
                  </span>
                  <button
                    type="button"
                    onClick={() => setInputMode('text')}
                    className="text-sm text-blue-600 hover:text-blue-700"
                  >
                    Use text input instead
                  </button>
                </div>
                {renderSecretBrowser(field.value, field.onChange)}
              </div>
            )}

            {/* Dropdown for secret store selection */}
            {isDropdownOpen && inputMode === 'text' && (
              <div
                ref={dropdownRef}
                className="absolute z-50 mt-1 w-full bg-white shadow-lg max-h-96 rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none sm:text-sm"
              >
                <div className="p-3 border-b border-gray-200">
                  <p className="text-sm font-medium text-gray-900 mb-2">
                    Choose Secret Store
                  </p>
                  <p className="text-xs text-gray-500">
                    Select a secret store to reference instead of entering plain text
                  </p>
                </div>
                
                <div className="p-2">
                  <input
                    type="text"
                    placeholder="Search secret stores..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div className="max-h-48 overflow-y-auto">
                  {filteredStores.length > 0 ? (
                    filteredStores.map((store) => (
                      <button
                        key={store.id}
                        type="button"
                        onClick={() => {
                          setSelectedStore(store);
                          setInputMode('secret');
                          setIsDropdownOpen(false);
                        }}
                        className="w-full text-left p-3 hover:bg-gray-50 flex items-center"
                      >
                        <span className="text-lg mr-3">
                          {secretStoreTypeConfig[store.type].icon}
                        </span>
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {store.name}
                          </div>
                          <div className="text-xs text-gray-500">
                            {secretStoreTypeConfig[store.type].label}
                          </div>
                        </div>
                      </button>
                    ))
                  ) : (
                    <div className="p-4 text-center text-gray-500 text-sm">
                      No secret stores available
                    </div>
                  )}
                </div>
              </div>
            )}
          </>
        )}
      />
      
      {/* Error message */}
      {errors?.[name] && (
        <p className="mt-1 text-sm text-red-600">
          {errors[name]?.message as string}
        </p>
      )}
      
      {/* Secret reference display */}
      <Controller
        name={name}
        control={control}
        render={({ field }) => {
          if (isSecretReference(field.value)) {
            const store = secretStores.find(s => s.id === field.value.secretStoreId);
            return (
              <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded-md">
                <div className="flex items-center gap-2 text-sm text-blue-800">
                  <Key className="w-4 h-4" />
                  <span className="font-medium">Secret Reference:</span>
                  <span className="font-mono text-xs">
                    {formatSecretReference(field.value)}
                  </span>
                </div>
                {store && (
                  <p className="text-xs text-blue-600 mt-1">
                    From {store.name} ({secretStoreTypeConfig[store.type].label})
                  </p>
                )}
              </div>
            );
          }
          return null;
        }}
      />
    </div>
  );
};
