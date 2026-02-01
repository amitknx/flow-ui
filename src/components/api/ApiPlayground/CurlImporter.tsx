import React, { useState } from 'react';
import { FileCode, AlertCircle, Check, ArrowRight } from 'lucide-react';
import { parseCurl } from '../../../utils/curl-parser';
import type { PlaygroundRequest } from '../../../types/playground';

interface CurlImporterProps {
    onImport: (request: PlaygroundRequest) => void;
    disabled?: boolean;
}

export const CurlImporter: React.FC<CurlImporterProps> = ({ onImport, disabled }) => {
    const [curlInput, setCurlInput] = useState('');
    const [parseError, setParseError] = useState<string | null>(null);
    const [parseSuccess, setParseSuccess] = useState(false);

    const handleParse = () => {
        setParseError(null);
        setParseSuccess(false);

        if (!curlInput.trim()) {
            setParseError('Please paste a cURL command');
            return;
        }

        const result = parseCurl(curlInput);

        if (!result.isValid) {
            setParseError(result.error || 'Failed to parse cURL command');
            return;
        }

        // Convert parsed cURL to PlaygroundRequest
        const request: PlaygroundRequest = {
            method: result.method,
            url: result.url,
            headers: result.headers,
            body: result.body,
            timeoutMs: 30000,
        };

        onImport(request);
        setParseSuccess(true);

        // Reset success message after 2 seconds
        setTimeout(() => setParseSuccess(false), 2000);
    };

    const exampleCurl = `curl -X POST 'https://api.example.com/users' \\
  -H 'Content-Type: application/json' \\
  -H 'Authorization: Bearer your-token' \\
  -d '{"name": "John", "email": "john@example.com"}'`;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                    <FileCode className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                    <h3 className="font-semibold text-gray-900">Import from cURL</h3>
                    <p className="text-sm text-gray-500">Paste a cURL command to auto-fill the request builder</p>
                </div>
            </div>

            {/* cURL Input */}
            <div className="space-y-2">
                <textarea
                    value={curlInput}
                    onChange={(e) => {
                        setCurlInput(e.target.value);
                        setParseError(null);
                        setParseSuccess(false);
                    }}
                    placeholder={`Paste your cURL command here...\n\nExample:\n${exampleCurl}`}
                    disabled={disabled}
                    rows={10}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 font-mono text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all resize-y disabled:bg-gray-100 disabled:opacity-50"
                />
            </div>

            {/* Error Message */}
            {parseError && (
                <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    <span className="text-sm">{parseError}</span>
                </div>
            )}

            {/* Success Message */}
            {parseSuccess && (
                <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg text-green-700">
                    <Check className="w-4 h-4 flex-shrink-0" />
                    <span className="text-sm">cURL parsed successfully! Request fields have been updated.</span>
                </div>
            )}

            {/* Actions */}
            <div className="flex items-center justify-between">
                <button
                    onClick={() => setCurlInput('')}
                    disabled={disabled || !curlInput.trim()}
                    className="text-sm text-gray-500 hover:text-gray-700 px-3 py-2 hover:bg-gray-100 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    Clear
                </button>
                <button
                    onClick={handleParse}
                    disabled={disabled || !curlInput.trim()}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    Parse & Import
                    <ArrowRight className="w-4 h-4" />
                </button>
            </div>

            {/* Supported Flags Info */}
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Supported cURL flags:</h4>
                <ul className="text-xs text-gray-600 space-y-1 font-mono">
                    <li><span className="text-blue-600">-X, --request</span> - HTTP method</li>
                    <li><span className="text-blue-600">-H, --header</span> - Headers</li>
                    <li><span className="text-blue-600">-d, --data, --data-raw</span> - Request body</li>
                    <li><span className="text-blue-600">-b, --cookie</span> - Cookies</li>
                </ul>
            </div>
        </div>
    );
};
