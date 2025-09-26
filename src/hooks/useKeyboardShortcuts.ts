import { useEffect, useCallback } from 'react';

export interface KeyboardShortcut {
  key: string;
  ctrlKey?: boolean;
  metaKey?: boolean;
  shiftKey?: boolean;
  altKey?: boolean;
  callback: (event: KeyboardEvent) => void;
  preventDefault?: boolean;
}

export const useKeyboardShortcuts = (shortcuts: KeyboardShortcut[], enabled = true) => {
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (!enabled) return;

    // Don't trigger shortcuts when user is typing in inputs
    const target = event.target as HTMLElement;
    if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
      return;
    }

    for (const shortcut of shortcuts) {
      const keyMatches = event.key.toLowerCase() === shortcut.key.toLowerCase();
      const ctrlMatches = !!shortcut.ctrlKey === event.ctrlKey;
      const metaMatches = !!shortcut.metaKey === event.metaKey;
      const shiftMatches = !!shortcut.shiftKey === event.shiftKey;
      const altMatches = !!shortcut.altKey === event.altKey;

      if (keyMatches && ctrlMatches && metaMatches && shiftMatches && altMatches) {
        if (shortcut.preventDefault !== false) {
          event.preventDefault();
          event.stopPropagation();
        }
        shortcut.callback(event);
        break;
      }
    }
  }, [shortcuts, enabled]);

  useEffect(() => {
    if (enabled) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [handleKeyDown, enabled]);
};

// Helper function to detect OS
export const isMac = typeof window !== 'undefined' && /Mac|iPod|iPhone|iPad/.test(navigator.platform);

// Common shortcut patterns
export const createCopyShortcut = (callback: () => void): KeyboardShortcut => ({
  key: 'c',
  [isMac ? 'metaKey' : 'ctrlKey']: true,
  callback,
});

export const createDuplicateShortcut = (callback: () => void): KeyboardShortcut => ({
  key: 'd',
  [isMac ? 'metaKey' : 'ctrlKey']: true,
  callback,
});

export const createDeleteShortcut = (callback: () => void): KeyboardShortcut[] => [
  {
    key: 'Delete',
    callback,
  },
  {
    key: 'Backspace',
    callback,
  },
];

export const createSelectAllShortcut = (callback: () => void): KeyboardShortcut => ({
  key: 'a',
  [isMac ? 'metaKey' : 'ctrlKey']: true,
  callback,
});

export const createUndoShortcut = (callback: () => void): KeyboardShortcut => ({
  key: 'z',
  [isMac ? 'metaKey' : 'ctrlKey']: true,
  callback,
});

export const createRedoShortcut = (callback: () => void): KeyboardShortcut => ({
  key: 'z',
  [isMac ? 'metaKey' : 'ctrlKey']: true,
  shiftKey: true,
  callback,
});
