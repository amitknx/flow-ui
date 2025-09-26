import React from 'react';
import { clsx } from 'clsx';
import { statusConfig } from '../../utils';
import type { WorkflowStatus } from '../../types/workflow';

interface StatusBadgeProps {
  status: WorkflowStatus;
  className?: string;
  showIcon?: boolean;
  size?: 'sm' | 'md';
}

const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  className,
  showIcon = true,
  size = 'md'
}) => {
  const config = statusConfig[status];
  const Icon = config.icon;
  
  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-0.5 text-xs'
  };
  
  const iconSizeClasses = {
    sm: 'w-3 h-3',
    md: 'w-3 h-3'
  };

  return (
    <div className={clsx(
      'inline-flex items-center rounded-full font-medium border',
      sizeClasses[size],
      config.bgColor,
      config.color,
      config.borderColor,
      className
    )}>
      {showIcon && (
        <Icon className={clsx(
          iconSizeClasses[size],
          'mr-1',
          config.animate && 'animate-pulse'
        )} />
      )}
      {config.label}
    </div>
  );
};

export default StatusBadge;
