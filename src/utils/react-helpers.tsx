import React from 'react';
import { getStatusIconConfig } from './workflow-config';
import type { WorkflowStatus } from '../types/workflow';

export const getStatusIcon = (status?: WorkflowStatus) => {
  const config = getStatusIconConfig(status);
  const Icon = config.icon;
  
  return (
    <Icon 
      className={`${config.className} ${config.animate ? 'animate-pulse' : ''}`} 
    />
  );
};

export const renderStatusIcon = (status?: WorkflowStatus, additionalClasses?: string) => {
  const config = getStatusIconConfig(status);
  const Icon = config.icon;
  
  return (
    <Icon 
      className={`${config.className} ${config.animate ? 'animate-pulse' : ''} ${additionalClasses || ''}`} 
    />
  );
};
