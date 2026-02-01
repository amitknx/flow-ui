import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

import Header from './components/layout/Header';
import WorkflowsPage from './features/workflows/WorkflowsPage';
import WorkflowDetailPage from './features/workflows/WorkflowDetailPage';
import WorkflowAuthoringPage from './features/workflows/WorkflowAuthoringPage';
import ExecutionsPage from './features/executions/ExecutionsPage';
import ExecutionDetailPage from './features/executions/ExecutionDetailPage';
import DashboardPage from './features/dashboard/DashboardPage';
import { ApisPage } from './features/apis/ApisPage';
import { ApiCreatePage } from './features/apis/ApiCreatePage';
import { ApiDetailPage } from './features/apis/ApiDetailPage';
import { ApiEditPage } from './features/apis/ApiEditPage';
import { ApiPlaygroundPage } from './features/apis/ApiPlaygroundPage';
import { SecretStoresPage } from './features/secret-stores/SecretStoresPage';
import { SecretStoreCreatePage } from './features/secret-stores/SecretStoreCreatePage';
import SecretsPage from './features/secrets/SecretsPage';

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 10, // 10 minutes
      retry: (failureCount, error) => {
        // Don't retry on 4xx errors
        if (error instanceof Error && 'status' in error && (error as any).status >= 400 && (error as any).status < 500) {
          return false;
        }
        return failureCount < 3;
      },
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <div className="min-h-screen bg-gray-50">
          <Header />
          <main className="flex-1">
            <Routes>
              {/* Default redirect */}
              <Route path="/" element={<Navigate to="/dashboard" replace />} />

              {/* Dashboard */}
              <Route path="/dashboard" element={<DashboardPage />} />

              {/* Workflows */}
              <Route path="/workflows" element={<WorkflowsPage />} />
              <Route path="/workflows/new" element={<WorkflowAuthoringPage />} />
              <Route path="/workflows/:id" element={<WorkflowDetailPage />} />
              <Route path="/workflows/:id/edit" element={<WorkflowAuthoringPage />} />

              {/* Executions */}
              <Route path="/executions" element={<ExecutionsPage />} />
              <Route path="/executions/:id" element={<ExecutionDetailPage />} />

              {/* APIs */}
              <Route path="/apis" element={<ApisPage />} />
              <Route path="/apis/new" element={<ApiCreatePage />} />
              <Route path="/apis/playground" element={<ApiPlaygroundPage />} />
              <Route path="/apis/:id/edit" element={<ApiEditPage />} />
              <Route path="/apis/:id" element={<ApiDetailPage />} />

              {/* Secrets */}
              <Route path="/secrets" element={<SecretsPage />} />

              {/* Secret Stores */}
              <Route path="/secret-stores" element={<SecretStoresPage />} />
              <Route path="/secret-stores/new" element={<SecretStoreCreatePage />} />

              {/* 404 */}
              <Route path="*" element={
                <div className="flex items-center justify-center h-96">
                  <div className="text-center">
                    <h1 className="text-2xl font-bold text-gray-900">404 - Page Not Found</h1>
                    <p className="text-gray-600 mt-2">The page you're looking for doesn't exist.</p>
                  </div>
                </div>
              } />
            </Routes>
          </main>
        </div>
      </Router>

      {/* React Query Devtools */}
      {import.meta.env.DEV && <ReactQueryDevtools initialIsOpen={false} />}
    </QueryClientProvider>
  );
}

export default App;