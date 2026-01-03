import React, { useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  ArrowLeft,
  Play,
  Save,
  Download,
  Settings,
  Eye,
  EyeOff,
  Grid3X3
} from 'lucide-react';
import { clsx } from 'clsx';

import AuthoringCanvas from '../../components/workflow/AuthoringCanvas';
import NodePalette from '../../components/workflow/NodePalette';
import Sidebar from '../../components/layout/Sidebar';
import KeyboardShortcutHelp from '../../components/ui/KeyboardShortcutHelp';
import SelectedNodeIndicator from '../../components/ui/SelectedNodeIndicator';
import { workflowApi, executionApi } from '../../services/api';
import { useWorkflowStore } from '../../stores/workflow';
import { useKeyboardShortcuts, createDuplicateShortcut, createDeleteShortcut, isMac } from '../../hooks/useKeyboardShortcuts';
import { generateWorkflowName } from '../../utils/formatters';
import type { WorkflowDefinition, NodeType } from '../../types/workflow';

const WorkflowAuthoringPage: React.FC = () => {
  const params = useParams<{ id?: string }>();
  const id = params.id || 'new';
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [showPalette, setShowPalette] = useState(true);
  const [showGrid, setShowGrid] = useState(true);

  const {
    currentWorkflow,
    setCurrentWorkflow,
    sidebarOpen,
    setSidebarOpen,
    selectedNodeId,
    setSelectedNodeId,
    resetWorkflow,
    workflowDirty,
    setWorkflowDirty
  } = useWorkflowStore();

  const {
    data: workflow,
    isLoading,
    error
  } = useQuery({
    queryKey: ['workflow', id],
    queryFn: () => id && id !== 'new' ? workflowApi.getWorkflow(id) : null,
    enabled: !!id && id !== 'new',
  });

  // Save workflow mutation
  const saveWorkflowMutation = useMutation({
    mutationFn: (workflowData: Partial<WorkflowDefinition>) => {
      if (!currentWorkflow?.id) {
        throw new Error('Cannot save workflow without an ID');
      }
      return workflowApi.updateWorkflow(currentWorkflow.id, workflowData);
    },
    onSuccess: async (savedWorkflow) => {
      setCurrentWorkflow(savedWorkflow);
      setWorkflowDirty(false);
      // Invalidate both workflow list and specific workflow queries
      await queryClient.invalidateQueries({ queryKey: ['workflows'] });
      await queryClient.invalidateQueries({ queryKey: ['workflow', savedWorkflow.id] });
    },
    onError: (error) => {
      console.error('Failed to save workflow:', error);
    },
  });

  React.useEffect(() => {
    if (id === 'new') {
      const startNode = {
        id: `start_${Date.now()}`,
        name: 'Start',
        type: 'START' as NodeType,
        position: { x: 200, y: 20 },
        data: {},
        sourcePosition: 'right'
      };

      const endNode = {
        id: `end_${Date.now()}`,
        name: 'End',
        type: 'END' as NodeType,
        position: { x: 600, y: 20 },
        data: {},
        sourcePosition: 'left'
      };

      const newWorkflowData = {
        name: generateWorkflowName(),
        description: '',
        nodes: [startNode, endNode],
        edges: [],
        tags: [],
        globals: {},
      };

      workflowApi.createWorkflow(newWorkflowData)
        .then((createdWorkflow) => {
          setCurrentWorkflow(createdWorkflow);
          // Invalidate workflow list cache
          queryClient.invalidateQueries({ queryKey: ['workflows'] });
          navigate(`/workflows/${createdWorkflow.id}/edit`, { replace: true });
        })
        .catch((error) => {
          console.error('Failed to create workflow:', error);
        });
    } else if (workflow) {
      setCurrentWorkflow(workflow);
    }

    return () => {
      resetWorkflow();
    };
  }, [workflow, id, setCurrentWorkflow, resetWorkflow, navigate, queryClient]);


  const handleSave = useCallback(async () => {
    if (currentWorkflow) {
      await saveWorkflowMutation.mutateAsync(currentWorkflow);
    }
  }, [currentWorkflow, saveWorkflowMutation]);

  const handleExecute = async () => {
    if (!currentWorkflow?.id) {
      // Save first if it's a new workflow
      if (workflowDirty) {
        await handleSave();
      }
      return;
    }

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

  const handleAddNode = useCallback((type: NodeType, position?: { x: number; y: number }) => {
    if ((type === 'START' || type === 'END') && currentWorkflow?.nodes.some(node => node.type === type)) {
      return;
    }

    const defaultPosition = position || { x: 300, y: 200 };
    const nodeId = `node_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const newNode = {
      id: nodeId,
      name: `${type.charAt(0).toUpperCase() + type.slice(1).toLowerCase().replace('_', ' ')} Node`,
      type: type,
      position: defaultPosition,
      data: {},
    };

    if (currentWorkflow) {
      const updatedWorkflow = {
        ...currentWorkflow,
        nodes: [...currentWorkflow.nodes, newNode],
      };
      setCurrentWorkflow(updatedWorkflow);
      setWorkflowDirty(true);
    }
  }, [currentWorkflow, setCurrentWorkflow, setWorkflowDirty]);

  // setSelectedNodeId is already available from the main useWorkflowStore call above

  const handleNodeConfigure = useCallback((nodeId: string) => {
    setSelectedNodeId(nodeId);
    setSidebarOpen(true);
  }, [setSelectedNodeId, setSidebarOpen]);

  const handleNodeDuplicate = useCallback((nodeId: string) => {
    if (!currentWorkflow) return;

    const nodeToDuplicate = currentWorkflow.nodes.find(n => n.id === nodeId);
    if (!nodeToDuplicate) return;

    const newNodeId = `node_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const duplicatedNode = {
      ...nodeToDuplicate,
      id: newNodeId,
      name: `${nodeToDuplicate.name} (Copy)`,
      position: {
        x: nodeToDuplicate.position.x + 50,
        y: nodeToDuplicate.position.y + 50,
      },
    };

    const updatedWorkflow = {
      ...currentWorkflow,
      nodes: [...currentWorkflow.nodes, duplicatedNode],
    };

    setCurrentWorkflow(updatedWorkflow);
    setWorkflowDirty(true);
  }, [currentWorkflow, setCurrentWorkflow, setWorkflowDirty]);

  const handleNodeDelete = useCallback((nodeId: string) => {
    if (!currentWorkflow) return;

    const nodeToDelete = currentWorkflow.nodes.find(n => n.id === nodeId);
    if (nodeToDelete?.type === 'START' || nodeToDelete?.type === 'END') {
      return;
    }

    const updatedWorkflow = {
      ...currentWorkflow,
      nodes: currentWorkflow.nodes.filter(n => n.id !== nodeId),
      edges: currentWorkflow.edges.filter(e => e.source !== nodeId && e.target !== nodeId),
    };

    setCurrentWorkflow(updatedWorkflow);
    setWorkflowDirty(true);

    if (selectedNodeId === nodeId) {
      setSelectedNodeId(null);
      setSidebarOpen(false);
    }
  }, [currentWorkflow, setCurrentWorkflow, setWorkflowDirty, selectedNodeId, setSelectedNodeId, setSidebarOpen]);

  const nodeActionHandler = {
    onConfigure: handleNodeConfigure,
    onDuplicate: handleNodeDuplicate,
    onDelete: handleNodeDelete,
  };

  // Keyboard shortcuts for selected node operations
  const handleKeyboardDuplicate = useCallback(() => {
    if (selectedNodeId) {
      handleNodeDuplicate(selectedNodeId);
    }
  }, [selectedNodeId, handleNodeDuplicate]);

  const handleKeyboardDelete = useCallback(() => {
    if (selectedNodeId) {
      handleNodeDelete(selectedNodeId);
    }
  }, [selectedNodeId, handleNodeDelete]);

  const handleKeyboardSave = useCallback(() => {
    handleSave();
  }, [handleSave]);

  // Setup keyboard shortcuts
  const shortcuts = [
    createDuplicateShortcut(handleKeyboardDuplicate),
    ...createDeleteShortcut(handleKeyboardDelete),
    {
      key: 's',
      [isMac ? 'metaKey' : 'ctrlKey']: true,
      callback: handleKeyboardSave,
    },
  ];

  useKeyboardShortcuts(shortcuts, true);

  const handleExportWorkflow = () => {
    if (currentWorkflow) {
      const dataStr = JSON.stringify(currentWorkflow, null, 2);
      const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);

      const exportFileDefaultName = `${currentWorkflow.name.replace(/\s+/g, '_')}.json`;

      const linkElement = document.createElement('a');
      linkElement.setAttribute('href', dataUri);
      linkElement.setAttribute('download', exportFileDefaultName);
      linkElement.click();
    }
  };

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="animate-pulse text-gray-500">Loading workflow...</div>
      </div>
    );
  }

  if (error && id !== 'new') {
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

  return (
    <div className="h-screen flex flex-col bg-gray-50">
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
              <div className="flex items-center space-x-3">
                <input
                  type="text"
                  value={currentWorkflow?.name || ''}
                  onChange={(e) => {
                    if (currentWorkflow) {
                      setCurrentWorkflow({
                        ...currentWorkflow,
                        name: e.target.value,
                      });
                      setWorkflowDirty(true);
                    }
                  }}
                  className="text-xl font-semibold text-gray-900 bg-transparent border-none focus:outline-none focus:ring-2 focus:ring-primary-500 rounded px-2 py-1"
                  placeholder="Workflow name..."
                />

                {workflowDirty && (
                  <span className="text-xs text-orange-600 bg-orange-100 px-2 py-1 rounded-full">
                    Unsaved changes
                  </span>
                )}
              </div>

              <input
                type="text"
                value={currentWorkflow?.description || ''}
                onChange={(e) => {
                  if (currentWorkflow) {
                    setCurrentWorkflow({
                      ...currentWorkflow,
                      description: e.target.value,
                    });
                    setWorkflowDirty(true);
                  }
                }}
                className="text-sm text-gray-600 bg-transparent border-none focus:outline-none focus:ring-2 focus:ring-primary-500 rounded px-2 py-1 mt-1"
                placeholder="Add description..."
              />
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {/* Canvas Controls */}
            <div className="flex items-center space-x-1 border-r border-gray-200 pr-3 mr-3">
              <button
                onClick={() => setShowGrid(!showGrid)}
                className={clsx(
                  'p-2 text-gray-400 hover:text-gray-600 transition-colors rounded',
                  showGrid && 'bg-gray-100 text-gray-600'
                )}
                title="Toggle grid"
              >
                <Grid3X3 className="w-4 h-4" />
              </button>

              <button
                onClick={() => setShowPalette(!showPalette)}
                className={clsx(
                  'p-2 text-gray-400 hover:text-gray-600 transition-colors rounded',
                  showPalette && 'bg-gray-100 text-gray-600'
                )}
                title="Toggle node palette"
              >
                <Settings className="w-4 h-4" />
              </button>

              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                title={sidebarOpen ? 'Hide details' : 'Show details'}
              >
                {sidebarOpen ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>

              <KeyboardShortcutHelp />
            </div>

            {/* Actions */}
            <button
              onClick={handleExportWorkflow}
              className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-colors"
            >
              <Download className="w-4 h-4 mr-2" />
              Export
            </button>

            <button
              onClick={handleSave}
              disabled={!workflowDirty || saveWorkflowMutation.isPending}
              className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              <Save className="w-4 h-4 mr-2" />
              {saveWorkflowMutation.isPending ? 'Saving...' : 'Save'}
            </button>

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
      <div className="flex-1 flex overflow-hidden">
        {/* Node Palette */}
        {showPalette && (
          <div className="w-80 border-r border-gray-200 bg-gray-50 p-4 overflow-y-auto">
            <NodePalette
              onAddNode={handleAddNode}
              disabledNodeTypes={
                currentWorkflow?.nodes.reduce((acc, node) => {
                  if (node.type === 'START') acc.push('START');
                  if (node.type === 'END') acc.push('END');
                  return acc;
                }, [] as NodeType[]) || []
              }
            />
          </div>
        )}

        {/* Canvas */}
        <div className="flex-1 relative">
          <AuthoringCanvas
            workflow={currentWorkflow || undefined}
            className="h-full"
            onNodeClick={(_nodeId) => {
              if (!sidebarOpen) setSidebarOpen(true);
            }}
            onAddNode={handleAddNode}
            nodeActionHandler={nodeActionHandler}
            onWorkflowChange={() => setWorkflowDirty(true)}
          />
        </div>

        {/* Sidebar */}
        <Sidebar
          isOpen={sidebarOpen && !!selectedNodeId}
          onClose={() => setSidebarOpen(false)}
          mode="authoring"
        />
      </div>

      {/* Selected Node Indicator */}
      {selectedNodeId && currentWorkflow && (
        <SelectedNodeIndicator
          nodeName={currentWorkflow.nodes.find(n => n.id === selectedNodeId)?.name}
          nodeType={currentWorkflow.nodes.find(n => n.id === selectedNodeId)?.type}
        />
      )}
    </div>
  );
};

export default WorkflowAuthoringPage;
