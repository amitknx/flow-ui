import React, { useState, useEffect } from 'react';
import { useWorkflowStore } from '../../../stores/workflow';

interface ConditionalConfigProps {
  nodeId: string;
  data?: Record<string, any>;
}

const ConditionalConfig: React.FC<ConditionalConfigProps> = ({ nodeId, data }) => {
  const { updateNodeData } = useWorkflowStore();
  const [condition, setCondition] = useState<string>(data?.condition || '');

  // Reset local state when nodeId changes (switching between different nodes)
  useEffect(() => {
    setCondition(data?.condition || '');
  }, [nodeId]); // Only reset when nodeId changes

  // Update store when local state changes
  useEffect(() => {
    if (condition) {
      updateNodeData(nodeId, { condition });
    }
  }, [condition, nodeId, updateNodeData]);

  return (
    <div className="space-y-4">
      {/* Condition Expression */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          Condition Expression
        </label>
        <textarea
          value={condition}
          onChange={(e) => setCondition(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 font-mono text-sm"
          rows={4}
          placeholder="e.g., $.output.status === 'success'"
        />
        <p className="text-xs text-gray-500">
          Use JSONPath syntax to access previous node outputs (e.g., $.output.fieldName)
        </p>
      </div>

      {/* Examples */}
      <div className="bg-blue-50 p-3 rounded-md space-y-2">
        <h4 className="text-xs font-medium text-blue-900">Examples:</h4>
        <div className="space-y-1 text-xs text-blue-700">
          <div className="font-mono">$.output.status === 'success'</div>
          <div className="font-mono">$.output.value &gt; 100</div>
          <div className="font-mono">$.output.items.length &gt; 0</div>
        </div>
      </div>
    </div>
  );
};

export default ConditionalConfig;
