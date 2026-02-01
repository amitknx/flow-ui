import React, { useState, useEffect } from 'react';
import { useWorkflowStore } from '../../../stores/workflow';
import VariablePicker from './VariablePicker';
import { Braces, Play, AlertCircle, CheckCircle } from 'lucide-react';

interface ScriptConfigProps {
    nodeId: string;
    data?: Record<string, any>;
}

const ScriptConfig: React.FC<ScriptConfigProps> = ({ nodeId, data }) => {
    const { updateNodeData } = useWorkflowStore();
    const [code, setCode] = useState<string>(data?.code || '');
    const [activePicker, setActivePicker] = useState<{ id: string; rect: DOMRect } | null>(null);
    const [testResult, setTestResult] = useState<{ success: boolean; data?: any; error?: string } | null>(null);
    const [syntaxError, setSyntaxError] = useState<string | null>(null);

    // Reset local state when nodeId changes
    useEffect(() => {
        setCode(data?.code || '');
        setTestResult(null);
        setSyntaxError(null);
    }, [nodeId]);

    // Validate syntax and update store when code changes
    useEffect(() => {
        // Basic syntax validation
        if (code.trim()) {
            try {
                // We wrap it in an async function to check if the code is at least syntactically valid.
                new Function(`async () => { ${code} }`);
                setSyntaxError(null);
            } catch (err: any) {
                setSyntaxError(err.message);
            }
        } else {
            setSyntaxError(null);
        }

        updateNodeData(nodeId, { code });
    }, [code, nodeId, updateNodeData]);

    const insertVariable = (variable: string) => {
        setCode(prev => prev + variable);
        setActivePicker(null);
    };

    const runTest = () => {
        try {
            // Mock steps data for testing
            const mockSteps = {
                previous_node: {
                    outputs: {
                        status: 'success',
                        data: { id: 1, name: 'Test User' }
                    }
                }
            };

            // Create a function from the code string
            // We wrap it in an async function and provide 'steps' as an argument
            const scriptFunc = new Function('steps', `
                try {
                    ${code}
                } catch (e) {
                    throw e;
                }
            `);

            const result = scriptFunc(mockSteps);
            setTestResult({ success: true, data: result });
        } catch (err: any) {
            setTestResult({ success: false, error: err.message });
        }
    };

    return (
        <div className="space-y-4">
            {/* Code Editor */}
            <div className="space-y-2">
                <div className="flex items-center justify-between">
                    <label className="block text-sm font-medium text-gray-700">
                        JavaScript Code
                    </label>
                    <button
                        type="button"
                        onClick={(e) => {
                            const rect = e.currentTarget.getBoundingClientRect();
                            setActivePicker({ id: 'code', rect });
                        }}
                        className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                        title="Insert Variable"
                    >
                        <Braces className="w-4 h-4" />
                    </button>
                </div>

                <div className="relative">
                    <textarea
                        value={code}
                        onChange={(e) => setCode(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono text-sm min-h-[200px]"
                        placeholder="// Write your script here...&#10;return { result: 'hello world' };"
                    />

                    {activePicker?.id === 'code' && (
                        <VariablePicker
                            nodeId={nodeId}
                            onSelect={insertVariable}
                            onClose={() => setActivePicker(null)}
                            anchorRect={activePicker.rect}
                        />
                    )}
                </div>

                {syntaxError && (
                    <div className="flex items-start gap-2 text-xs text-red-600 bg-red-50 p-2 rounded-md border border-red-100">
                        <AlertCircle className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
                        <span className="font-mono">{syntaxError}</span>
                    </div>
                )}

                <p className="text-xs text-gray-500">
                    Scripts have access to the <code>steps</code> object. Return an object to set node outputs.
                </p>
            </div>

            {/* Test Section */}
            <div className="space-y-2 pt-2 border-t border-gray-100">
                <button
                    onClick={runTest}
                    className="flex items-center gap-2 px-3 py-1.5 bg-indigo-50 text-indigo-700 rounded-md hover:bg-indigo-100 transition-colors text-sm font-medium"
                >
                    <Play className="w-3 h-3" />
                    Test Script
                </button>

                {testResult && (
                    <div className={`p-3 rounded-md text-xs ${testResult.success ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
                        <div className="flex items-center gap-2 mb-1 font-semibold">
                            {testResult.success ? (
                                <CheckCircle className="w-3 h-3 text-green-600" />
                            ) : (
                                <AlertCircle className="w-3 h-3 text-red-600" />
                            )}
                            {testResult.success ? 'Success' : 'Error'}
                        </div>
                        <pre className="overflow-auto max-h-32 font-mono">
                            {testResult.success
                                ? JSON.stringify(testResult.data, null, 2)
                                : testResult.error}
                        </pre>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ScriptConfig;
