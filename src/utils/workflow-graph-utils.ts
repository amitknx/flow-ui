import type { WorkflowNode, WorkflowEdge } from '../types/workflow';

export interface NodeOutput {
    path: string;
    label: string;
    type: 'string' | 'number' | 'boolean' | 'object' | 'array' | 'any';
    description?: string;
}

export interface NodeOutputGroup {
    id: string;
    label: string;
    outputs: NodeOutput[];
}

/**
 * Get all upstream nodes (ancestors) for a given node.
 * Returns nodes in topological order (furthest first) or just a list.
 * For variable picking, simple list of ancestors is sufficient.
 */
export const getUpstreamNodes = (
    nodeId: string,
    nodes: WorkflowNode[],
    edges: WorkflowEdge[]
): WorkflowNode[] => {
    const upstreamNodes = new Set<string>();
    const queue = [nodeId];
    const visited = new Set<string>();

    while (queue.length > 0) {
        const currentId = queue.shift()!;
        if (visited.has(currentId)) continue;
        visited.add(currentId);

        // Find all edges where target is currentId
        const incomingEdges = edges.filter(edge => edge.target === currentId);

        for (const edge of incomingEdges) {
            if (!upstreamNodes.has(edge.source)) {
                upstreamNodes.add(edge.source);
                queue.push(edge.source);
            }
        }
    }

    return nodes.filter(node => upstreamNodes.has(node.id));
};

/**
 * Get available outputs for a specific node based on its type.
 */
export const getNodeOutputs = (node: WorkflowNode): NodeOutputGroup[] => {
    switch (node.type) {
        case 'START':
            return [
                {
                    id: 'trigger',
                    label: 'Trigger Input',
                    outputs: [
                        { path: 'triggerInput', label: 'Full Input', type: 'object', description: 'The complete input payload' },
                        // We could add specific fields if we had a schema
                    ]
                }
            ];

        case 'HTTP_REQUEST':
            return [
                {
                    id: 'response',
                    label: 'Response',
                    outputs: [
                        { path: 'response.body', label: 'Body', type: 'any', description: 'Response body' },
                        { path: 'response.headers', label: 'Headers', type: 'object', description: 'Response headers' },
                        { path: 'response.statusCode', label: 'Status Code', type: 'number', description: 'HTTP status code' },
                    ]
                },
                {
                    id: 'request',
                    label: 'Request',
                    outputs: [
                        { path: 'request.body', label: 'Body', type: 'any' },
                        { path: 'request.headers', label: 'Headers', type: 'object' },
                        { path: 'request.url', label: 'URL', type: 'string' },
                    ]
                }
            ];

        // Add other node types as needed

        default:
            return [];
    }
};

/**
 * Generate the variable reference syntax
 */
export const generateVariableSyntax = (nodeName: string, path: string): string => {
    // Sanitize node name if needed, but for now assume it's safe or we use ID if name is not unique/safe
    // The requirement was {{steps.<node_name>.outputs.<path>}}
    return `{{steps.${nodeName}.outputs.${path}}}`;
};
