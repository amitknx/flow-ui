import React, { useState } from 'react';
import { useWorkflowStore } from '../../stores/workflow';
import type { WorkflowNode } from '../../types/workflow';
import HttpRequestConfig from './config/HttpRequestConfig';
import ConditionalConfig from './config/ConditionalConfig';
import DelayConfig from './config/DelayConfig';
import JoinConfig from './config/JoinConfig';
import SubWorkflowConfig from './config/SubWorkflowConfig';
import ScriptConfig from './config/ScriptConfig';

interface NodeConfigPanelProps {
  node: WorkflowNode;
}

const NodeConfigPanel: React.FC<NodeConfigPanelProps> = ({ node }) => {
  const { updateNodeName } = useWorkflowStore();
  const [nodeName, setNodeName] = useState(node.name);

  const handleNameBlur = () => {
    if (nodeName !== node.name && nodeName.trim()) {
      updateNodeName(node.id, nodeName.trim());
    }
  };

  const handleNameKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      (e.currentTarget as HTMLElement).blur();
    }
  };

  const renderConfigForm = () => {
    switch (node.type) {
      case 'HTTP_REQUEST':
        return <HttpRequestConfig nodeId={node.id} data={node.data} />;
      case 'CONDITIONAL':
        return <ConditionalConfig nodeId={node.id} data={node.data} />;
      case 'DELAY':
        return <DelayConfig nodeId={node.id} data={node.data} />;
      case 'JOIN':
        return <JoinConfig nodeId={node.id} data={node.data} />;
      case 'SUB_WORKFLOW':
        return <SubWorkflowConfig nodeId={node.id} data={node.data} />;
      case 'SCRIPT':
        return <ScriptConfig nodeId={node.id} data={node.data} />;
      case 'START':
      case 'END':
        return (
          <div className="text-sm text-gray-500 italic">
            This node type does not require configuration.
          </div>
        );
      default:
        return (
          <div className="text-sm text-gray-500">
            No configuration available for this node type.
          </div>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Node Name */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          Node Name
        </label>
        <input
          type="text"
          value={nodeName}
          onChange={(e) => setNodeName(e.target.value)}
          onBlur={handleNameBlur}
          onKeyDown={handleNameKeyDown}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
          placeholder="Enter node name..."
        />
      </div>

      {/* Node Type */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          Type
        </label>
        <div className="text-sm text-gray-900 bg-gray-50 px-3 py-2 rounded-md">
          {node.type}
        </div>
      </div>

      {/* Configuration Form */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          Configuration
        </label>
        {renderConfigForm()}
      </div>
    </div>
  );
};

export default NodeConfigPanel;
