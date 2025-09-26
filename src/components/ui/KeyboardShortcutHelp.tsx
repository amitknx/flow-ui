import React, { useState } from 'react';
import { HelpCircle, X } from 'lucide-react';
import { clsx } from 'clsx';
import { isMac } from '../../hooks/useKeyboardShortcuts';

interface KeyboardShortcut {
  keys: string[];
  description: string;
  category?: string;
}

const shortcuts: KeyboardShortcut[] = [
  {
    keys: [isMac ? '⌘' : 'Ctrl', 'D'],
    description: 'Duplicate selected node',
    category: 'Node Operations'
  },
  {
    keys: ['Delete'],
    description: 'Delete selected node',
    category: 'Node Operations'
  },
  {
    keys: ['Backspace'],
    description: 'Delete selected node',
    category: 'Node Operations'
  },
  {
    keys: ['Space'],
    description: 'Pan canvas (hold and drag)',
    category: 'Navigation'
  },
  {
    keys: [isMac ? '⌘' : 'Ctrl', 'S'],
    description: 'Save workflow',
    category: 'File Operations'
  },
];

interface KeyboardShortcutHelpProps {
  className?: string;
}

const KeyboardShortcutHelp: React.FC<KeyboardShortcutHelpProps> = ({ className }) => {
  const [isOpen, setIsOpen] = useState(false);

  const groupedShortcuts = shortcuts.reduce((acc, shortcut) => {
    const category = shortcut.category || 'Other';
    if (!acc[category]) acc[category] = [];
    acc[category].push(shortcut);
    return acc;
  }, {} as Record<string, KeyboardShortcut[]>);

  return (
    <div className={clsx('relative', className)}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
        title="Keyboard shortcuts"
      >
        <HelpCircle className="w-5 h-5" />
      </button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black/20 z-40"
            onClick={() => setIsOpen(false)}
          />
          
          {/* Help Panel */}
          <div className="absolute top-full right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50 max-h-96 overflow-y-auto">
            <div className="p-4 border-b border-gray-200 flex items-center justify-between">
              <h3 className="font-semibold text-gray-900">Keyboard Shortcuts</h3>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            
            <div className="p-4 space-y-4">
              {Object.entries(groupedShortcuts).map(([category, categoryShortcuts]) => (
                <div key={category}>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">{category}</h4>
                  <div className="space-y-2">
                    {categoryShortcuts.map((shortcut, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">{shortcut.description}</span>
                        <div className="flex items-center gap-1">
                          {shortcut.keys.map((key, keyIndex) => (
                            <React.Fragment key={keyIndex}>
                              <kbd className="px-2 py-1 text-xs font-mono bg-gray-100 border border-gray-300 rounded">
                                {key}
                              </kbd>
                              {keyIndex < shortcut.keys.length - 1 && (
                                <span className="text-xs text-gray-400">+</span>
                              )}
                            </React.Fragment>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default KeyboardShortcutHelp;
