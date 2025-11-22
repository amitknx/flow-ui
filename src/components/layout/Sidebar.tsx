import React, { useState } from 'react';
import { X, Info, Clock, Database, AlertCircle, Copy, Check } from 'lucide-react';
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
                  <OutputDisplay output={(selectedNode as ExecutionNode).output} />
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

// Enhanced Output Display Component for HTTP Responses
const OutputDisplay: React.FC<{ output: any }> = ({ output }) => {
  const [activeTab, setActiveTab] = useState<'body' | 'headers' | 'meta'>('body');
  const [copiedSection, setCopiedSection] = useState<string | null>(null);

  // Check if output is an HTTP response
  const isHttpResponse = output?.response && (
    output.response.responseBody !== undefined ||
    output.response.httpStatusCode !== undefined
  );

  const handleCopy = async (text: string, section: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedSection(section);
      setTimeout(() => setCopiedSection(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  if (!isHttpResponse) {
    // Regular output display
    const outputText = JSON.stringify(output, null, 2);
    return (
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="font-medium text-gray-900 flex items-center space-x-2">
            <Database className="w-4 h-4" />
            <span>Output</span>
          </h4>
          <button
            onClick={() => handleCopy(outputText, 'output')}
            className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded transition-colors"
            title="Copy to clipboard"
          >
            {copiedSection === 'output' ? (
              <Check className="w-4 h-4 text-green-600" />
            ) : (
              <Copy className="w-4 h-4" />
            )}
          </button>
        </div>
        <pre className="bg-gray-50 p-3 rounded-lg text-xs overflow-x-auto border border-gray-200">
          {outputText}
        </pre>
      </div>
    );
  }

  // HTTP Response display
  const response = output.response;
  const responseBodyText = JSON.stringify(response.responseBody, null, 2);
  const headersText = JSON.stringify(response.responseHeaders, null, 2);

  return (
    <div className="space-y-3">
      <h4 className="font-medium text-gray-900 flex items-center space-x-2">
        <Database className="w-4 h-4" />
        <span>HTTP Response</span>
      </h4>

      {/* Status Badge */}
      <div className="flex items-center space-x-2">
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${response.httpStatusCode >= 200 && response.httpStatusCode < 300
          ? 'bg-green-100 text-green-800'
          : response.httpStatusCode >= 400
            ? 'bg-red-100 text-red-800'
            : 'bg-yellow-100 text-yellow-800'
          }`}>
          {response.httpStatusCode} {response.httpStatusText}
        </span>
        <span className="text-xs text-gray-500">{response.durationMs}ms</span>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-4">
          <button
            onClick={() => setActiveTab('body')}
            className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === 'body'
              ? 'border-primary-500 text-primary-600'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
          >
            Response Body
          </button>
          <button
            onClick={() => setActiveTab('headers')}
            className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === 'headers'
              ? 'border-primary-500 text-primary-600'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
          >
            Headers
          </button>
          <button
            onClick={() => setActiveTab('meta')}
            className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === 'meta'
              ? 'border-primary-500 text-primary-600'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
          >
            Metadata
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      <div className="relative">
        {activeTab === 'body' && (
          <div className="space-y-2">
            <div className="flex justify-end">
              <button
                onClick={() => handleCopy(responseBodyText, 'body')}
                className="flex items-center space-x-1 px-2 py-1 text-xs text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded transition-colors"
              >
                {copiedSection === 'body' ? (
                  <>
                    <Check className="w-3 h-3 text-green-600" />
                    <span className="text-green-600">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3" />
                    <span>Copy</span>
                  </>
                )}
              </button>
            </div>
            <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg text-xs overflow-x-auto max-h-96 overflow-y-auto">
              {responseBodyText}
            </pre>
          </div>
        )}

        {activeTab === 'headers' && (
          <div className="space-y-2">
            <div className="flex justify-end">
              <button
                onClick={() => handleCopy(headersText, 'headers')}
                className="flex items-center space-x-1 px-2 py-1 text-xs text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded transition-colors"
              >
                {copiedSection === 'headers' ? (
                  <>
                    <Check className="w-3 h-3 text-green-600" />
                    <span className="text-green-600">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3" />
                    <span>Copy</span>
                  </>
                )}
              </button>
            </div>
            <div className="bg-gray-50 border border-gray-200 rounded-lg max-h-96 overflow-y-auto">
              {Object.entries(response.responseHeaders || {}).map(([key, value]) => (
                <div key={key} className="px-3 py-2 border-b border-gray-200 last:border-0">
                  <div className="text-xs font-medium text-gray-700">{key}</div>
                  <div className="text-xs text-gray-600 mt-0.5 break-all font-mono">{String(value)}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'meta' && (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 space-y-2 text-xs">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <span className="text-gray-500">Method:</span>
                <div className="font-medium font-mono">{response.httpMethod}</div>
              </div>
              <div>
                <span className="text-gray-500">Status:</span>
                <div className="font-medium">{response.status}</div>
              </div>
              <div className="col-span-2">
                <span className="text-gray-500">URL:</span>
                <div className="font-mono text-xs break-all text-blue-600">{response.requestUrl}</div>
              </div>
              <div>
                <span className="text-gray-500">Duration:</span>
                <div className="font-medium">{response.durationMs}ms</div>
              </div>
              <div>
                <span className="text-gray-500">Timestamp:</span>
                <div className="font-mono">{new Date(response.requestTimestamp).toLocaleTimeString()}</div>
              </div>
            </div>
            {response.errorMessage && (
              <div className="pt-2 border-t border-gray-300">
                <span className="text-red-600 font-medium">Error:</span>
                <div className="text-red-700 mt-1">{response.errorMessage}</div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Sidebar;
