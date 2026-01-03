import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  ArrowLeft,
  Play,
  Save,
  Copy,
  Settings,
  Eye,
  EyeOff
} from 'lucide-react';

import WorkflowCanvas from '../../components/workflow/WorkflowCanvas';
import Sidebar from '../../components/layout/Sidebar';
import { workflowApi, executionApi } from '../../services/api';
import { useWorkflowStore } from '../../stores/workflow';

const WorkflowDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);

  const {
    currentWorkflow,
    setCurrentWorkflow,
    sidebarOpen,
    setSidebarOpen,
    selectedNodeId,
    resetWorkflow
  } = useWorkflowStore();

  const {
    data: workflow,
    isLoading,
    error
  } = useQuery({
    queryKey: ['workflow', id],
    queryFn: () => id ? workflowApi.getWorkflow(id) : null,
    enabled: !!id && id !== 'new',
  });

  useEffect(() => {
    if (workflow) {
      setCurrentWorkflow(workflow);
    }

    return () => {
      resetWorkflow();
    };
  }, [workflow, setCurrentWorkflow, resetWorkflow]);

  const handleExecute = async () => {
    if (!currentWorkflow) return;

    try {
      const result = await executionApi.createExecution({
        workflowId: currentWorkflow.id,
        triggerType: 'MANUAL',
      });
      navigate(`/executions/${result.id}`);
    } catch (error) {
      console.error('Failed to execute workflow:', error);
    }
  };

  const handleSave = async () => {
    if (!currentWorkflow) return;

    try {
      // Implementation for saving workflow changes
      console.log('Saving workflow:', currentWorkflow);
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to save workflow:', error);
    }
  };

  const handleClone = async () => {
    if (!currentWorkflow) return;

    try {
      const clonedWorkflow = await workflowApi.cloneWorkflow(currentWorkflow.id);
      navigate(`/workflows/${clonedWorkflow.id}/edit`);
    } catch (error) {
      console.error('Failed to clone workflow:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="animate-pulse text-gray-500">Loading workflow...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Failed to load workflow</h2>
          <p className="text-gray-600 mb-4">
            {error instanceof Error ? error.message : 'An unexpected error occurred'}
          </p>
          <button
            onClick={() => navigate('/workflows')}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Workflows
          </button>
        </div>
      </div>
    );
  }

  if (id === 'new') {
    // Handle new workflow creation
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Create New Workflow</h2>
          <p className="text-gray-600 mb-4">Workflow creation UI coming soon...</p>
          <button
            onClick={() => navigate('/workflows')}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Workflows
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate('/workflows')}
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>

            <div>
              <h1 className="text-xl font-semibold text-gray-900">
                {currentWorkflow?.name || 'Untitled Workflow'}
              </h1>
              {currentWorkflow?.description && (
                <p className="text-sm text-gray-600">{currentWorkflow.description}</p>
              )}
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {/* Sidebar Toggle */}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
              title={sidebarOpen ? 'Hide details' : 'Show details'}
            >
              {sidebarOpen ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>

            {/* Actions */}
            <button
              onClick={handleClone}
              className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-colors"
            >
              <Copy className="w-4 h-4 mr-2" />
              Clone
            </button>

            {isEditing ? (
              <button
                onClick={handleSave}
                className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 transition-colors"
              >
                <Save className="w-4 h-4 mr-2" />
                Save
              </button>
            ) : (
              <button
                onClick={() => navigate(`/workflows/${id}/edit`)}
                className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-colors"
              >
                <Settings className="w-4 h-4 mr-2" />
                Edit
              </button>
            )}

            <button
              onClick={handleExecute}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 transition-colors"
            >
              <Play className="w-4 h-4 mr-2" />
              Execute
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 relative">
        <WorkflowCanvas
          workflow={currentWorkflow || undefined}
          mode="authoring"
          className="h-full"
          onNodeClick={(nodeId) => {
            if (!sidebarOpen) setSidebarOpen(true);
          }}
        />

        {/* Sidebar */}
        <Sidebar
          isOpen={sidebarOpen && !!selectedNodeId}
          onClose={() => setSidebarOpen(false)}
        />
      </div>
    </div>
  );
};

export default WorkflowDetailPage;
