import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Workflow, Play, BarChart3, Settings, Globe } from 'lucide-react';
import { clsx } from 'clsx';

const Header: React.FC = () => {
  const location = useLocation();

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: BarChart3, current: location.pathname === '/dashboard' },
    { name: 'Workflows', href: '/workflows', icon: Workflow, current: location.pathname.startsWith('/workflows') },
    { name: 'Executions', href: '/executions', icon: Play, current: location.pathname.startsWith('/executions') },
    { name: 'APIs', href: '/apis', icon: Globe, current: location.pathname.startsWith('/apis') || location.pathname.startsWith('/credentials') || location.pathname.startsWith('/secret-stores') },
  ];

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2">
              <img
                src='/src/assets/flowboard-transparent.png'
                alt="Flowboard Logo"
                className="w-12 h-12 rounded-lg object-cover"
              />
              <span className="text-xl font-bold text-gray-900">Flowboard</span>
            </Link>
          </div>

          {/* Navigation */}
          <nav className="flex space-x-8">
            {navigation.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={clsx(
                    'inline-flex items-center space-x-2 px-1 pt-1 border-b-2 text-sm font-medium transition-colors',
                    item.current
                      ? 'border-primary-500 text-primary-600'
                      : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                  )}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>

          {/* Actions */}
          <div className="flex items-center space-x-4">
            <button
              type="button"
              className="p-2 text-gray-400 hover:text-gray-500 transition-colors"
            >
              <Settings className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
