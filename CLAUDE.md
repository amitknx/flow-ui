# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.
## Global Rules
- Always make sure you dont break existing functionalities.
- Always use modularize and standard code. 
- Do not add too much comments. 
- Try to separate reusable component and reuse existing functionalies.

## Development Commands

```bash
# Start development server (runs on port 5174)
npm run dev

# Build for production (TypeScript compilation + Vite build)
npm run build

# Preview production build
npm run preview

# Run linting
npm run lint
```

## Project Overview

Flowboard UI is a React-based visualization platform for workflow execution monitoring and authoring. It supports two primary modes:

1. **Ingestion-driven**: External services send events; workflows are dynamically visualized from events
2. **UI-authored**: Users design workflows in the UI; executions are orchestrated by the backend

## Architecture

### Tech Stack
- **React 19** with TypeScript
- **Vite** - Build tool and dev server
- **React Flow** (@xyflow/react) - Core workflow visualization canvas
- **TanStack Query** - Server state and API caching
- **Zustand** - Client-side state management (with devtools)
- **React Router** - Navigation
- **Tailwind CSS** - Styling with custom workflow color palette
- **STOMP/SockJS** - WebSocket real-time updates
- **Zod** - Runtime validation
- **React Hook Form** - Form management

### Directory Structure

```
src/
├── features/              # Feature modules (workflows, executions, dashboard, apis, secret-stores)
├── components/            # Shared components
│   ├── ui/               # Basic UI (StatusBadge, LoadingSpinner, ErrorState, etc.)
│   ├── layout/           # Header, Sidebar
│   ├── workflow/         # WorkflowCanvas, NodePalette, nodes/
│   └── api/              # API configuration forms
├── services/             # API clients (api.ts, websocket.ts, api-management.ts)
├── stores/               # Zustand stores (workflow.ts)
├── types/                # TypeScript definitions (workflow.ts, node.ts, api.ts, react-flow.ts)
├── hooks/                # Custom hooks (useKeyboardShortcuts.ts, useApiManagement.ts)
└── utils/                # Utilities (formatters.ts, workflow-config.ts, etc.)
```

### State Management Architecture

1. **Server State** (TanStack Query):
   - Handles all API calls with 5-minute stale time
   - Automatic retry logic (skips 4xx errors)
   - Caches workflows, executions, steps

2. **Client State** (Zustand):
   - `useWorkflowStore`: Centralized workflow/execution state
   - Manages current workflow/execution, UI state (selectedNodeId, sidebarOpen)
   - Syncs with WebSocket updates via `updateExecutionSnapshot()`

3. **Real-time Updates** (WebSocket):
   - STOMP over SockJS connection
   - Topics: `/topic/workflows/{workflowId}/executions/{executionId}`
   - Auto-reconnection with max 5 attempts
   - Message types: EXECUTION_UPDATE, STEP_UPDATE, EXECUTION_COMPLETE

### Data Model

#### Workflow Definition (Authoring)
- Contains nodes (START, END, HTTP_REQUEST, DELAY, CONDITIONAL, JOIN, SUB_WORKFLOW)
- Explicit edges with optional conditions and ports
- Global variables and input schemas
- Stored in `definition_json` (JSONB in PostgreSQL)

#### Execution Snapshot (Runtime)
- Immutable per execution
- Built from events (INGESTED or ENGINE source)
- Contains execution-specific node statuses, timings, inputs/outputs
- Drives canvas rendering for execution visualization
- Stored in `definition_snapshot_json`

#### Copy-on-Edit Model
- Editing a workflow creates a new workflowId via `/api/v1/workflows/{id}/clone`
- Past executions remain intact with original workflow snapshot
- No lineage/alias tracking in MVP

### Backend Integration

#### REST API Endpoints
```
# Workflows
POST   /api/v1/workflows              # Create workflow
POST   /api/v1/workflows/{id}/clone   # Copy-on-edit
GET    /api/v1/workflows               # List workflows
GET    /api/v1/workflows/{id}          # Get workflow
PUT    /api/v1/workflows/{id}          # Update workflow
DELETE /api/v1/workflows/{id}          # Delete workflow

# Executions
POST   /api/v1/workflows/{id}/execute  # Trigger execution
GET    /api/v1/executions/{id}         # Get execution details
GET    /api/v1/executions/{id}/steps   # Get execution steps
GET    /api/v1/executions/{id}/snapshot # Get execution snapshot

# Events (Ingestion)
POST   /api/v1/events                  # Single event (202 Accepted)
POST   /api/v1/events/bulk             # Bulk events (202 Accepted)
```

#### Environment Configuration
```bash
# .env file
VITE_API_BASE_URL=http://localhost:8080
VITE_WS_URL=http://localhost:8080/ws
VITE_DEV_MODE=true
```

Default API base URL: `http://localhost:8080`
Default WebSocket URL: `http://localhost:8080/ws`

### Node Types and Execution States

#### Node Types
- **START**: Workflow entry point, maps trigger input
- **END**: Workflow exit point
- **HTTP_REQUEST**: External API calls
- **DELAY**: Time-based delays
- **CONDITIONAL**: Branching logic with conditions
- **JOIN**: Merge branches (policies: ALL/ANY/COUNT)
- **SUB_WORKFLOW**: Nested workflow execution (SYNC/ASYNC)

#### Execution States
- **PENDING** (yellow #f59e0b): Waiting to start
- **RUNNING** (blue #3b82f6): Currently executing (with animation)
- **SUCCESS** (green #10b981): Completed successfully
- **FAILED** (red #ef4444): Execution failed

### Canvas Component Architecture

#### BaseWorkflowCanvas
- Core React Flow canvas implementation
- Handles both authoring and execution modes
- Manages node selection, viewport state
- Uses `UnifiedWorkflowNode` for all node rendering

#### WorkflowCanvas vs AuthoringCanvas
- **WorkflowCanvas**: Wrapper around BaseWorkflowCanvas for execution/viewing
- **AuthoringCanvas**: Extended canvas with NodePalette for workflow creation

#### Node Components (Unified Architecture)
- `UnifiedWorkflowNode`: Single component for all node types
- `NodeHeader`: Title, type indicator, status badge
- `NodeBody`: Input/output displays, duration, error messages
- `NodeHandles`: Source/target connection points
- `NodeActions`: Configure/duplicate/delete actions (authoring mode)

#### Node Configuration System
- **Sidebar Component**: Dual-mode (execution/authoring)
  - Execution mode: Shows node status, timings, input/output, errors
  - Authoring mode: Shows configuration panel with node-specific forms
- **NodeConfigPanel**: Main container component
  - Node name editing (auto-save on blur/Enter)
  - Routes to appropriate config component based on node type
- **Configuration Components** (in `components/workflow/config/`):
  - `HttpRequestConfig`: API selection from API management + endpoint + request body
  - `ConditionalConfig`: Condition expression builder with JSONPath examples
  - `DelayConfig`: Duration input with unit selector (ms/s/m/h)
  - `JoinConfig`: Policy selector (ALL/ANY/COUNT) with conditional count input
  - `SubWorkflowConfig`: Workflow selector + execution mode + input mapping
- **Store Actions**:
  - `updateNodeData(nodeId, data)`: Updates node configuration
  - `updateNodeName(nodeId, name)`: Updates node name
- **Validation**: `getNodeConfigurationStatus()` validates node-specific requirements

### Key Implementation Notes

1. **React Flow Integration**:
   - Nodes use position from workflow definition or execution snapshot
   - Edges derived from `parents` in ingestion events or explicit in authored workflows
   - Custom node types registered via `nodeTypes` prop

2. **WebSocket Message Handling**:
   - Connect on component mount, subscribe to execution topics
   - Parse messages and update Zustand store
   - Automatic cleanup on unmount

3. **Form Management**:
   - React Hook Form + Zod validation for API/secret store forms
   - `useApiManagement` hook for API configuration CRUD

4. **Styling Conventions**:
   - Tailwind with custom color palette (workflow/node colors)
   - Custom shadows: `shadow-node`, `shadow-panel`
   - Animations: `animate-pulse-slow`, `animate-bounce-subtle`

5. **TypeScript Patterns**:
   - Strict types for workflows, executions, nodes, edges
   - Generic `BaseNodeData` with execution/authoring variants
   - API client classes with typed methods

### Routing Structure

```
/                           → Redirects to /workflows
/workflows                  → List all workflows
/workflows/new              → Create new workflow (authoring)
/workflows/:id              → View workflow details
/workflows/:id/edit         → Edit workflow (authoring)
/executions                 → List all executions
/executions/:id             → View execution with real-time updates
/dashboard                  → Dashboard overview
/apis                       → API configurations
/apis/new                   → Create API configuration
/secret-stores              → Secret store management
/secret-stores/new          → Create secret store
```

### Important Development Patterns

1. **Adding a New Node Type**:
   - Add type to `NodeType` union in `types/workflow.ts`
   - Update `NODE_TYPE_CONFIG` in `utils/workflow-config.ts`
   - Add color to Tailwind config under `theme.extend.colors.node`
   - Handle in `UnifiedWorkflowNode` rendering logic

2. **API Client Usage**:
   - Use singleton instances: `workflowApi`, `ingestionApi`
   - Wrap in TanStack Query hooks for caching
   - Handle `ApiError` with status codes

3. **Real-time Updates**:
   - WebSocket service is singleton: `webSocketService`
   - Subscribe to execution: `subscribeToExecution(workflowId, executionId)`
   - Add event listener: `addEventListener(handler)`
   - Always return and call unsubscribe functions in cleanup

4. **Store Updates**:
   - Use Zustand actions, never mutate state directly
   - `updateExecutionSnapshot()` checks executionId before updating
   - `updateNodeData()` and `updateNodeName()` for node configuration in authoring
   - Reset functions available: `resetWorkflow()`, `resetExecution()`

5. **Node Configuration Workflow**:
   - User clicks node in authoring mode → sidebar opens with `mode="authoring"`
   - `NodeConfigPanel` renders appropriate config component based on node type
   - Configuration changes trigger `updateNodeData()` → updates workflow store
   - Workflow store changes trigger `hasUnsavedChanges` flag in parent component
   - User saves workflow → persists all node configurations to backend
   - Validation runs via `getNodeConfigurationStatus()` to mark nodes as configured/unconfigured
