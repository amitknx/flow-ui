import React from 'react';
import { X, Info, Clock, Database, AlertCircle } from 'lucide-react';
import { useWorkflowStore } from '../../stores/workflow';
import { formatDuration, formatTimestamp, getStatusIcon } from '../../utils';
import type { ExecutionNode } from '../../types/workflow';
import NodeConfigPanel from '../workflow/NodeConfigPanel';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  mode?: 'execution' | 'authoring';
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose, mode = 'execution' }) => {
  const {
    selectedNodeId,
    executionSnapshot,
    currentWorkflow
  } = useWorkflowStore();

  const selectedNode = selectedNodeId && executionSnapshot
    ? executionSnapshot.nodes.find(n => n.id === selectedNodeId)
    : selectedNodeId && currentWorkflow
    ? currentWorkflow.nodes.find(n => n.id === selectedNodeId)
    : null;

  const isAuthoringMode = mode === 'authoring';

  if (!isOpen) return null;

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-96 bg-white shadow-xl border-l border-gray-200">
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            {selectedNode ? 'Node Details' : 'Details'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          {selectedNode ? (
            isAuthoringMode ? (
              <NodeConfigPanel node={selectedNode} />
            ) : (
            <>
              {/* Node Info */}
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  {getStatusIcon((selectedNode as ExecutionNode)?.status)}
                  <h3 className="font-medium text-gray-900">{selectedNode.name}</h3>
                </div>
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500">Type:</span>
                    <div className="font-medium">{selectedNode.type}</div>
                  </div>
                  <div>
                    <span className="text-gray-500">ID:</span>
                    <div className="font-mono text-xs">{selectedNode.id}</div>
                  </div>
                </div>

                {(selectedNode as ExecutionNode)?.status && (
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500">Status:</span>
                      <div className="font-medium capitalize">
                        {(selectedNode as ExecutionNode).status.toLowerCase()}
                      </div>
                    </div>
                    <div>
                      <span className="text-gray-500">Duration:</span>
                      <div className="font-medium">
                        {formatDuration((selectedNode as ExecutionNode)?.timings?.duration)}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Timing Information */}
              {(selectedNode as ExecutionNode)?.timings && (
                <div className="space-y-3">
                  <h4 className="font-medium text-gray-900 flex items-center space-x-2">
                    <Clock className="w-4 h-4" />
                    <span>Timing</span>
                  </h4>
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="text-gray-500">Started:</span>
                      <div className="font-mono text-xs">
                        {formatTimestamp((selectedNode as ExecutionNode)?.timings?.startedAt)}
                      </div>
                    </div>
                    {(selectedNode as ExecutionNode)?.timings?.endedAt && (
                      <div>
                        <span className="text-gray-500">Ended:</span>
                        <div className="font-mono text-xs">
                          {formatTimestamp((selectedNode as ExecutionNode)?.timings?.endedAt)}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Input Data */}
              {(selectedNode as ExecutionNode)?.input && (
                <div className="space-y-3">
                  <h4 className="font-medium text-gray-900 flex items-center space-x-2">
                    <Database className="w-4 h-4" />
                    <span>Input</span>
                  </h4>
                  <pre className="bg-gray-50 p-3 rounded-lg text-xs overflow-x-auto">
                    {JSON.stringify((selectedNode as ExecutionNode).input, null, 2)}
                  </pre>
                </div>
              )}

              {/* Output Data */}
              {(selectedNode as ExecutionNode)?.output && (
                <div className="space-y-3">
                  <h4 className="font-medium text-gray-900 flex items-center space-x-2">
                    <Database className="w-4 h-4" />
                    <span>Output</span>
                  </h4>
                  <pre className="bg-gray-50 p-3 rounded-lg text-xs overflow-x-auto">
                    {JSON.stringify((selectedNode as ExecutionNode).output, null, 2)}
                  </pre>
                </div>
              )}

              {/* Error Information */}
              {(selectedNode as ExecutionNode)?.error && (
                <div className="space-y-3">
                  <h4 className="font-medium text-red-900 flex items-center space-x-2">
                    <AlertCircle className="w-4 h-4 text-red-500" />
                    <span>Error</span>
                  </h4>
                  <div className="bg-red-50 border border-red-200 p-3 rounded-lg text-sm text-red-800">
                    {(selectedNode as ExecutionNode).error}
                  </div>
                </div>
              )}

              {/* Configuration */}
              {selectedNode.data && Object.keys(selectedNode.data).length > 0 && (
                <div className="space-y-3">
                  <h4 className="font-medium text-gray-900">Configuration</h4>
                  <pre className="bg-gray-50 p-3 rounded-lg text-xs overflow-x-auto">
                    {JSON.stringify(selectedNode.data, null, 2)}
                  </pre>
                </div>
              )}
            </>
            )
          ) : (
            <div className="text-center text-gray-500 py-8">
              <Info className="w-8 h-8 mx-auto mb-2" />
              <p>Select a node to view details</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
