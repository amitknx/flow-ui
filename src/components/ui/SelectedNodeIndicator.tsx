import React from 'react';
import { Keyboard } from 'lucide-react';
import { isMac } from '../../hooks/useKeyboardShortcuts';

interface SelectedNodeIndicatorProps {
  nodeName?: string;
  className?: string;
}

const SelectedNodeIndicator: React.FC<SelectedNodeIndicatorProps> = ({
  nodeName,
  className = ''
}) => {
  if (!nodeName) return null;

  return (
    <div className={`fixed bottom-4 left-4 bg-white border border-gray-200 rounded-lg shadow-lg p-3 z-30 ${className}`}>
      <div className="flex items-center gap-2 text-sm">
        <Keyboard className="w-4 h-4 text-gray-500" />
        <div>
          <div className="font-medium text-gray-900">
            {nodeName}
          </div>
          <div className="text-xs text-gray-500 flex items-center gap-2">
            <kbd className="px-1.5 py-0.5 text-xs bg-gray-100 border border-gray-300 rounded">
              {isMac ? '⌘D' : 'Ctrl+D'}
            </kbd>
            duplicate
            <kbd className="px-1.5 py-0.5 text-xs bg-gray-100 border border-gray-300 rounded">
              Del
            </kbd>
            delete
          </div>
        </div>
      </div>
    </div>
  );
};

export default SelectedNodeIndicator;
