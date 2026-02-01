import React, { useState, useCallback } from 'react';
import { Play, FileCode, Wrench, Copy, Check, Plus, X, History, Clock } from 'lucide-react';
import { RequestBuilder } from './RequestBuilder';
import { CurlImporter } from './CurlImporter';
import { ResponseViewer } from './ResponseViewer';
import { playgroundService } from '../../../services/api-new-service';
import { toCurl } from '../../../utils/curl-parser';
import type { PlaygroundRequest, PlaygroundResponse, PlaygroundTab, PlaygroundHistoryItem, PlaygroundSubTab } from '../../../types/playground';

type InputTabType = 'build' | 'curl';

const createInitialRequest = (): PlaygroundRequest => ({
    method: 'GET',
    url: '',
    headers: {},
    queryParams: {},
    timeoutMs: 30000,
});

const createNewTab = (index: number): PlaygroundTab => ({
    id: `tab-${Date.now()}-${index}`,
    name: `Request ${index}`,
    request: createInitialRequest(),
    activeSubTab: 'params',
});

const MAX_HISTORY_ITEMS = 20;

export const ApiPlayground: React.FC = () => {
    // Multi-tab state
    const [tabs, setTabs] = useState<PlaygroundTab[]>([createNewTab(1)]);
    const [activeTabId, setActiveTabId] = useState<string>(tabs[0].id);

    // History state
    const [history, setHistory] = useState<PlaygroundHistoryItem[]>([]);
    const [showHistory, setShowHistory] = useState(false);

    // Input mode state
    const [inputTab, setInputTab] = useState<InputTabType>('build');
    const [copiedCurl, setCopiedCurl] = useState(false);

    // Get current active tab
    const activeTab = tabs.find(t => t.id === activeTabId) || tabs[0];

    // Update a specific tab
    const updateTab = useCallback((tabId: string, updates: Partial<PlaygroundTab>) => {
        setTabs(prev => prev.map(tab =>
            tab.id === tabId ? { ...tab, ...updates } : tab
        ));
    }, []);

    // Add new tab
    const addTab = useCallback(() => {
        const newTab = createNewTab(tabs.length + 1);
        setTabs(prev => [...prev, newTab]);
        setActiveTabId(newTab.id);
    }, [tabs.length]);

    // Close tab
    const closeTab = useCallback((tabId: string, e: React.MouseEvent) => {
        e.stopPropagation();
        if (tabs.length === 1) {
            // If last tab, reset it instead of closing
            const newTab = createNewTab(1);
            setTabs([newTab]);
            setActiveTabId(newTab.id);
            return;
        }

        const tabIndex = tabs.findIndex(t => t.id === tabId);
        const newTabs = tabs.filter(t => t.id !== tabId);
        setTabs(newTabs);

        // If closing active tab, switch to adjacent tab
        if (tabId === activeTabId) {
            const newActiveIndex = Math.min(tabIndex, newTabs.length - 1);
            setActiveTabId(newTabs[newActiveIndex].id);
        }
    }, [tabs, activeTabId]);

    // Add to history
    const addToHistory = useCallback((request: PlaygroundRequest, response: PlaygroundResponse) => {
        const historyItem: PlaygroundHistoryItem = {
            id: `history-${Date.now()}`,
            request: { ...request },
            response: { ...response },
            timestamp: new Date().toISOString(),
            name: `${request.method} ${new URL(request.url).pathname}`,
        };

        setHistory(prev => {
            const newHistory = [historyItem, ...prev];
            return newHistory.slice(0, MAX_HISTORY_ITEMS);
        });
    }, []);

    // Load from history
    const loadFromHistory = useCallback((item: PlaygroundHistoryItem) => {
        updateTab(activeTabId, {
            request: { ...item.request },
            response: item.response,
            error: undefined,
        });
        setShowHistory(false);
    }, [activeTabId, updateTab]);

    // Send request
    const handleSendRequest = async () => {
        const request = activeTab.request;
        if (!request.url.trim()) {
            updateTab(activeTabId, { error: 'Please enter a URL' });
            return;
        }

        updateTab(activeTabId, { loading: true, error: undefined, response: undefined });

        try {
            let url = request.url;
            if (request.queryParams && Object.keys(request.queryParams).length > 0) {
                const params = new URLSearchParams(request.queryParams);
                const separator = url.includes('?') ? '&' : '?';
                url = `${url}${separator}${params.toString()}`;
            }

            let body = request.body;
            if (body && typeof body === 'string') {
                try {
                    body = JSON.parse(body);
                } catch {
                    // Leave as string
                }
            }

            const result = await playgroundService.executeRequest({
                method: request.method,
                url,
                headers: request.headers,
                body,
                timeoutMs: request.timeoutMs,
            });

            updateTab(activeTabId, { response: result, loading: false });

            // Add to history on successful execution
            addToHistory(request, result);

            // Auto-name tab based on URL
            try {
                const urlObj = new URL(request.url);
                updateTab(activeTabId, { name: `${request.method} ${urlObj.pathname.slice(0, 20)}` });
            } catch {
                // Ignore invalid URLs
            }
        } catch (err) {
            updateTab(activeTabId, {
                error: err instanceof Error ? err.message : 'Request failed',
                loading: false
            });
        }
    };

    // Import cURL
    const handleImportCurl = (importedRequest: PlaygroundRequest) => {
        updateTab(activeTabId, { request: importedRequest, response: undefined, error: undefined });
        setInputTab('build');
    };

    // Update request
    const handleUpdateRequest = (request: PlaygroundRequest) => {
        updateTab(activeTabId, { request });
    };

    // Update sub-tab
    const handleSubTabChange = (activeSubTab: PlaygroundSubTab) => {
        updateTab(activeTabId, { activeSubTab });
    };

    // Handle draft state changes
    const handleNewHeaderKeyChange = (newHeaderKey: string) => updateTab(activeTabId, { newHeaderKey });
    const handleNewHeaderValueChange = (newHeaderValue: string) => updateTab(activeTabId, { newHeaderValue });
    const handleNewQueryKeyChange = (newQueryKey: string) => updateTab(activeTabId, { newQueryKey });
    const handleNewQueryValueChange = (newQueryValue: string) => updateTab(activeTabId, { newQueryValue });

    // Copy as cURL
    const handleCopyCurl = async () => {
        const curlCommand = toCurl({
            method: activeTab.request.method,
            url: activeTab.request.url,
            headers: activeTab.request.headers,
            body: activeTab.request.body,
        });

        try {
            await navigator.clipboard.writeText(curlCommand);
            setCopiedCurl(true);
            setTimeout(() => setCopiedCurl(false), 2000);
        } catch (err) {
            console.error('Failed to copy:', err);
        }
    };

    // Reset current tab
    const handleReset = () => {
        updateTab(activeTabId, {
            request: createInitialRequest(),
            response: undefined,
            error: undefined,
        });
    };

    return (
        <div className="h-full flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-white">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">API Playground</h1>
                    <p className="text-gray-600 text-sm mt-0.5">Test APIs with multiple tabs and request history</p>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setShowHistory(!showHistory)}
                        className={`inline-flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg transition-colors ${showHistory
                            ? 'bg-blue-100 text-blue-700 border border-blue-200'
                            : 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50'
                            }`}
                    >
                        <History className="w-4 h-4" />
                        History
                        {history.length > 0 && (
                            <span className="bg-gray-200 text-gray-700 text-xs px-1.5 py-0.5 rounded-full">
                                {history.length}
                            </span>
                        )}
                    </button>
                    <button
                        onClick={handleCopyCurl}
                        disabled={!activeTab.request.url}
                        className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        {copiedCurl ? (
                            <>
                                <Check className="w-4 h-4 text-green-600" />
                                <span className="text-green-600">Copied!</span>
                            </>
                        ) : (
                            <>
                                <Copy className="w-4 h-4" />
                                Copy cURL
                            </>
                        )}
                    </button>
                    <button
                        onClick={handleReset}
                        className="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                        Reset
                    </button>
                </div>
            </div>

            {/* Request Tabs Bar */}
            <div className="flex items-center bg-gray-100 border-b border-gray-200 px-2 py-1 gap-1 overflow-x-auto">
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTabId(tab.id)}
                        className={`group flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-t-lg transition-colors min-w-0 max-w-48 ${tab.id === activeTabId
                            ? 'bg-white text-gray-900 border-t border-l border-r border-gray-200'
                            : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200'
                            }`}
                    >
                        <span className="truncate">{tab.name}</span>
                        {tab.loading && (
                            <div className="animate-spin rounded-full h-3 w-3 border border-blue-600 border-t-transparent flex-shrink-0" />
                        )}
                        <button
                            onClick={(e) => closeTab(tab.id, e)}
                            className="p-0.5 rounded hover:bg-gray-300 text-gray-400 hover:text-gray-700 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                            <X className="w-3 h-3" />
                        </button>
                    </button>
                ))}
                <button
                    onClick={addTab}
                    className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-200 rounded transition-colors flex-shrink-0"
                    title="New tab"
                >
                    <Plus className="w-4 h-4" />
                </button>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex overflow-hidden">
                {/* History Sidebar */}
                {showHistory && (
                    <div className="w-72 border-r border-gray-200 bg-white flex flex-col overflow-hidden">
                        <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between">
                            <h3 className="font-semibold text-gray-900">Request History</h3>
                            {history.length > 0 && (
                                <button
                                    onClick={() => setHistory([])}
                                    className="text-xs text-red-600 hover:text-red-700"
                                >
                                    Clear
                                </button>
                            )}
                        </div>
                        <div className="flex-1 overflow-y-auto">
                            {history.length === 0 ? (
                                <div className="p-4 text-center text-gray-400 text-sm">
                                    No history yet
                                </div>
                            ) : (
                                <div className="divide-y divide-gray-100">
                                    {history.map((item) => (
                                        <button
                                            key={item.id}
                                            onClick={() => loadFromHistory(item)}
                                            className="w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors"
                                        >
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className={`text-xs font-bold px-1.5 py-0.5 rounded ${item.request.method === 'GET' ? 'bg-blue-100 text-blue-700' :
                                                    item.request.method === 'POST' ? 'bg-green-100 text-green-700' :
                                                        item.request.method === 'PUT' ? 'bg-orange-100 text-orange-700' :
                                                            item.request.method === 'DELETE' ? 'bg-red-100 text-red-700' :
                                                                'bg-gray-100 text-gray-700'
                                                    }`}>
                                                    {item.request.method}
                                                </span>
                                                {item.response && (
                                                    <span className={`text-xs font-medium ${item.response.status >= 200 && item.response.status < 300 ? 'text-green-600' :
                                                        item.response.status >= 400 ? 'text-red-600' : 'text-yellow-600'
                                                        }`}>
                                                        {item.response.status}
                                                    </span>
                                                )}
                                            </div>
                                            <div className="text-sm text-gray-700 truncate font-mono">
                                                {item.request.url}
                                            </div>
                                            <div className="flex items-center gap-1 text-xs text-gray-400 mt-1">
                                                <Clock className="w-3 h-3" />
                                                {new Date(item.timestamp).toLocaleTimeString()}
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Request Panel */}
                <div className="flex-1 grid grid-cols-2 gap-0 overflow-hidden">
                    {/* Left Panel - Request */}
                    <div className="flex flex-col border-r border-gray-200 bg-white overflow-hidden">
                        {/* Input Mode Tabs */}
                        <div className="flex border-b border-gray-200 px-4 pt-3">
                            <button
                                onClick={() => setInputTab('build')}
                                className={`flex items-center gap-2 px-3 py-2 text-sm font-medium border-b-2 transition-colors -mb-px ${inputTab === 'build'
                                    ? 'border-blue-500 text-blue-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700'
                                    }`}
                            >
                                <Wrench className="w-4 h-4" />
                                Build
                            </button>
                            <button
                                onClick={() => setInputTab('curl')}
                                className={`flex items-center gap-2 px-3 py-2 text-sm font-medium border-b-2 transition-colors -mb-px ${inputTab === 'curl'
                                    ? 'border-blue-500 text-blue-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700'
                                    }`}
                            >
                                <FileCode className="w-4 h-4" />
                                Import cURL
                            </button>
                        </div>

                        {/* Tab Content */}
                        <div className="flex-1 overflow-y-auto p-4">
                            {inputTab === 'build' ? (
                                <RequestBuilder
                                    key={activeTab.id}
                                    request={activeTab.request}
                                    onChange={handleUpdateRequest}
                                    activeSubTab={activeTab.activeSubTab || 'params'}
                                    onSubTabChange={handleSubTabChange}
                                    newHeaderKey={activeTab.newHeaderKey || ''}
                                    onNewHeaderKeyChange={handleNewHeaderKeyChange}
                                    newHeaderValue={activeTab.newHeaderValue || ''}
                                    onNewHeaderValueChange={handleNewHeaderValueChange}
                                    newQueryKey={activeTab.newQueryKey || ''}
                                    onNewQueryKeyChange={handleNewQueryKeyChange}
                                    newQueryValue={activeTab.newQueryValue || ''}
                                    onNewQueryValueChange={handleNewQueryValueChange}
                                    disabled={activeTab.loading}
                                />
                            ) : (
                                <CurlImporter
                                    onImport={handleImportCurl}
                                    disabled={activeTab.loading}
                                />
                            )}
                        </div>

                        {/* Send Button */}
                        <div className="p-4 border-t border-gray-200 bg-gray-50">
                            <button
                                onClick={handleSendRequest}
                                disabled={activeTab.loading || !activeTab.request.url.trim()}
                                className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md shadow-blue-500/20"
                            >
                                {activeTab.loading ? (
                                    <>
                                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                                        Sending...
                                    </>
                                ) : (
                                    <>
                                        <Play className="w-4 h-4" />
                                        Send Request
                                    </>
                                )}
                            </button>
                        </div>
                    </div>

                    {/* Right Panel - Response */}
                    <div className="flex flex-col bg-gray-50 overflow-hidden">
                        <div className="px-4 py-3 border-b border-gray-200 bg-white">
                            <h2 className="text-base font-semibold text-gray-900">Response</h2>
                        </div>
                        <div className="flex-1 overflow-y-auto p-4">
                            <ResponseViewer
                                response={activeTab.response || null}
                                loading={activeTab.loading}
                                error={activeTab.error}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ApiPlayground;
