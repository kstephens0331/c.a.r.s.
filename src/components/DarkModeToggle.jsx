import React, { useEffect } from 'react';
import { Moon, Sun } from 'lucide-react';
import { useStore } from '../store/useStore';

/**
 * DarkModeToggle Component
 * Toggles between light and dark mode themes
 */
const DarkModeToggle = () => {
  const { darkMode, toggleDarkMode } = useStore();

  useEffect(() => {
    // Apply dark mode class to html element
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  return (
    <button
      onClick={toggleDarkMode}
      className="p-2 rounded-lg transition-colors hover:bg-gray-200 dark:hover:bg-gray-700"
      aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
      title={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      {darkMode ? (
        <Sun size={20} className="text-yellow-400" />
      ) : (
        <Moon size={20} className="text-gray-600" />
      )}
    </button>
  );
};

export default DarkModeToggle;
