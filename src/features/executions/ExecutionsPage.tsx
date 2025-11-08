import React, { useState } from 'react';
import { Play } from 'lucide-react';

import { useExecutions } from './hooks';
import { ExecutionTable, ExecutionFilters, Pagination } from './components';
import { LoadingSpinner, ErrorState, EmptyState } from '../../components/ui';
import type { WorkflowStatus } from '../../types/workflow';


const ExecutionsPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<WorkflowStatus | 'ALL'>('ALL');
  const [page, setPage] = useState(0);
  const [pageSize] = useState(20);

  const {
    data,
    isLoading,
    error
  } = useExecutions({
    status: statusFilter !== 'ALL' ? statusFilter : undefined,
    page,
    size: pageSize,
  });

  const executions = data?.content || [];

  const filteredExecutions = executions.filter(execution => {
    if (!searchQuery) return true;
    const matchesSearch = execution.definitionSnapshot.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      execution.correlationId.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
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
      <div className="mb-6">
        <ExecutionFilters
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          statusFilter={statusFilter}
          onStatusChange={setStatusFilter}
        />
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
        <div>
          <ExecutionTable executions={filteredExecutions} />
          {data && <Pagination data={data} currentPage={page} onPageChange={setPage} />}
        </div>
      )}
    </div>
  );
};

export default ExecutionsPage;
