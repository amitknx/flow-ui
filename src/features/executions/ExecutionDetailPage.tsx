import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { 
  ArrowLeft, 
  RefreshCw, 
  Eye,
  EyeOff,
  Play,
  CheckCircle,
  XCircle,
  Clock,
  Pause
} from 'lucide-react';
import { clsx } from 'clsx';

import WorkflowCanvas from '../../components/workflow/WorkflowCanvas';
import Sidebar from '../../components/layout/Sidebar';
import { workflowApi } from '../../services/api';
import { webSocketService } from '../../services/websocket';
import { useWorkflowStore } from '../../stores/workflow';
import type { ExecutionSnapshot, WorkflowStatus } from '../../types/workflow';

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
  
  const { 
    currentExecution,
    executionSnapshot,
    setCurrentExecution,
    setExecutionSnapshot,
    updateExecutionSnapshot,
    sidebarOpen,
    setSidebarOpen,
    selectedNodeId,
    resetExecution
  } = useWorkflowStore();

  // Fetch execution data
  const { 
    data: execution, 
    isLoading, 
    error,
    refetch
  } = useQuery({
    queryKey: ['execution', id],
    queryFn: () => id ? workflowApi.getExecution(id) : null,
    enabled: !!id,
    refetchInterval: (data) => {
      // Auto-refresh running executions every 5 seconds
      return data?.status === 'RUNNING' ? 5000 : false;
    },
  });

  // Fetch execution snapshot
  const { data: snapshot } = useQuery({
    queryKey: ['execution-snapshot', id],
    queryFn: () => id ? workflowApi.getExecutionSnapshot(id) : null,
    enabled: !!id,
    refetchInterval: (data) => {
      return data?.summary.status === 'RUNNING' ? 3000 : false;
    },
  });

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

        // Listen for updates
        const removeListener = webSocketService.addEventListener((message) => {
          if (message.type === 'EXECUTION_UPDATE') {
            updateExecutionSnapshot(message.payload as ExecutionSnapshot);
          }
        });

        return () => {
          unsubscribe();
          removeListener();
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
  }, [execution, id, updateExecutionSnapshot, resetExecution]);

  // Update store when data changes
  useEffect(() => {
    if (execution) {
      setCurrentExecution(execution);
    }
  }, [execution, setCurrentExecution]);

  useEffect(() => {
    if (snapshot) {
      setExecutionSnapshot(snapshot);
    }
  }, [snapshot, setExecutionSnapshot]);

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
                    statusInfo.animate && 'animate-pulse'
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

export default ExecutionDetailPage;
