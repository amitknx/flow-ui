import React from 'react';
import { Link } from 'react-router-dom';
import { 
  BarChart3, 
  TrendingUp, 
  Clock, 
  CheckCircle, 
  XCircle,
  Play,
  Workflow,
  ArrowRight
} from 'lucide-react';
import { getStatusIcon } from '../../utils';

const DashboardPage: React.FC = () => {
  // Mock data - in real app this would come from API
  const stats = {
    totalWorkflows: 12,
    activeExecutions: 3,
    successfulExecutions: 45,
    failedExecutions: 2,
    avgExecutionTime: '2.3m',
  };

  const recentExecutions = [
    {
      id: 'exec-1',
      workflowName: 'Data Processing Pipeline',
      status: 'SUCCESS',
      duration: '1.2m',
      startedAt: '2 minutes ago',
    },
    {
      id: 'exec-2',
      workflowName: 'User Onboarding Flow',
      status: 'RUNNING',
      duration: '30s',
      startedAt: '5 minutes ago',
    },
    {
      id: 'exec-3',
      workflowName: 'Payment Processing',
      status: 'FAILED',
      duration: '45s',
      startedAt: '10 minutes ago',
    },
  ];


  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-1">
          Overview of your workflow platform activity
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Workflow className="w-8 h-8 text-primary-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Workflows</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.totalWorkflows}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Play className="w-8 h-8 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Active Executions</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.activeExecutions}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Successful</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.successfulExecutions}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <XCircle className="w-8 h-8 text-red-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Failed</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.failedExecutions}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Clock className="w-8 h-8 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Avg Duration</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.avgExecutionTime}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Executions */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Recent Executions</h2>
              <Link 
                to="/executions"
                className="text-primary-600 hover:text-primary-700 text-sm font-medium inline-flex items-center"
              >
                View all
                <ArrowRight className="w-4 h-4 ml-1" />
              </Link>
            </div>
          </div>
          
          <div className="divide-y divide-gray-200">
            {recentExecutions.map((execution) => (
              <div key={execution.id} className="px-6 py-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    {getStatusIcon(execution.status as any)}
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {execution.workflowName}
                      </p>
                      <p className="text-xs text-gray-500">
                        {execution.startedAt} • Duration: {execution.duration}
                      </p>
                    </div>
                  </div>
                  
                  <Link
                    to={`/executions/${execution.id}`}
                    className="text-primary-600 hover:text-primary-700 text-sm font-medium"
                  >
                    View
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Quick Actions</h2>
          </div>
          
          <div className="p-6 space-y-4">
            <Link
              to="/workflows/new"
              className="block w-full text-left p-4 border border-gray-200 rounded-lg hover:border-primary-300 hover:bg-primary-50 transition-colors"
            >
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                  <Workflow className="w-5 h-5 text-primary-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">Create Workflow</p>
                  <p className="text-sm text-gray-600">Design a new workflow from scratch</p>
                </div>
              </div>
            </Link>

            <Link
              to="/workflows"
              className="block w-full text-left p-4 border border-gray-200 rounded-lg hover:border-primary-300 hover:bg-primary-50 transition-colors"
            >
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <Play className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">Execute Workflow</p>
                  <p className="text-sm text-gray-600">Run an existing workflow</p>
                </div>
              </div>
            </Link>

            <Link
              to="/executions"
              className="block w-full text-left p-4 border border-gray-200 rounded-lg hover:border-primary-300 hover:bg-primary-50 transition-colors"
            >
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <BarChart3 className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">Monitor Executions</p>
                  <p className="text-sm text-gray-600">Track workflow performance</p>
                </div>
              </div>
            </Link>
          </div>
        </div>
      </div>

      {/* Performance Chart Placeholder */}
      <div className="mt-8 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Execution Trends</h2>
        <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
          <div className="text-center text-gray-500">
            <TrendingUp className="w-12 h-12 mx-auto mb-2" />
            <p>Performance charts coming soon...</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
