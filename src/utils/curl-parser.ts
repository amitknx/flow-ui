import type { HttpMethod } from '../types/api-new';
import type { ParsedCurl } from '../types/playground';

/**
 * Parse a cURL command string into a structured request object.
 * Supports common cURL options: -X, -H, -d, --data-raw, --data, -b, --cookie
 */
export function parseCurl(curlCommand: string): ParsedCurl {
    try {
        // Normalize the command - remove newlines and extra spaces
        let command = curlCommand
            .replace(/\\\n/g, ' ')  // Handle line continuations
            .replace(/\n/g, ' ')
            .replace(/\s+/g, ' ')
            .trim();

        // Check if it starts with 'curl'
        if (!command.toLowerCase().startsWith('curl')) {
            return {
                method: 'GET',
                url: '',
                headers: {},
                isValid: false,
                error: 'Command must start with "curl"',
            };
        }

        // Remove 'curl' prefix
        command = command.slice(4).trim();

        let method: HttpMethod = 'GET';
        let url = '';
        const headers: Record<string, string> = {};
        let body: any = undefined;

        // Tokenize the command respecting quotes
        const tokens = tokenize(command);

        for (let i = 0; i < tokens.length; i++) {
            const token = tokens[i];

            // Method flag
            if (token === '-X' || token === '--request') {
                const nextToken = tokens[++i];
                if (nextToken) {
                    method = nextToken.toUpperCase() as HttpMethod;
                }
                continue;
            }

            // Header flag
            if (token === '-H' || token === '--header') {
                const headerStr = tokens[++i];
                if (headerStr) {
                    const colonIndex = headerStr.indexOf(':');
                    if (colonIndex > 0) {
                        const key = headerStr.slice(0, colonIndex).trim();
                        const value = headerStr.slice(colonIndex + 1).trim();
                        headers[key] = value;
                    }
                }
                continue;
            }

            // Data flags
            if (token === '-d' || token === '--data' || token === '--data-raw' || token === '--data-binary') {
                const dataStr = tokens[++i];
                if (dataStr) {
                    // Try to parse as JSON
                    try {
                        body = JSON.parse(dataStr);
                    } catch {
                        body = dataStr;
                    }
                    // If data is provided, default to POST if not specified
                    if (method === 'GET') {
                        method = 'POST';
                    }
                }
                continue;
            }

            // Cookie flag
            if (token === '-b' || token === '--cookie') {
                const cookieStr = tokens[++i];
                if (cookieStr) {
                    headers['Cookie'] = cookieStr;
                }
                continue;
            }

            // Skip other common flags
            if (token.startsWith('-')) {
                // Skip flags that take an argument
                if (['-u', '--user', '-A', '--user-agent', '-e', '--referer',
                    '-o', '--output', '-L', '--location', '-k', '--insecure',
                    '-v', '--verbose', '-s', '--silent', '-i', '--include',
                    '--compressed', '--connect-timeout', '--max-time'].includes(token)) {
                    // Some of these have arguments, some don't
                    if (['-u', '--user', '-A', '--user-agent', '-e', '--referer',
                        '-o', '--output', '--connect-timeout', '--max-time'].includes(token)) {
                        i++; // Skip the argument
                    }
                }
                continue;
            }

            // URL - anything that looks like a URL
            if (token.startsWith('http://') || token.startsWith('https://') ||
                token.startsWith('http:') || token.startsWith('https:')) {
                // Clean up the URL - remove surrounding quotes if any
                url = token.replace(/^['"]|['"]$/g, '');
                continue;
            }

            // If it's not a flag and we don't have a URL yet, try it as URL
            if (!url && !token.startsWith('-')) {
                url = token.replace(/^['"]|['"]$/g, '');
            }
        }

        if (!url) {
            return {
                method,
                url: '',
                headers,
                body,
                isValid: false,
                error: 'No URL found in cURL command',
            };
        }

        return {
            method,
            url,
            headers,
            body,
            isValid: true,
        };
    } catch (error) {
        return {
            method: 'GET',
            url: '',
            headers: {},
            isValid: false,
            error: error instanceof Error ? error.message : 'Failed to parse cURL command',
        };
    }
}

/**
 * Tokenize a command string, respecting quotes
 */
function tokenize(command: string): string[] {
    const tokens: string[] = [];
    let current = '';
    let inQuote: string | null = null;

    for (let i = 0; i < command.length; i++) {
        const char = command[i];

        if (inQuote) {
            if (char === inQuote) {
                // End of quoted section
                inQuote = null;
            } else if (char === '\\' && i + 1 < command.length) {
                // Escape sequence
                current += command[++i];
            } else {
                current += char;
            }
        } else {
            if (char === '"' || char === "'") {
                inQuote = char;
            } else if (char === ' ' || char === '\t') {
                if (current) {
                    tokens.push(current);
                    current = '';
                }
            } else {
                current += char;
            }
        }
    }

    if (current) {
        tokens.push(current);
    }

    return tokens;
}

/**
 * Convert a request object back to a cURL command
 */
export function toCurl(request: {
    method: string;
    url: string;
    headers?: Record<string, string>;
    body?: any;
}): string {
    const parts: string[] = ['curl'];

    // Method (skip for GET as it's default)
    if (request.method && request.method !== 'GET') {
        parts.push(`-X ${request.method}`);
    }

    // URL
    parts.push(`'${request.url}'`);

    // Headers
    if (request.headers) {
        for (const [key, value] of Object.entries(request.headers)) {
            parts.push(`-H '${key}: ${value}'`);
        }
    }

    // Body
    if (request.body) {
        const bodyStr = typeof request.body === 'string'
            ? request.body
            : JSON.stringify(request.body);
        parts.push(`-d '${bodyStr}'`);
    }

    return parts.join(' \\\n  ');
}
