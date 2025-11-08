import React from 'react';
import { Search } from 'lucide-react';
import type { WorkflowStatus } from '../../../types/workflow';

interface ExecutionFiltersProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  statusFilter: WorkflowStatus | 'ALL';
  onStatusChange: (value: WorkflowStatus | 'ALL') => void;
}

const ExecutionFilters: React.FC<ExecutionFiltersProps> = ({
  searchQuery,
  onSearchChange,
  statusFilter,
  onStatusChange,
}) => {
  return (
    <div className="flex items-center space-x-4">
      <div className="flex-1 relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
        <input
          type="text"
          placeholder="Search executions..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
        />
      </div>

      <select
        value={statusFilter}
        onChange={(e) => onStatusChange(e.target.value as WorkflowStatus | 'ALL')}
        className="px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
      >
        <option value="ALL">All Status</option>
        <option value="PENDING">Pending</option>
        <option value="RUNNING">Running</option>
        <option value="SUCCESS">Success</option>
        <option value="FAILED">Failed</option>
      </select>
    </div>
  );
};

export default ExecutionFilters;
