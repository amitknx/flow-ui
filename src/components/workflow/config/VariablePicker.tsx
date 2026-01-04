import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useWorkflowStore } from '../../../stores/workflow';
import { getUpstreamNodes, getNodeOutputs, generateVariableSyntax } from '../../../utils/workflow-graph-utils';
import { ChevronRight, ChevronDown, Box, FileJson, Type } from 'lucide-react';

interface VariablePickerProps {
    nodeId: string;
    onSelect: (variable: string) => void;
    onClose: () => void;
    anchorRect?: DOMRect;
}

const VariablePicker: React.FC<VariablePickerProps> = ({ nodeId, onSelect, onClose, anchorRect }) => {
    const { currentWorkflow } = useWorkflowStore();
    const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());
    const pickerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (pickerRef.current && !pickerRef.current.contains(event.target as Node)) {
                onClose();
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [onClose]);

    if (!currentWorkflow) return null;

    const upstreamNodes = getUpstreamNodes(nodeId, currentWorkflow.nodes, currentWorkflow.edges)
        .filter(node => node.type === 'HTTP_REQUEST');

    const toggleNode = (id: string) => {
        const newExpanded = new Set(expandedNodes);
        if (newExpanded.has(id)) {
            newExpanded.delete(id);
        } else {
            newExpanded.add(id);
        }
        setExpandedNodes(newExpanded);
    };

    const getIconForType = (type: string) => {
        switch (type) {
            case 'object': return <Box className="w-3 h-3 text-blue-500" />;
            case 'array': return <FileJson className="w-3 h-3 text-green-500" />;
            default: return <Type className="w-3 h-3 text-gray-500" />;
        }
    };

    const [positionStyle, setPositionStyle] = useState<React.CSSProperties>({
        opacity: 0, // Start invisible to measure
    });

    useEffect(() => {
        if (!anchorRect || !pickerRef.current) return;

        const picker = pickerRef.current;
        const rect = picker.getBoundingClientRect();
        const viewportHeight = window.innerHeight;
        const viewportWidth = window.innerWidth;

        let top = anchorRect.bottom + 4;
        let left = anchorRect.left;

        // Check vertical collision
        // We use the actual height if available, or a safe estimate if not yet fully rendered
        const height = rect.height || 300;
        const width = rect.width || 256;

        if (top + height > viewportHeight) {
            // Flip to top
            top = anchorRect.top - height - 4;
        }

        // Check horizontal collision
        if (left + width > viewportWidth) {
            // Align to right edge of anchor
            left = anchorRect.right - width;
        }

        // Ensure it doesn't go off-screen top/left/bottom/right
        const margin = 8;
        if (top < margin) top = margin;
        if (left < margin) left = margin;
        if (top + height > viewportHeight - margin) {
            top = viewportHeight - height - margin;
        }
        if (left + width > viewportWidth - margin) {
            left = viewportWidth - width - margin;
        }

        setPositionStyle({
            position: 'fixed',
            top: `${top}px`,
            left: `${left}px`,
            maxHeight: `${Math.min(300, viewportHeight - 20)}px`,
            opacity: 1,
        });

    }, [anchorRect, expandedNodes]); // Re-calculate when nodes expand as height changes

    const content = (
        <div
            ref={pickerRef}
            className="absolute z-[9999] w-64 bg-white rounded-md shadow-lg border border-gray-200 overflow-y-auto"
            style={positionStyle}
        >
            <div className="p-2 border-b border-gray-100 bg-gray-50">
                <h3 className="text-xs font-semibold text-gray-700">Insert Variable</h3>
            </div>

            {upstreamNodes.length === 0 ? (
                <div className="p-4 text-xs text-gray-500 text-center">
                    No upstream nodes available
                </div>
            ) : (
                <div className="py-1">
                    {upstreamNodes.map(node => {
                        const outputs = getNodeOutputs(node);
                        const isExpanded = expandedNodes.has(node.id);

                        if (outputs.length === 0) return null;

                        return (
                            <div key={node.id} className="border-b border-gray-50 last:border-0">
                                <button
                                    onClick={() => toggleNode(node.id)}
                                    className="w-full flex items-center gap-2 px-3 py-2 text-xs hover:bg-gray-50 text-left"
                                >
                                    {isExpanded ? <ChevronDown className="w-3 h-3 text-gray-400" /> : <ChevronRight className="w-3 h-3 text-gray-400" />}
                                    <span className="font-medium text-gray-700 truncate">{node.name}</span>
                                    <span className="text-[10px] text-gray-400 ml-auto">{node.type}</span>
                                </button>

                                {isExpanded && (
                                    <div className="bg-gray-50 py-1">
                                        {outputs.map(group => (
                                            <div key={group.id} className="px-2">
                                                <div className="px-2 py-1 text-[10px] font-semibold text-gray-500 uppercase tracking-wider">
                                                    {group.label}
                                                </div>
                                                {group.outputs.map(output => (
                                                    <button
                                                        key={output.path}
                                                        onClick={() => {
                                                            onSelect(generateVariableSyntax(node.id, output.path));
                                                            onClose();
                                                        }}
                                                        className="w-full flex items-center gap-2 px-4 py-1.5 text-xs hover:bg-blue-50 hover:text-blue-700 text-gray-600 text-left group"
                                                        title={output.description}
                                                    >
                                                        {getIconForType(output.type)}
                                                        <span className="font-mono">{output.path}</span>
                                                    </button>
                                                ))}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );

    return createPortal(content, document.body);
};

export default VariablePicker;
