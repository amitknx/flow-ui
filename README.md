# Flowboard UI

A modern React-based user interface for the Flowboard workflow visualization and orchestration platform.

## 🚀 Features

- **Workflow Authoring**: Create and edit workflow definitions using a visual canvas
  - Drag-and-drop node placement from palette
  - Visual edge connections with smooth bezier curves
  - Node configuration via sidebar panel
  - Real-time validation and configuration status indicators
- **Node Configuration System**:
  - Edit node names inline
  - Type-specific configuration forms (API selection, conditions, delays, etc.)
  - Integration with API management for HTTP requests
  - JSONPath support for data mapping and conditions
- **Real-time Execution Monitoring**: Watch workflow executions in real-time with live updates
- **API Management**: Configure and manage external API integrations
  - Support for multiple authentication methods (Basic, Bearer, API Key, OAuth2)
  - Secret store integration for secure credential management
  - Endpoint configuration with headers and request bodies
- **API Playground**: Test APIs interactively
  - Build requests manually with method, URL, headers, and body
  - Import cURL commands with automatic parsing
  - View responses with formatted JSON and headers
  - Copy requests as cURL for sharing
- **Professional UI Components**: Built with the same high-quality components as your reference design
- **WebSocket Integration**: Real-time updates via STOMP/SockJS
- **Modular Architecture**: Feature-first directory structure for maintainability
- **Type Safety**: Full TypeScript support with comprehensive type definitions

## 🛠 Tech Stack

- **React 18** with TypeScript
- **Vite** for fast development and building
- **React Flow** for workflow visualization (using @xyflow/react)
- **React Router** for navigation
- **TanStack Query** for API state management
- **Zustand** for client-side state management
- **Tailwind CSS** for styling
- **STOMP/SockJS** for WebSocket communication
- **Zod** for runtime type validation

## 📁 Project Structure

```
src/
├── components/           # Shared UI components
│   ├── ui/              # Basic UI components
│   ├── layout/          # Layout components (Header, Sidebar)
│   └── workflow/        # Workflow-specific components
├── features/            # Feature modules
│   ├── workflows/       # Workflow management
│   ├── executions/      # Execution monitoring
│   └── dashboard/       # Dashboard overview
├── hooks/               # Custom React hooks
├── services/            # API clients and external services
├── stores/              # Zustand stores
├── types/               # TypeScript type definitions
└── utils/               # Utility functions
```

## 🎨 UI Design

The interface matches the professional design from your reference, featuring:

- **Clean, modern aesthetic** with proper spacing and typography
- **Status-aware visualizations** with color-coded nodes and edges
- **Interactive workflow canvas** with drag-and-drop capabilities
- **Detailed side panels** showing node inputs, outputs, and execution details
- **Real-time status updates** with animated indicators
- **Responsive design** that works on different screen sizes

## 🔧 Development

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Backend services running (see `/Users/anathani/dev/flow/`)

### Getting Started

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Start development server**:
   ```bash
   npm run dev
   ```

3. **Open in browser**:
   ```
   http://localhost:5174
   ```

### Environment Configuration

Create a `.env` file:

```bash
# API Configuration
VITE_API_BASE_URL=http://localhost:8080
VITE_WS_URL=http://localhost:8080/ws

# Development
VITE_DEV_MODE=true
```

## 📋 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## 🔗 API Integration

The UI integrates with your backend services through:

### REST APIs
- **Workflow Management**: `/api/v1/workflows/*`
- **Execution Control**: `/api/v1/executions/*` 
- **Event Ingestion**: `/api/v1/events/*`

### WebSocket Topics
- **Execution Updates**: `/topic/workflows/{workflowId}/executions/{executionId}`
- **Workflow Events**: `/topic/workflows/{workflowId}`

## 🎯 Key Components

### WorkflowCanvas
- Visual workflow representation using React Flow
- Supports both authoring and execution modes
- Real-time status updates
- Interactive node selection and editing

### Node Types & Configuration

Each node type has specific configuration requirements accessible via the sidebar panel in authoring mode:

- **START/END**: Workflow entry and exit points (no configuration required)
- **HTTP_REQUEST**: External API calls
  - Select from pre-configured APIs (from API management section)
  - Choose endpoint from selected API
  - Configure request body for POST/PUT/PATCH methods
- **DELAY**: Time-based delays
  - Set duration with unit (milliseconds, seconds, minutes, hours)
  - Real-time preview of total delay
- **CONDITIONAL**: Branching logic
  - Define condition expressions using JSONPath syntax
  - Access previous node outputs (e.g., `$.output.status === 'success'`)
- **JOIN**: Merge multiple branches
  - Select join policy: ALL (wait for all), ANY (wait for any), COUNT (wait for N branches)
  - Configure branch count for COUNT policy
- **SUB_WORKFLOW**: Nested workflow execution
  - Select sub-workflow from existing workflows
  - Choose execution mode: SYNC (wait for completion) or ASYNC (fire and forget)
  - Map parent workflow data to sub-workflow inputs using JSONPath

### Real-time Features
- Live execution status updates
- WebSocket connection management
- Automatic reconnection handling
- Real-time node status visualization

## 🚦 Status Indicators

- 🟡 **PENDING**: Waiting to start
- 🔵 **RUNNING**: Currently executing (animated)
- 🟢 **SUCCESS**: Completed successfully
- 🔴 **FAILED**: Execution failed

## 📱 Pages

1. **Dashboard** (`/dashboard`) - Overview and quick actions
2. **Workflows** (`/workflows`) - Workflow list and management
3. **Workflow Detail** (`/workflows/:id`) - Individual workflow view/edit
4. **Executions** (`/executions`) - Execution history and monitoring
5. **Execution Detail** (`/executions/:id`) - Real-time execution view
6. **API Playground** (`/apis/playground`) - Test APIs with request builder and cURL import

## 🔄 State Management

- **API State**: Managed by TanStack Query with caching and synchronization
- **UI State**: Managed by Zustand stores for workflow and execution data
- **Real-time Updates**: WebSocket integration with automatic state updates

## 🎨 Styling

- **Tailwind CSS** with custom workflow-specific color palette
- **Professional design** matching your reference aesthetic
- **Responsive layout** with mobile-friendly components
- **Consistent spacing** and typography throughout

## 🚀 Deployment

Build for production:

```bash
npm run build
```

The built files will be in the `dist/` directory, ready for deployment to any static hosting service.

---

**Note**: This UI is designed to work with the Flowboard backend services. Ensure your backend is running and accessible at the configured API endpoints for full functionality.