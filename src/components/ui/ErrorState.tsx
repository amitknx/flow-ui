import React from 'react';
import { AlertCircle } from 'lucide-react';
import { clsx } from 'clsx';

interface ErrorStateProps {
  title?: string;
  message?: string;
  error?: Error | unknown;
  onRetry?: () => void;
  className?: string;
  retryText?: string;
}

const ErrorState: React.FC<ErrorStateProps> = ({
  title = 'Something went wrong',
  message,
  error,
  onRetry,
  className,
  retryText = 'Try again'
}) => {
  const errorMessage = message || 
    (error instanceof Error ? error.message : 'An unexpected error occurred');

  return (
    <div className={clsx('bg-red-50 border border-red-200 rounded-lg p-4', className)}>
      <div className="flex items-start">
        <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
        <div className="ml-3 flex-1">
          <h3 className="text-red-800 font-medium">{title}</h3>
          <p className="text-red-600 text-sm mt-1">{errorMessage}</p>
          {onRetry && (
            <button 
              onClick={onRetry}
              className="mt-3 text-red-600 hover:text-red-700 text-sm font-medium transition-colors"
            >
              {retryText}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ErrorState;
