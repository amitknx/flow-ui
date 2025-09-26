import React from 'react';
import { clsx } from 'clsx';

interface LoadingSpinnerProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  text?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  className, 
  size = 'md', 
  text = 'Loading...' 
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12'
  };

  return (
    <div className={clsx('flex items-center justify-center', className)}>
      <div className="text-center">
        <div className={clsx(
          'animate-spin rounded-full border-2 border-gray-300 border-t-primary-600 mx-auto mb-2',
          sizeClasses[size]
        )} />
        <div className="text-gray-500">{text}</div>
      </div>
    </div>
  );
};

export default LoadingSpinner;
