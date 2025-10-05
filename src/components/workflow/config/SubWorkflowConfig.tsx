import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useWorkflowStore } from '../../../stores/workflow';
import { workflowApi } from '../../../services/api';

interface SubWorkflowConfigProps {
  nodeId: string;
  data?: Record<string, any>;
}

type ExecutionMode = 'SYNC' | 'ASYNC';

const SubWorkflowConfig: React.FC<SubWorkflowConfigProps> = ({ nodeId, data }) => {
  const { updateNodeData, currentWorkflow } = useWorkflowStore();
  const [selectedWorkflowId, setSelectedWorkflowId] = useState<string>(data?.workflowId || '');
  const [executionMode, setExecutionMode] = useState<ExecutionMode>(data?.executionMode || 'SYNC');
  const [inputMapping, setInputMapping] = useState<string>(
    data?.inputMapping ? JSON.stringify(data.inputMapping, null, 2) : ''
  );

  const { data: workflows, isLoading } = useQuery({
    queryKey: ['workflows'],
    queryFn: () => workflowApi.listWorkflows(),
  });

  const selectedWorkflow = workflows?.find(wf => wf.id === selectedWorkflowId);

  // Filter out current workflow to prevent circular references
  const availableWorkflows = workflows?.filter(wf => wf.id !== currentWorkflow?.id) || [];

  useEffect(() => {
    if (selectedWorkflowId) {
      const mapping = inputMapping ? JSON.parse(inputMapping) : undefined;
      updateNodeData(nodeId, {
        workflowId: selectedWorkflowId,
        executionMode,
        inputMapping: mapping,
      });
    }
  }, [selectedWorkflowId, executionMode, inputMapping, nodeId, updateNodeData]);

  return (
    <div className="space-y-4">
      {/* Workflow Selection */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          Sub-Workflow
        </label>
        <select
          value={selectedWorkflowId}
          onChange={(e) => setSelectedWorkflowId(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
          disabled={isLoading}
        >
          <option value="">Select a workflow...</option>
          {availableWorkflows.map((workflow) => (
            <option key={workflow.id} value={workflow.id}>
              {workflow.name}
            </option>
          ))}
        </select>
        {isLoading && (
          <p className="text-xs text-gray-500">Loading workflows...</p>
        )}
      </div>

      {/* Workflow Details */}
      {selectedWorkflow && (
        <div className="bg-gray-50 p-3 rounded-md space-y-1">
          <div className="text-xs">
            <span className="font-medium text-gray-700">Name:</span>
            <span className="ml-2 text-gray-900">{selectedWorkflow.name}</span>
          </div>
          {selectedWorkflow.description && (
            <div className="text-xs">
              <span className="font-medium text-gray-700">Description:</span>
              <p className="ml-2 text-gray-600">{selectedWorkflow.description}</p>
            </div>
          )}
        </div>
      )}

      {/* Execution Mode */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          Execution Mode
        </label>
        <select
          value={executionMode}
          onChange={(e) => setExecutionMode(e.target.value as ExecutionMode)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
        >
          <option value="SYNC">SYNC - Wait for completion</option>
          <option value="ASYNC">ASYNC - Fire and forget</option>
        </select>
        <p className="text-xs text-gray-500">
          {executionMode === 'SYNC'
            ? 'Parent workflow will wait for sub-workflow to complete'
            : 'Parent workflow will continue immediately after triggering'}
        </p>
      </div>

      {/* Input Mapping */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          Input Mapping (JSON)
        </label>
        <textarea
          value={inputMapping}
          onChange={(e) => setInputMapping(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 font-mono text-xs"
          rows={6}
          placeholder='{\n  "key": "$.output.value"\n}'
        />
        <p className="text-xs text-gray-500">
          Map parent workflow data to sub-workflow inputs using JSONPath
        </p>
      </div>
    </div>
  );
};

export default SubWorkflowConfig;
