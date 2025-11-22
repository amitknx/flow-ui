import React, { useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  ArrowLeft,
  RefreshCw,
  Eye,
  EyeOff,
  CheckCircle,
  XCircle,
  Clock,
  Pause,
  StopCircle
} from 'lucide-react';
import { clsx } from 'clsx';

import WorkflowCanvas from '../../components/workflow/WorkflowCanvas';
import Sidebar from '../../components/layout/Sidebar';
import { executionApi } from '../../services/api';
import { webSocketService } from '../../services/websocket';
import { useWorkflowStore } from '../../stores/workflow';
import { useCancelExecution } from './hooks';
import { transformExecutionToSnapshot } from '../../utils/execution-transformer';


const statusConfig = {
  PENDING: {
    icon: Pause,
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-50',
    label: 'Pending'
  },
  RUNNING: {
    icon: Clock,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    label: 'Running',
    animate: true
  },
  SUCCESS: {
    icon: CheckCircle,
    color: 'text-green-600',
    bgColor: 'bg-green-50',
    label: 'Success'
  },
  FAILED: {
    icon: XCircle,
    color: 'text-red-600',
    bgColor: 'bg-red-50',
    label: 'Failed'
  },
};

const ExecutionDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [isConnected, setIsConnected] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);

  const {
    executionSnapshot,
    setCurrentExecution,
    setExecutionSnapshot,
    sidebarOpen,
    setSidebarOpen,
    selectedNodeId,
    resetExecution
  } = useWorkflowStore();

  const cancelExecutionMutation = useCancelExecution();

  // Fetch execution data
  const {
    data: execution,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['execution', id],
    queryFn: () => id ? executionApi.getExecution(id) : null,
    enabled: !!id,
    refetchInterval: (query) => {
      // Auto-refresh running executions every 5 seconds
      return query.state.data?.status === 'RUNNING' ? 5000 : false;
    },
  });

  // Transform execution data to snapshot format for canvas visualization
  const transformedSnapshot = useMemo(() => {
    if (!execution) return null;
    return transformExecutionToSnapshot(execution);
  }, [execution]);



  // Set up WebSocket connection for real-time updates
  useEffect(() => {
    if (!execution || !id) return;

    const connectWebSocket = async () => {
      try {
        await webSocketService.connect();
        setIsConnected(true);

        // Subscribe to execution updates
        const unsubscribe = webSocketService.subscribeToExecution(
          execution.workflowId,
          id
        );

        // Note: WebSocket updates for execution snapshot are disabled
        // since we're using the REST API data directly

        return () => {
          unsubscribe();
        };
      } catch (error) {
        console.error('Failed to connect to WebSocket:', error);
        setIsConnected(false);
      }
    };

    const cleanup = connectWebSocket();

    return () => {
      cleanup.then(fn => fn?.());
      resetExecution();
    };
  }, [execution, id, resetExecution]);

  // Update store when data changes
  useEffect(() => {
    if (execution) {
      setCurrentExecution(execution);
    }
  }, [execution, setCurrentExecution]);

  // Update store with transformed snapshot
  useEffect(() => {
    if (transformedSnapshot) {
      setExecutionSnapshot(transformedSnapshot);
    }
  }, [transformedSnapshot, setExecutionSnapshot]);



  const formatDuration = (ms?: number) => {
    if (!ms) return 'N/A';
    if (ms < 1000) return `${ms}ms`;
    if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
    return `${(ms / 60000).toFixed(1)}m`;
  };

  const formatTimestamp = (timestamp?: string) => {
    if (!timestamp) return 'N/A';
    return new Date(timestamp).toLocaleString();
  };

  const handleCancelExecution = async () => {
    if (!id) return;

    try {
      await cancelExecutionMutation.mutateAsync(id);
      setShowCancelConfirm(false);
    } catch (error) {
      console.error('Failed to cancel execution:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="animate-pulse text-gray-500">Loading execution...</div>
      </div>
    );
  }

  if (error || !execution) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Failed to load execution</h2>
          <p className="text-gray-600 mb-4">
            {error instanceof Error ? error.message : 'Execution not found'}
          </p>
          <button
            onClick={() => navigate('/executions')}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Executions
          </button>
        </div>
      </div>
    );
  }

  const statusInfo = statusConfig[execution.status];
  const StatusIcon = statusInfo.icon;

  return (
    <div className="h-screen flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate('/executions')}
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>

            <div>
              <div className="flex items-center space-x-3">
                <h1 className="text-xl font-semibold text-gray-900">
                  {execution.definitionSnapshot.name}
                </h1>

                <div className={clsx(
                  'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
                  statusInfo.bgColor,
                  statusInfo.color
                )}>
                  <StatusIcon className={clsx(
                    'w-3 h-3 mr-1',
                    'animate' in statusInfo && statusInfo.animate && 'animate-pulse'
                  )} />
                  {statusInfo.label}
                </div>

                {isConnected && execution.status === 'RUNNING' && (
                  <div className="flex items-center space-x-1 text-xs text-green-600">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span>Live</span>
                  </div>
                )}
              </div>

              <div className="flex items-center space-x-4 text-sm text-gray-600 mt-1">
                <span>Correlation ID: {execution.correlationId}</span>
                <span>•</span>
                <span>Started: {formatTimestamp(execution.startedAt)}</span>
                {execution.endedAt && (
                  <>
                    <span>•</span>
                    <span>Duration: {formatDuration(execution.duration)}</span>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {/* Cancel Execution Button */}
            {execution.status === 'RUNNING' && (
              <button
                onClick={() => setShowCancelConfirm(true)}
                disabled={cancelExecutionMutation.isPending}
                className="px-3 py-1.5 text-sm font-medium text-red-600 border border-red-300 rounded-md hover:bg-red-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-1"
              >
                <StopCircle className="w-4 h-4" />
                <span>Cancel</span>
              </button>
            )}

            {/* Connection Status */}
            <div className="flex items-center space-x-2 text-xs text-gray-500">
              <div className={clsx(
                'w-2 h-2 rounded-full',
                isConnected ? 'bg-green-500' : 'bg-gray-300'
              )}></div>
              <span>{isConnected ? 'Connected' : 'Disconnected'}</span>
            </div>

            {/* Sidebar Toggle */}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
              title={sidebarOpen ? 'Hide details' : 'Show details'}
            >
              {sidebarOpen ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>

            {/* Refresh */}
            <button
              onClick={() => refetch()}
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
              title="Refresh"
            >
              <RefreshCw className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 relative">
        <WorkflowCanvas
          executionSnapshot={executionSnapshot || undefined}
          mode="execution"
          className="h-full"
          onNodeClick={() => {
            if (!sidebarOpen) setSidebarOpen(true);
          }}
        />

        {/* Sidebar */}
        <Sidebar
          isOpen={sidebarOpen && !!selectedNodeId}
          onClose={() => setSidebarOpen(false)}
        />
      </div>

      {/* Cancel Confirmation Modal */}
      {showCancelConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Cancel Execution
            </h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to cancel this execution? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowCancelConfirm(false)}
                disabled={cancelExecutionMutation.isPending}
                className="px-4 py-2 text-sm font-medium text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                No, Keep Running
              </button>
              <button
                onClick={handleCancelExecution}
                disabled={cancelExecutionMutation.isPending}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center space-x-2"
              >
                {cancelExecutionMutation.isPending ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Canceling...</span>
                  </>
                ) : (
                  <>
                    <StopCircle className="w-4 h-4" />
                    <span>Yes, Cancel</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExecutionDetailPage;
