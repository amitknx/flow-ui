import type { WorkflowExecution, ExecutionSnapshot, ExecutionNode, ExecutionEdge, StepExecution } from '../types/workflow';

/**
 * Transforms a WorkflowExecution (from API) into an ExecutionSnapshot (for canvas visualization)
 * 
 * This function enriches workflow nodes with execution status, timings, and data,
 * and marks edges as traversed based on node execution status.
 */
export function transformExecutionToSnapshot(execution: WorkflowExecution): ExecutionSnapshot {
    const { definitionSnapshot, stepExecutions = [], id, workflowId, correlationId, status, startedAt, endedAt, duration } = execution;

    // Create a map of step executions by node ID for quick lookup
    const stepExecutionMap = new Map<string, StepExecution>();
    stepExecutions.forEach(step => {
        stepExecutionMap.set(step.nodeIdRef, step);
    });

    // Transform nodes: enrich workflow nodes with execution data
    const executionNodes: ExecutionNode[] = definitionSnapshot.nodes.map(node => {
        const stepExecution = stepExecutionMap.get(node.id);

        if (stepExecution) {
            // Node has execution data
            return {
                ...node,
                status: stepExecution.status,
                timings: {
                    startedAt: stepExecution.startedAt || undefined,
                    endedAt: stepExecution.endedAt || undefined,
                    duration: stepExecution.durationMs || undefined,
                },
                input: stepExecution.inputPayload || undefined,
                output: stepExecution.outputPayload || undefined,
                error: stepExecution.error || undefined,
            };
        } else {
            // Node hasn't executed yet - mark as PENDING
            return {
                ...node,
                status: 'PENDING' as const,
                timings: undefined,
                input: undefined,
                output: undefined,
                error: undefined,
            };
        }
    });

    // Create a map of execution nodes for quick lookup
    const executionNodeMap = new Map<string, ExecutionNode>();
    executionNodes.forEach(node => {
        executionNodeMap.set(node.id, node);
    });

    // Transform edges: determine if they've been traversed
    const executionEdges: ExecutionEdge[] = definitionSnapshot.edges.map(edge => {
        const sourceNode = executionNodeMap.get(edge.source);
        const targetNode = executionNodeMap.get(edge.target);

        // Edge is traversed if:
        // 1. Source node has started execution (not PENDING)
        // 2. Target node has started execution (not PENDING)
        const sourceExecuted = sourceNode && sourceNode.status !== 'PENDING';
        const targetExecuted = targetNode && targetNode.status !== 'PENDING';
        const traversed = !!(sourceExecuted && targetExecuted);

        return {
            ...edge,
            traversed,
            traversedAt: traversed && targetNode?.timings?.startedAt ? targetNode.timings.startedAt : undefined,
            reason: undefined, // Could be populated if we have conditional logic info
        };
    });

    // Create the execution snapshot
    return {
        executionId: id,
        workflowId,
        correlationId: correlationId || '',
        builtFrom: 'ENGINE' as const,
        triggerInput: execution.triggerInput,
        nodes: executionNodes,
        edges: executionEdges,
        summary: {
            status,
            startedAt: startedAt || new Date().toISOString(),
            endedAt: endedAt || undefined,
            duration: duration || undefined,
        },
    };
}
