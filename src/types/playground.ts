import type { HttpMethod } from './api-new';

/**
 * Request object for the playground proxy endpoint
 */
export interface PlaygroundRequest {
    method: HttpMethod;
    url: string;
    headers?: Record<string, string>;
    queryParams?: Record<string, string>;
    body?: any;
    timeoutMs?: number;
}

/**
 * Response object from the playground proxy endpoint
 */
export interface PlaygroundResponse {
    status: number;
    statusText: string;
    headers: Record<string, string>;
    body: any;
    durationMs: number;
    error?: string;
    requestUrl?: string;
    requestMethod?: string;
    timestamp?: string;
}

/**
 * Parsed cURL command structure
 */
export interface ParsedCurl {
    method: HttpMethod;
    url: string;
    headers: Record<string, string>;
    body?: any;
    isValid: boolean;
    error?: string;
}

/**
 * Request history item for optional history feature
 */
export interface PlaygroundHistoryItem {
    id: string;
    request: PlaygroundRequest;
    response?: PlaygroundResponse;
    timestamp: string;
    name?: string;
}

/**
 * Internal sub-tabs for the request builder
 */
export type PlaygroundSubTab = 'params' | 'headers' | 'body' | 'settings';

/**
 * Tab item for multi-tab playground
 */
export interface PlaygroundTab {
    id: string;
    name: string;
    request: PlaygroundRequest;
    activeSubTab?: PlaygroundSubTab;
    docId?: string; // For saving draft state
    newHeaderKey?: string;
    newHeaderValue?: string;
    newQueryKey?: string;
    newQueryValue?: string;
    response?: PlaygroundResponse;
    loading?: boolean;
    error?: string;
}
