import React, { useState } from 'react';
import { useAuth } from '../../hooks/useAuth.tsx';
import { useSettings } from '../../hooks/useSettings.tsx';
import Button from '../common/Button.tsx';
import NotificationCenter from '../common/NotificationCenter.tsx';
import { User, LogOut, Settings, Globe } from 'lucide-react';

const Header: React.FC = () => {
  const { user, logout } = useAuth();
  const settingsContext = useSettings();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showLanguageMenu, setShowLanguageMenu] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const handleLanguageChange = (language: 'en' | 'si' | 'ta') => {
    if (settingsContext) {
      settingsContext.updateSettings({ language });
    }
    setShowLanguageMenu(false);
  };

  const getLanguageLabel = (code: string) => {
    switch (code) {
      case 'en': return 'English';
      case 'si': return 'සිංහල';
      case 'ta': return 'தமிழ்';
      default: return 'English';
    }
  };

  if (!user) return null;

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="flex items-center justify-between px-6 py-4">
        {/* Left side - App name and breadcrumb */}
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">G</span>
            </div>
            <h1 className="text-xl font-semibold text-gray-900">
              {settingsContext?.settings.appName || 'GovFlow'}
            </h1>
          </div>
        </div>

        {/* Right side - User menu and actions */}
        <div className="flex items-center space-x-4">
          {/* Notifications */}
          <NotificationCenter />

          {/* Language Switcher */}
          <div className="relative">
            <button
              onClick={() => setShowLanguageMenu(!showLanguageMenu)}
              className="flex items-center space-x-1 p-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              <Globe size={16} />
              <span className="text-sm">
                {getLanguageLabel(settingsContext?.settings.language || 'en')}
              </span>
            </button>

            {showLanguageMenu && (
              <div className="absolute right-0 mt-2 w-32 bg-white rounded-md shadow-lg border border-gray-200 z-50">
                <div className="py-1">
                  <button
                    onClick={() => handleLanguageChange('en')}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    English
                  </button>
                  <button
                    onClick={() => handleLanguageChange('si')}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    සිංහල
                  </button>
                  <button
                    onClick={() => handleLanguageChange('ta')}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    தமிழ்
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* User Menu */}
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center space-x-2 p-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                <User size={16} className="text-white" />
              </div>
              <div className="text-left">
                <p className="text-sm font-medium text-gray-900">{user.name}</p>
                <p className="text-xs text-gray-500">{user.role}</p>
              </div>
            </button>

            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg border border-gray-200 z-50">
                <div className="py-1">
                  <div className="px-4 py-2 border-b border-gray-100">
                    <p className="text-sm font-medium text-gray-900">{user.name}</p>
                    <p className="text-xs text-gray-500">{user.employeeId}</p>
                    <p className="text-xs text-gray-500">{user.role}</p>
                  </div>
                  
                  <button
                    onClick={() => {
                      setShowUserMenu(false);
                      // Navigate to settings if admin
                      if (user.role === 'Admin') {
                        window.location.hash = '#/admin/settings';
                      }
                    }}
                    className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    <Settings size={16} className="mr-2" />
                    Settings
                  </button>
                  
                  <button
                    onClick={handleLogout}
                    className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                  >
                    <LogOut size={16} className="mr-2" />
                    Sign Out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Close menus when clicking outside */}
      {(showUserMenu || showLanguageMenu) && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => {
            setShowUserMenu(false);
            setShowLanguageMenu(false);
          }}
        />
      )}
    </header>
  );
};

export default Header;