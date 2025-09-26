/*
 ************************************************************************
 * ADOBE CONFIDENTIAL ___________________
 * Copyright 2025 Adobe Systems Incorporated All Rights Reserved.
 * NOTICE: All information contained herein is, and remains the property of Adobe Systems
 * Incorporated and its suppliers, if any. The intellectual and technical concepts contained herein
 * are proprietary to Adobe Systems Incorporated and its suppliers and are protected by all
 * applicable intellectual property laws, including trade secret and copyright laws. Dissemination
 * of this information or reproduction of this material is strictly forbidden unless prior written
 * permission is obtained from Adobe Systems Incorporated.
 *************************************************************************
 */

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

import { ApiConfigForm } from '../../components/api';
import { useCreateApi } from '../../hooks/useApiManagement';
import type { ApiConfig } from '../../types/api';

/**
 * API creation page
 */
export const ApiCreatePage: React.FC = () => {
  const navigate = useNavigate();
  const createApi = useCreateApi();

  const handleSave = async (config: Partial<ApiConfig>) => {
    try {
      const newApi = await createApi.mutateAsync(config as Omit<ApiConfig, 'id' | 'createdAt' | 'updatedAt' | 'createdBy'>);
      navigate(`/apis/${newApi.id}`);
    } catch (error) {
      console.error('Failed to create API:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/apis')}
            className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to APIs
          </button>
          <h1 className="text-3xl font-bold text-gray-900">Create New API</h1>
          <p className="text-gray-600 mt-2">
            Configure a new API integration for your workflows
          </p>
        </div>

        {/* Form */}
        <ApiConfigForm
          onSave={handleSave}
          isLoading={createApi.isPending}
        />
      </div>
    </div>
  );
};
