import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { PaginatedResponse } from '../../../types/workflow';

interface PaginationProps<T> {
  data: PaginatedResponse<T>;
  currentPage: number;
  onPageChange: (page: number) => void;
}

const Pagination = <T,>({ data, currentPage, onPageChange }: PaginationProps<T>) => {
  if (data.totalPages <= 1) return null;

  return (
    <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
      <div className="text-sm text-gray-500">
        Showing {data.number * data.size + 1} to{' '}
        {Math.min((data.number + 1) * data.size, data.totalElements)} of {data.totalElements}{' '}
        executions
      </div>
      <div className="flex items-center space-x-2">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={data.first}
          className="p-2 border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        <span className="text-sm text-gray-700">
          Page {data.number + 1} of {data.totalPages}
        </span>
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={data.last}
          className="p-2 border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default Pagination;
