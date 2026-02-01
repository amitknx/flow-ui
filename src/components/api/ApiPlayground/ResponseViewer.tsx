import React, { useState } from 'react';
import { Copy, Check, Clock, AlertCircle } from 'lucide-react';
import type { PlaygroundResponse } from '../../../types/playground';

interface ResponseViewerProps {
    response: PlaygroundResponse | null;
    loading?: boolean;
    error?: string;
}

export const ResponseViewer: React.FC<ResponseViewerProps> = ({ response, loading, error }) => {
    const [activeTab, setActiveTab] = useState<'body' | 'headers'>('body');
    const [copiedSection, setCopiedSection] = useState<string | null>(null);

    const handleCopy = async (text: string, section: string) => {
        try {
            await navigator.clipboard.writeText(text);
            setCopiedSection(section);
            setTimeout(() => setCopiedSection(null), 2000);
        } catch (err) {
            console.error('Failed to copy:', err);
        }
    };

    // Loading state
    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center h-64 text-gray-500">
                <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-600 border-t-transparent mb-4" />
                <p>Sending request...</p>
            </div>
        );
    }

    // Error state
    if (error) {
        return (
            <div className="flex flex-col items-center justify-center h-64 text-red-600 bg-red-50 rounded-lg border border-red-200 p-6">
                <AlertCircle className="w-8 h-8 mb-4" />
                <p className="font-medium mb-2">Request Failed</p>
                <p className="text-sm text-red-500 text-center">{error}</p>
            </div>
        );
    }

    // Empty state
    if (!response) {
        return (
            <div className="flex flex-col items-center justify-center h-64 text-gray-400 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                <p className="text-lg font-medium">No Response Yet</p>
                <p className="text-sm mt-1">Send a request to see the response here</p>
            </div>
        );
    }

    const bodyText = typeof response.body === 'string'
        ? response.body
        : JSON.stringify(response.body, null, 2);
    const headersText = JSON.stringify(response.headers, null, 2);

    const getStatusColor = (status: number) => {
        if (status >= 200 && status < 300) return 'bg-green-100 text-green-800 border-green-200';
        if (status >= 300 && status < 400) return 'bg-yellow-100 text-yellow-800 border-yellow-200';
        if (status >= 400 && status < 500) return 'bg-orange-100 text-orange-800 border-orange-200';
        return 'bg-red-100 text-red-800 border-red-200';
    };

    return (
        <div className="space-y-4">
            {/* Status Bar */}
            <div className="flex items-center justify-between bg-gray-50 p-3 rounded-lg border border-gray-200">
                <div className="flex items-center gap-3">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold border ${getStatusColor(response.status)}`}>
                        {response.status} {response.statusText}
                    </span>
                    <div className="flex items-center gap-1 text-sm text-gray-600">
                        <Clock className="w-4 h-4" />
                        <span>{response.durationMs}ms</span>
                    </div>
                </div>
                {response.error && (
                    <span className="text-sm text-red-600">{response.error}</span>
                )}
            </div>

            {/* Tabs */}
            <div className="border-b border-gray-200">
                <nav className="-mb-px flex space-x-6">
                    <button
                        onClick={() => setActiveTab('body')}
                        className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === 'body'
                                ? 'border-blue-500 text-blue-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            }`}
                    >
                        Response Body
                    </button>
                    <button
                        onClick={() => setActiveTab('headers')}
                        className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === 'headers'
                                ? 'border-blue-500 text-blue-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            }`}
                    >
                        Headers
                        {response.headers && (
                            <span className="ml-1 text-xs text-gray-400">
                                ({Object.keys(response.headers).length})
                            </span>
                        )}
                    </button>
                </nav>
            </div>

            {/* Tab Content */}
            <div className="relative">
                {activeTab === 'body' && (
                    <div className="space-y-2">
                        <div className="flex justify-end">
                            <button
                                onClick={() => handleCopy(bodyText, 'body')}
                                className="flex items-center gap-1 px-2 py-1 text-xs text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded transition-colors"
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
                        <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg text-sm overflow-x-auto max-h-[400px] overflow-y-auto font-mono">
                            {bodyText || '(empty response)'}
                        </pre>
                    </div>
                )}

                {activeTab === 'headers' && (
                    <div className="space-y-2">
                        <div className="flex justify-end">
                            <button
                                onClick={() => handleCopy(headersText, 'headers')}
                                className="flex items-center gap-1 px-2 py-1 text-xs text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded transition-colors"
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
                        <div className="bg-gray-50 border border-gray-200 rounded-lg max-h-[400px] overflow-y-auto">
                            {Object.entries(response.headers || {}).map(([key, value]) => (
                                <div key={key} className="px-4 py-2 border-b border-gray-200 last:border-0">
                                    <div className="text-sm font-medium text-gray-700">{key}</div>
                                    <div className="text-sm text-gray-600 mt-0.5 break-all font-mono">{String(value)}</div>
                                </div>
                            ))}
                            {(!response.headers || Object.keys(response.headers).length === 0) && (
                                <div className="px-4 py-8 text-center text-gray-400">No headers</div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
