import React, { useState, useEffect } from 'react';
import { useWorkflowStore } from '../../../stores/workflow';

interface JoinConfigProps {
  nodeId: string;
  data?: Record<string, any>;
}

type JoinPolicy = 'ALL' | 'ANY' | 'COUNT';

const JoinConfig: React.FC<JoinConfigProps> = ({ nodeId, data }) => {
  const { updateNodeData } = useWorkflowStore();
  const [policy, setPolicy] = useState<JoinPolicy>(data?.policy || 'ALL');
  const [count, setCount] = useState<string>(data?.count?.toString() || '2');

  // Reset local state when nodeId changes (switching between different nodes)
  useEffect(() => {
    setPolicy(data?.policy || 'ALL');
    setCount(data?.count?.toString() || '2');
  }, [nodeId]); // Only reset when nodeId changes

  // Update store when local state changes
  useEffect(() => {
    const configData: Record<string, any> = { policy };
    if (policy === 'COUNT') {
      const countValue = parseInt(count, 10);
      if (!isNaN(countValue) && countValue > 0) {
        configData.count = countValue;
      }
    }
    updateNodeData(nodeId, configData);
  }, [policy, count, nodeId, updateNodeData]);

  return (
    <div className="space-y-4">
      {/* Join Policy */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          Join Policy
        </label>
        <select
          value={policy}
          onChange={(e) => setPolicy(e.target.value as JoinPolicy)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
        >
          <option value="ALL">ALL - Wait for all incoming branches</option>
          <option value="ANY">ANY - Continue when any branch completes</option>
          <option value="COUNT">COUNT - Wait for specific number of branches</option>
        </select>
      </div>

      {/* Count Input (only for COUNT policy) */}
      {policy === 'COUNT' && (
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Number of Branches
          </label>
          <input
            type="number"
            value={count}
            onChange={(e) => setCount(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            placeholder="Enter count..."
            min="1"
          />
        </div>
      )}

      {/* Policy Description */}
      <div className="bg-cyan-50 p-3 rounded-md">
        <div className="text-xs text-cyan-900">
          {policy === 'ALL' && (
            <p>The node will wait for all incoming branches to complete before proceeding.</p>
          )}
          {policy === 'ANY' && (
            <p>The node will continue as soon as any one of the incoming branches completes.</p>
          )}
          {policy === 'COUNT' && (
            <p>The node will continue when the specified number of incoming branches have completed.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default JoinConfig;
