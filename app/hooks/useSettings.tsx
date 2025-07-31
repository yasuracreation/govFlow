import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import i18n from '../i18n';

export interface AppSettings {
  language: 'en' | 'si' | 'ta';
  theme: 'light' | 'dark' | 'auto';
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  appName: string;
  appLogo?: string;
  favicon?: string;
}

const defaultSettings: AppSettings = {
  language: 'en',
  theme: 'light',
  primaryColor: '#2563eb',
  secondaryColor: '#64748b',
  accentColor: '#f59e0b',
  appName: 'GovFlow',
};

interface SettingsContextType {
  settings: AppSettings;
  updateSettings: (newSettings: Partial<AppSettings>) => void;
  resetSettings: () => void;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) {
   return null
  }
  return context;
};

interface SettingsProviderProps {
  children: ReactNode;
}

export const SettingsProvider = ({ children }: SettingsProviderProps) => {
  const [settings, setSettings] = useState<AppSettings>(() => {
    const saved = localStorage.getItem('govflow-settings');
    if (saved) {
      try {
        return { ...defaultSettings, ...JSON.parse(saved) };
      } catch {
        return defaultSettings;
      }
    }
    return defaultSettings;
  });

  useEffect(() => {
    // Save settings to localStorage
    localStorage.setItem('govflow-settings', JSON.stringify(settings));
    
    // Apply language - use direct i18n instance with error handling
    const changeLanguage = async () => {
      try {
        // Wait for i18n to be ready
        if (i18n.isInitialized) {
          await i18n.changeLanguage(settings.language);
        } else {
          // If not initialized, wait a bit and try again
          setTimeout(async () => {
            try {
              await i18n.changeLanguage(settings.language);
            } catch (error) {
              console.warn('Failed to change language after delay:', error);
            }
          }, 100);
        }
      } catch (error) {
        console.warn('Failed to change language:', error);
      }
    };
    
    changeLanguage();
    
    // Apply theme
    applyTheme(settings.theme);
    
    // Apply colors
    applyColors(settings);
    
    // Update favicon
    if (settings.favicon) {
      let link = document.querySelector("link[rel*='icon']") as HTMLLinkElement | null;
      if (!link) {
        link = document.createElement('link');
        link.rel = 'icon';
        document.head.appendChild(link);
      }
      link.type = 'image/x-icon';
      link.href = settings.favicon;
    }
  }, [settings]);

  const applyTheme = (theme: string) => {
    const root = document.documentElement;
    
    if (theme === 'auto') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const isDark = mediaQuery.matches;
      root.classList.toggle('dark', isDark);
      
      mediaQuery.addEventListener('change', (e) => {
        root.classList.toggle('dark', e.matches);
      });
    } else {
      root.classList.toggle('dark', theme === 'dark');
    }
  };

  const applyColors = (appSettings: AppSettings) => {
    const root = document.documentElement;
    root.style.setProperty('--primary-color', appSettings.primaryColor);
    root.style.setProperty('--secondary-color', appSettings.secondaryColor);
    root.style.setProperty('--accent-color', appSettings.accentColor);
  };

  const updateSettings = (newSettings: Partial<AppSettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  };

  const resetSettings = () => {
    setSettings(defaultSettings);
  };

  return (
    <SettingsContext.Provider value={{ settings, updateSettings, resetSettings }}>
      {children}
    </SettingsContext.Provider>
  );
}; 