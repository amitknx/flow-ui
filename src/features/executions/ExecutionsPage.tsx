import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { 
  Search, 
  Play,
  ExternalLink
} from 'lucide-react';

import { workflowApi } from '../../services/api';
import { formatDate, formatDuration } from '../../utils';
import { LoadingSpinner, ErrorState, EmptyState, StatusBadge } from '../../components/ui';
import type { WorkflowExecution, WorkflowStatus } from '../../types/workflow';


const ExecutionsPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<WorkflowStatus | 'ALL'>('ALL');

  // For now, we'll fetch all workflows and their executions
  // In a real app, you'd have a dedicated executions endpoint
  const { 
    data: workflows = [], 
    isLoading, 
    error 
  } = useQuery({
    queryKey: ['workflows'],
    queryFn: () => workflowApi.getWorkflows(),
  });

  // Mock execution data - in real app this would come from API
  const mockExecutions: WorkflowExecution[] = workflows.flatMap(workflow => [
    {
      id: `exec-${workflow.id}-1`,
      workflowId: workflow.id,
      correlationId: `corr-${Date.now()}`,
      status: 'SUCCESS' as WorkflowStatus,
      triggerType: 'MANUAL',
      definitionSnapshot: workflow,
      startedAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
      endedAt: new Date(Date.now() - 1000 * 60 * 25).toISOString(),
      duration: 1000 * 60 * 5,
    },
    {
      id: `exec-${workflow.id}-2`,
      workflowId: workflow.id,
      correlationId: `corr-${Date.now() - 1000}`,
      status: 'RUNNING' as WorkflowStatus,
      triggerType: 'API',
      definitionSnapshot: workflow,
      startedAt: new Date(Date.now() - 1000 * 60 * 10).toISOString(),
    },
  ]);

  const filteredExecutions = mockExecutions.filter(execution => {
    const matchesSearch = execution.definitionSnapshot.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      execution.correlationId.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === 'ALL' || execution.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });


  if (isLoading) {
    return (
      <div className="p-8">
        <LoadingSpinner size="lg" text="Loading executions..." className="h-96" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8">
        <ErrorState
          title="Failed to load executions"
          error={error}
        />
      </div>
    );
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Executions</h1>
          <p className="text-gray-600 mt-1">
            Monitor workflow execution status and performance
          </p>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex items-center space-x-4 mb-6">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search executions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          />
        </div>
        
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as WorkflowStatus | 'ALL')}
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
        >
          <option value="ALL">All Status</option>
          <option value="PENDING">Pending</option>
          <option value="RUNNING">Running</option>
          <option value="SUCCESS">Success</option>
          <option value="FAILED">Failed</option>
        </select>
      </div>

      {/* Executions List */}
      {filteredExecutions.length === 0 ? (
        <EmptyState
          icon={Play}
          title="No executions found"
          description={
            searchQuery || statusFilter !== 'ALL' 
              ? 'Try adjusting your search or filter criteria.' 
              : 'Execute a workflow to see results here.'
          }
        />
      ) : (
        <div className="bg-white shadow-sm border border-gray-200 rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Workflow
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Trigger
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Duration
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Started
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Correlation ID
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredExecutions.map((execution) => {
                  return (
                    <tr key={execution.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {execution.definitionSnapshot.name}
                            </div>
                            <div className="text-sm text-gray-500">
                              {execution.definitionSnapshot.description}
                            </div>
                          </div>
                        </div>
                      </td>
                      
                      <td className="px-6 py-4 whitespace-nowrap">
                        <StatusBadge status={execution.status} />
                      </td>
                      
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-gray-100 text-gray-800">
                          {execution.triggerType}
                        </span>
                      </td>
                      
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDuration(execution.duration)}
                      </td>
                      
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(execution.startedAt)}
                      </td>
                      
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-500">
                        {execution.correlationId}
                      </td>
                      
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <Link
                          to={`/executions/${execution.id}`}
                          className="text-primary-600 hover:text-primary-900 inline-flex items-center"
                        >
                          View
                          <ExternalLink className="w-3 h-3 ml-1" />
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExecutionsPage;
