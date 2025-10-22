import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import {
  Plus,
  Search,
  Filter,
  MoreHorizontal,
  Play,
  Copy,
  Calendar,
  User,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

import { workflowApi } from '../../services/api';
import { formatDate } from '../../utils';
import { LoadingSpinner, ErrorState, EmptyState } from '../../components/ui';

const WorkflowsPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterOpen, setFilterOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize] = useState(12);

  const {
    data,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['workflows', currentPage, pageSize],
    queryFn: () => workflowApi.getWorkflows({ page: currentPage, size: pageSize }),
  });

  const workflows = data?.content || [];
  const totalPages = data?.totalPages || 0;
  const totalElements = data?.totalElements || 0;

  const filteredWorkflows = workflows.filter(workflow =>
    workflow.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    workflow.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );


  const handleExecuteWorkflow = async (workflowId: string) => {
    try {
      const result = await workflowApi.executeWorkflow(workflowId);
      console.log('Workflow executed:', result);
      // Navigate to execution view
      window.location.href = `/executions/${result.executionId}`;
    } catch (error) {
      console.error('Failed to execute workflow:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="p-8">
        <LoadingSpinner size="lg" text="Loading workflows..." className="h-96" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8">
        <ErrorState
          title="Failed to load workflows"
          error={error}
          onRetry={() => refetch()}
        />
      </div>
    );
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Workflows</h1>
          <p className="text-gray-600 mt-1">
            Design and manage your workflow definitions
          </p>
        </div>
        
        <Link
          to="/workflows/new"
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors"
        >
          <Plus className="w-4 h-4 mr-2" />
          New Workflow
        </Link>
      </div>

      {/* Search and Filters */}
      <div className="flex items-center space-x-4 mb-6">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search workflows..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          />
        </div>
        
        <button
          onClick={() => setFilterOpen(!filterOpen)}
          className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
        >
          <Filter className="w-4 h-4 mr-2" />
          Filters
        </button>
      </div>

      {/* Workflows Grid */}
      {filteredWorkflows.length === 0 ? (
        <EmptyState
          icon={Plus}
          title="No workflows found"
          description={searchQuery ? 'Try adjusting your search terms.' : 'Get started by creating your first workflow.'}
          action={!searchQuery ? {
            label: 'Create Workflow',
            onClick: () => window.location.href = '/workflows/new'
          } : undefined}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredWorkflows.map((workflow) => (
            <div key={workflow.id} className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <Link 
                      to={`/workflows/${workflow.id}`}
                      className="text-lg font-semibold text-gray-900 hover:text-primary-600 transition-colors"
                    >
                      {workflow.name}
                    </Link>
                    {workflow.description && (
                      <p className="text-gray-600 text-sm mt-1 line-clamp-2">
                        {workflow.description}
                      </p>
                    )}
                  </div>
                  
                  <div className="relative">
                    <button className="p-1 text-gray-400 hover:text-gray-600 transition-colors">
                      <MoreHorizontal className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Tags */}
                {workflow.tags && workflow.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {workflow.tags.slice(0, 3).map((tag) => (
                      <span 
                        key={tag}
                        className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800"
                      >
                        {tag}
                      </span>
                    ))}
                    {workflow.tags.length > 3 && (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                        +{workflow.tags.length - 3} more
                      </span>
                    )}
                  </div>
                )}

                {/* Metadata */}
                <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
                  <div className="flex items-center space-x-1">
                    <User className="w-3 h-3" />
                    <span>{workflow.createdBy}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Calendar className="w-3 h-3" />
                    <span>{formatDate(workflow.createdAt)}</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleExecuteWorkflow(workflow.id)}
                    className="flex-1 inline-flex items-center justify-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 transition-colors"
                  >
                    <Play className="w-4 h-4 mr-2" />
                    Execute
                  </button>
                  
                  <Link
                    to={`/workflows/${workflow.id}/edit`}
                    className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                    title="Edit workflow"
                  >
                    <Copy className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {!searchQuery && totalPages > 1 && (
        <div className="mt-8 flex items-center justify-between border-t border-gray-200 pt-6">
          <div className="text-sm text-gray-700">
            Showing <span className="font-medium">{currentPage * pageSize + 1}</span> to{' '}
            <span className="font-medium">
              {Math.min((currentPage + 1) * pageSize, totalElements)}
            </span>{' '}
            of <span className="font-medium">{totalElements}</span> workflows
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setCurrentPage(prev => Math.max(0, prev - 1))}
              disabled={currentPage === 0}
              className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="w-4 h-4 mr-1" />
              Previous
            </button>

            <div className="flex items-center space-x-1">
              {Array.from({ length: totalPages }, (_, i) => i).map((page) => {
                if (
                  page === 0 ||
                  page === totalPages - 1 ||
                  (page >= currentPage - 1 && page <= currentPage + 1)
                ) {
                  return (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                        currentPage === page
                          ? 'bg-primary-600 text-white'
                          : 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      {page + 1}
                    </button>
                  );
                } else if (page === currentPage - 2 || page === currentPage + 2) {
                  return <span key={page} className="px-2 text-gray-500">...</span>;
                }
                return null;
              })}
            </div>

            <button
              onClick={() => setCurrentPage(prev => Math.min(totalPages - 1, prev + 1))}
              disabled={currentPage >= totalPages - 1}
              className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              Next
              <ChevronRight className="w-4 h-4 ml-1" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default WorkflowsPage;
