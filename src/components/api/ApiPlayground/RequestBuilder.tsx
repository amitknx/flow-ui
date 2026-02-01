import React, { useEffect } from 'react';
import { Plus, X, ChevronDown, Settings, List, Hash, FileJson, Clock, Trash2 } from 'lucide-react';
import type { HttpMethod } from '../../../types/api-new';
import type { PlaygroundRequest, PlaygroundSubTab } from '../../../types/playground';

interface RequestBuilderProps {
    request: PlaygroundRequest;
    onChange: (request: PlaygroundRequest) => void;
    activeSubTab: PlaygroundSubTab;
    onSubTabChange: (subTab: PlaygroundSubTab) => void;
    // Draft state for new items
    newHeaderKey: string;
    onNewHeaderKeyChange: (value: string) => void;
    newHeaderValue: string;
    onNewHeaderValueChange: (value: string) => void;
    newQueryKey: string;
    onNewQueryKeyChange: (value: string) => void;
    newQueryValue: string;
    onNewQueryValueChange: (value: string) => void;
    disabled?: boolean;
}

const HTTP_METHODS: HttpMethod[] = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD', 'OPTIONS'];

const METHOD_COLORS: Record<HttpMethod, string> = {
    GET: 'bg-blue-100 text-blue-700 border-blue-200',
    POST: 'bg-green-100 text-green-700 border-green-200',
    PUT: 'bg-orange-100 text-orange-700 border-orange-200',
    PATCH: 'bg-yellow-100 text-yellow-700 border-yellow-200',
    DELETE: 'bg-red-100 text-red-700 border-red-200',
    HEAD: 'bg-purple-100 text-purple-700 border-purple-200',
    OPTIONS: 'bg-gray-100 text-gray-700 border-gray-200',
};

const RequestBuilder: React.FC<RequestBuilderProps> = ({
    request,
    onChange,
    activeSubTab,
    onSubTabChange,
    newHeaderKey,
    onNewHeaderKeyChange,
    newHeaderValue,
    onNewHeaderValueChange,
    newQueryKey,
    onNewQueryKeyChange,
    newQueryValue,
    onNewQueryValueChange,
    disabled
}) => {

    const updateField = <K extends keyof PlaygroundRequest>(field: K, value: PlaygroundRequest[K]) => {
        onChange({ ...request, [field]: value });
    };

    const addHeader = () => {
        if (newHeaderKey.trim()) {
            updateField('headers', {
                ...request.headers,
                [newHeaderKey.trim()]: newHeaderValue
            });
            onNewHeaderKeyChange('');
            onNewHeaderValueChange('');
        }
    };

    const removeHeader = (key: string) => {
        const newHeaders = { ...request.headers };
        delete newHeaders[key];
        updateField('headers', newHeaders);
    };

    const updateHeader = (oldKey: string, newKey: string, value: string) => {
        const entries = Object.entries(request.headers || {});
        const newHeaders: Record<string, string> = {};
        for (const [k, v] of entries) {
            if (k === oldKey) {
                newHeaders[newKey] = value;
            } else {
                newHeaders[k] = v;
            }
        }
        updateField('headers', newHeaders);
    };

    const addQueryParam = () => {
        if (newQueryKey.trim()) {
            updateField('queryParams', {
                ...request.queryParams,
                [newQueryKey.trim()]: newQueryValue
            });
            onNewQueryKeyChange('');
            onNewQueryValueChange('');
        }
    };

    const removeQueryParam = (key: string) => {
        const newParams = { ...request.queryParams };
        delete newParams[key];
        updateField('queryParams', newParams);
    };

    const updateQueryParam = (oldKey: string, newKey: string, value: string) => {
        const entries = Object.entries(request.queryParams || {});
        const newParams: Record<string, string> = {};
        for (const [k, v] of entries) {
            if (k === oldKey) {
                newParams[newKey] = value;
            } else {
                newParams[k] = v;
            }
        }
        updateField('queryParams', newParams);
    };

    const formatBody = () => {
        if (request.body && typeof request.body === 'string') {
            try {
                const parsed = JSON.parse(request.body);
                updateField('body', JSON.stringify(parsed, null, 2));
            } catch {
                // Not valid JSON
            }
        }
    };

    const hasBody = ['POST', 'PUT', 'PATCH'].includes(request.method);

    // If method changes to one that doesn't have a body, and we are on body tab, switch to params
    useEffect(() => {
        if (!hasBody && activeSubTab === 'body') {
            onSubTabChange('params');
        }
    }, [hasBody, activeSubTab, onSubTabChange]);

    const paramsCount = Object.keys(request.queryParams || {}).length;
    const headersCount = Object.keys(request.headers || {}).length;

    return (
        <div className="flex flex-col h-full space-y-4">
            {/* Method and URL */}
            <div className="flex gap-2">
                <div className="relative flex-shrink-0">
                    <select
                        value={request.method}
                        onChange={(e) => updateField('method', e.target.value as HttpMethod)}
                        disabled={disabled}
                        className={`appearance-none w-28 px-3 py-2 rounded-lg border font-bold text-sm cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 ${METHOD_COLORS[request.method]} disabled:opacity-50 transition-all`}
                    >
                        {HTTP_METHODS.map(method => (
                            <option key={method} value={method}>{method}</option>
                        ))}
                    </select>
                    <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none opacity-60" />
                </div>
                <input
                    type="text"
                    value={request.url}
                    onChange={(e) => updateField('url', e.target.value)}
                    placeholder="https://api.example.com/endpoint"
                    disabled={disabled}
                    className="flex-1 px-4 py-2 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all text-sm font-mono disabled:bg-gray-100 disabled:opacity-50 shadow-sm"
                />
            </div>

            {/* Internal Tabs Trigger */}
            <div className="flex border-b border-gray-200 pt-1 -mx-4 px-4 overflow-x-auto gap-2 no-scrollbar">
                <button
                    onClick={() => onSubTabChange('params')}
                    className={`flex items-center gap-1.5 px-3 py-2 text-xs font-semibold uppercase tracking-wider transition-all border-b-2 -mb-px whitespace-nowrap ${activeSubTab === 'params'
                        ? 'border-blue-600 text-blue-600 font-bold'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                        }`}
                >
                    <Hash className="w-3.5 h-3.5" />
                    Params
                    {paramsCount > 0 && <span className="ml-1 bg-blue-100 text-blue-700 font-bold px-1.5 py-0.5 rounded-full text-[10px]">{paramsCount}</span>}
                </button>
                <button
                    onClick={() => onSubTabChange('headers')}
                    className={`flex items-center gap-1.5 px-3 py-2 text-xs font-semibold uppercase tracking-wider transition-all border-b-2 -mb-px whitespace-nowrap ${activeSubTab === 'headers'
                        ? 'border-blue-600 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                        }`}
                >
                    <List className="w-3.5 h-3.5" />
                    Headers
                    {headersCount > 0 && <span className="ml-1 bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded-full text-[10px]">{headersCount}</span>}
                </button>
                {hasBody && (
                    <button
                        onClick={() => onSubTabChange('body')}
                        className={`flex items-center gap-1.5 px-3 py-2 text-xs font-semibold uppercase tracking-wider transition-all border-b-2 -mb-px whitespace-nowrap ${activeSubTab === 'body'
                            ? 'border-blue-600 text-blue-600'
                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            }`}
                    >
                        <FileJson className="w-3.5 h-3.5" />
                        Body
                    </button>
                )}
                <button
                    onClick={() => onSubTabChange('settings')}
                    className={`flex items-center gap-1.5 px-3 py-2 text-xs font-semibold uppercase tracking-wider transition-all border-b-2 -mb-px whitespace-nowrap ${activeSubTab === 'settings'
                        ? 'border-blue-600 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                        }`}
                >
                    <Settings className="w-3.5 h-3.5" />
                    Settings
                </button>
            </div>

            {/* Tab Panels */}
            <div className="flex-1 pt-2">
                {activeSubTab === 'params' && (
                    <div className="space-y-3 animate-in fade-in slide-in-from-top-1 duration-200">
                        <div className="flex items-center justify-between px-1">
                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Query Parameters</span>
                            {paramsCount > 0 && (
                                <button
                                    onClick={() => updateField('queryParams', {})}
                                    className="text-[10px] text-red-500 hover:text-red-700 font-bold flex items-center gap-1 transition-colors"
                                >
                                    <Trash2 className="w-3 h-3" />
                                    Clear All
                                </button>
                            )}
                        </div>
                        <div className="bg-gray-50 rounded-lg border border-gray-200 p-3 space-y-2">
                            {Object.entries(request.queryParams || {}).length === 0 && !newQueryKey && (
                                <p className="text-xs text-gray-500 text-center py-4">No query parameters defined</p>
                            )}
                            {Object.entries(request.queryParams || {}).map(([key, value]) => (
                                <div key={key} className="flex gap-2 items-center">
                                    <input
                                        type="text"
                                        value={key}
                                        onChange={(e) => updateQueryParam(key, e.target.value, value)}
                                        className="flex-1 px-3 py-1.5 rounded border border-gray-300 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-200"
                                        placeholder="Key"
                                        disabled={disabled}
                                    />
                                    <input
                                        type="text"
                                        value={value}
                                        onChange={(e) => updateQueryParam(key, key, e.target.value)}
                                        className="flex-1 px-3 py-1.5 rounded border border-gray-300 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-200"
                                        placeholder="Value"
                                        disabled={disabled}
                                    />
                                    <button
                                        onClick={() => removeQueryParam(key)}
                                        disabled={disabled}
                                        className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>
                            ))}
                            <div className="flex gap-2 items-center pt-2 border-t border-gray-200">
                                <input
                                    type="text"
                                    value={newQueryKey}
                                    onChange={(e) => onNewQueryKeyChange(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && addQueryParam()}
                                    className="flex-1 px-3 py-1.5 rounded border border-gray-300 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-200 bg-white"
                                    placeholder="New Key"
                                    disabled={disabled}
                                />
                                <input
                                    type="text"
                                    value={newQueryValue}
                                    onChange={(e) => onNewQueryValueChange(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && addQueryParam()}
                                    className="flex-1 px-3 py-1.5 rounded border border-gray-300 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-200 bg-white"
                                    placeholder="Value"
                                    disabled={disabled}
                                />
                                <button
                                    onClick={addQueryParam}
                                    disabled={disabled || !newQueryKey.trim()}
                                    className="p-1.5 text-blue-600 hover:bg-blue-50 rounded transition-colors disabled:opacity-50"
                                >
                                    <Plus className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {activeSubTab === 'headers' && (
                    <div className="space-y-3 animate-in fade-in slide-in-from-top-1 duration-200">
                        <div className="flex items-center justify-between px-1">
                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Request Headers</span>
                            {headersCount > 0 && (
                                <button
                                    onClick={() => updateField('headers', {})}
                                    className="text-[10px] text-red-500 hover:text-red-700 font-bold flex items-center gap-1 transition-colors"
                                >
                                    <Trash2 className="w-3 h-3" />
                                    Clear All
                                </button>
                            )}
                        </div>
                        <div className="bg-gray-50 rounded-lg border border-gray-200 p-3 space-y-2">
                            {Object.entries(request.headers || {}).length === 0 && !newHeaderKey && (
                                <p className="text-xs text-gray-500 text-center py-4">No headers defined</p>
                            )}
                            {Object.entries(request.headers || {}).map(([key, value]) => (
                                <div key={key} className="flex gap-2 items-center">
                                    <input
                                        type="text"
                                        value={key}
                                        onChange={(e) => updateHeader(key, e.target.value, value)}
                                        className="flex-1 px-3 py-1.5 rounded border border-gray-300 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-200"
                                        placeholder="Key"
                                        disabled={disabled}
                                    />
                                    <input
                                        type="text"
                                        value={value}
                                        onChange={(e) => updateHeader(key, key, e.target.value)}
                                        className="flex-1 px-3 py-1.5 rounded border border-gray-300 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-200"
                                        placeholder="Value"
                                        disabled={disabled}
                                    />
                                    <button
                                        onClick={() => removeHeader(key)}
                                        disabled={disabled}
                                        className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>
                            ))}
                            <div className="flex gap-2 items-center pt-2 border-t border-gray-200">
                                <input
                                    type="text"
                                    value={newHeaderKey}
                                    onChange={(e) => onNewHeaderKeyChange(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && addHeader()}
                                    className="flex-1 px-3 py-1.5 rounded border border-gray-300 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-200 bg-white"
                                    placeholder="New Key"
                                    disabled={disabled}
                                />
                                <input
                                    type="text"
                                    value={newHeaderValue}
                                    onChange={(e) => onNewHeaderValueChange(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && addHeader()}
                                    className="flex-1 px-3 py-1.5 rounded border border-gray-300 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-200 bg-white"
                                    placeholder="Value"
                                    disabled={disabled}
                                />
                                <button
                                    onClick={addHeader}
                                    disabled={disabled || !newHeaderKey.trim()}
                                    className="p-1.5 text-blue-600 hover:bg-blue-50 rounded transition-colors disabled:opacity-50"
                                >
                                    <Plus className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {activeSubTab === 'body' && hasBody && (
                    <div className="space-y-3 animate-in fade-in slide-in-from-top-1 duration-200">
                        <div className="flex items-center justify-between px-1">
                            <span className="text-xs text-gray-500 font-medium">JSON Body</span>
                            <button
                                onClick={formatBody}
                                disabled={disabled}
                                className="text-xs text-blue-600 hover:text-blue-700 font-semibold transition-colors disabled:opacity-50"
                            >
                                Format JSON
                            </button>
                        </div>
                        <textarea
                            value={typeof request.body === 'string' ? request.body : JSON.stringify(request.body, null, 2)}
                            onChange={(e) => updateField('body', e.target.value)}
                            placeholder={'{\n  "key": "value"\n}'}
                            disabled={disabled}
                            rows={12}
                            className="w-full px-4 py-3 rounded-lg border border-gray-300 font-mono text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all resize-y disabled:bg-gray-100 disabled:opacity-50 shadow-inner min-h-[200px]"
                        />
                    </div>
                )}

                {activeSubTab === 'settings' && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-top-1 duration-200 bg-gray-50 rounded-lg border border-gray-200 p-4">
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                                <Clock className="w-4 h-4" />
                                Request Timeout
                            </label>
                            <div className="flex items-center gap-3">
                                <input
                                    type="number"
                                    value={request.timeoutMs || 30000}
                                    onChange={(e) => updateField('timeoutMs', parseInt(e.target.value) || 30000)}
                                    disabled={disabled}
                                    className="w-40 px-3 py-2 rounded border border-gray-300 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 disabled:bg-gray-100 transition-all"
                                    min={1000}
                                    max={120000}
                                    step={1000}
                                />
                                <span className="text-xs text-gray-500 font-medium">milliseconds</span>
                            </div>
                            <p className="text-[11px] text-gray-400 italic">Default is 30,000ms (30 seconds). Max is 120,000ms.</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

const RequestBuilderMemo = React.memo(RequestBuilder);
export { RequestBuilderMemo as RequestBuilder };
