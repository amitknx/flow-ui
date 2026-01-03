import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import type {
  WorkflowDefinition,
  WorkflowExecution,
  ExecutionSnapshot,
  StepExecution
} from '../types/workflow';

interface WorkflowStore {
  // Workflows state
  workflows: WorkflowDefinition[];
  currentWorkflow: WorkflowDefinition | null;
  isLoadingWorkflows: boolean;
  workflowError: string | null;

  // Executions state
  executions: WorkflowExecution[];
  currentExecution: WorkflowExecution | null;
  executionSnapshot: ExecutionSnapshot | null;
  executionSteps: StepExecution[];
  isLoadingExecution: boolean;
  executionError: string | null;

  // UI state
  selectedNodeId: string | null;
  sidebarOpen: boolean;
  workflowDirty: boolean;

  // Actions
  setWorkflows: (workflows: WorkflowDefinition[]) => void;
  setCurrentWorkflow: (workflow: WorkflowDefinition | null) => void;
  addWorkflow: (workflow: WorkflowDefinition) => void;
  updateWorkflow: (workflow: WorkflowDefinition) => void;
  removeWorkflow: (id: string) => void;
  setWorkflowLoading: (loading: boolean) => void;
  setWorkflowError: (error: string | null) => void;

  setExecutions: (executions: WorkflowExecution[]) => void;
  setCurrentExecution: (execution: WorkflowExecution | null) => void;
  setExecutionSnapshot: (snapshot: ExecutionSnapshot | null) => void;
  updateExecutionSnapshot: (snapshot: ExecutionSnapshot) => void;
  setExecutionSteps: (steps: StepExecution[]) => void;
  addExecutionStep: (step: StepExecution) => void;
  updateExecutionStep: (step: StepExecution) => void;
  setExecutionLoading: (loading: boolean) => void;
  setExecutionError: (error: string | null) => void;

  setSelectedNodeId: (nodeId: string | null) => void;
  setSidebarOpen: (open: boolean) => void;
  setWorkflowDirty: (dirty: boolean) => void;

  // Node update actions
  updateNodeData: (nodeId: string, data: Record<string, any>) => void;
  updateNodeName: (nodeId: string, name: string) => void;

  // Reset functions
  resetWorkflow: () => void;
  resetExecution: () => void;
}

export const useWorkflowStore = create<WorkflowStore>()(
  devtools(
    (set, get) => ({
      // Initial state
      workflows: [],
      currentWorkflow: null,
      isLoadingWorkflows: false,
      workflowError: null,

      executions: [],
      currentExecution: null,
      executionSnapshot: null,
      executionSteps: [],
      isLoadingExecution: false,
      executionError: null,

      selectedNodeId: null,
      sidebarOpen: true,
      workflowDirty: false,

      // Workflow actions
      setWorkflows: (workflows) => set({ workflows }),

      setCurrentWorkflow: (workflow) => set({ currentWorkflow: workflow }),

      addWorkflow: (workflow) => set((state) => ({
        workflows: [...state.workflows, workflow]
      })),

      updateWorkflow: (workflow) => set((state) => ({
        workflows: state.workflows.map(w => w.id === workflow.id ? workflow : w),
        currentWorkflow: state.currentWorkflow?.id === workflow.id ? workflow : state.currentWorkflow
      })),

      removeWorkflow: (id) => set((state) => ({
        workflows: state.workflows.filter(w => w.id !== id),
        currentWorkflow: state.currentWorkflow?.id === id ? null : state.currentWorkflow
      })),

      setWorkflowLoading: (loading) => set({ isLoadingWorkflows: loading }),

      setWorkflowError: (error) => set({ workflowError: error }),

      // Execution actions
      setExecutions: (executions) => set({ executions }),

      setCurrentExecution: (execution) => set({ currentExecution: execution }),

      setExecutionSnapshot: (snapshot) => set({ executionSnapshot: snapshot }),

      updateExecutionSnapshot: (snapshot) => set((state) => {
        // Only update if it's the current execution
        if (state.executionSnapshot?.executionId === snapshot.executionId) {
          return { executionSnapshot: snapshot };
        }
        return state;
      }),

      setExecutionSteps: (steps) => set({ executionSteps: steps }),

      addExecutionStep: (step) => set((state) => ({
        executionSteps: [...state.executionSteps, step]
      })),

      updateExecutionStep: (step) => set((state) => ({
        executionSteps: state.executionSteps.map(s => s.id === step.id ? step : s)
      })),

      setExecutionLoading: (loading) => set({ isLoadingExecution: loading }),

      setExecutionError: (error) => set({ executionError: error }),

      // UI actions
      setSelectedNodeId: (nodeId) => set({ selectedNodeId: nodeId }),

      setSidebarOpen: (open) => set({ sidebarOpen: open }),

      setWorkflowDirty: (dirty) => set({ workflowDirty: dirty }),

      updateNodeData: (nodeId, data) => set((state) => {
        if (!state.currentWorkflow) return state;

        const updatedNodes = state.currentWorkflow.nodes.map(node =>
          node.id === nodeId ? { ...node, data } : node
        );

        return {
          currentWorkflow: {
            ...state.currentWorkflow,
            nodes: updatedNodes,
          },
          workflowDirty: true,
        };
      }),

      updateNodeName: (nodeId, name) => set((state) => {
        if (!state.currentWorkflow) return state;

        const updatedNodes = state.currentWorkflow.nodes.map(node =>
          node.id === nodeId ? { ...node, name } : node
        );

        return {
          currentWorkflow: {
            ...state.currentWorkflow,
            nodes: updatedNodes,
          },
          workflowDirty: true,
        };
      }),

      // Reset functions
      resetWorkflow: () => set({
        currentWorkflow: null,
        workflowError: null,
        selectedNodeId: null,
      }),

      resetExecution: () => set({
        currentExecution: null,
        executionSnapshot: null,
        executionSteps: [],
        executionError: null,
        selectedNodeId: null,
      }),
    }),
    {
      name: 'workflow-store',
    }
  )
);
