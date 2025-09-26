import React from 'react';
import { clsx } from 'clsx';
import type { LucideIcon } from 'lucide-react';

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
    variant?: 'primary' | 'secondary';
  };
  className?: string;
}

const EmptyState: React.FC<EmptyStateProps> = ({
  icon: Icon,
  title,
  description,
  action,
  className
}) => {
  return (
    <div className={clsx('text-center py-12', className)}>
      {Icon && (
        <div className="w-12 h-12 mx-auto bg-gray-100 rounded-lg flex items-center justify-center mb-4">
          <Icon className="w-6 h-6 text-gray-400" />
        </div>
      )}
      <h3 className="text-lg font-medium text-gray-900 mb-2">{title}</h3>
      {description && (
        <p className="text-gray-500 mb-4">{description}</p>
      )}
      {action && (
        <button
          onClick={action.onClick}
          className={clsx(
            'inline-flex items-center px-4 py-2 border text-sm font-medium rounded-md transition-colors',
            action.variant === 'secondary' 
              ? 'border-gray-300 text-gray-700 bg-white hover:bg-gray-50'
              : 'border-transparent text-white bg-primary-600 hover:bg-primary-700'
          )}
        >
          {action.label}
        </button>
      )}
    </div>
  );
};

export default EmptyState;
