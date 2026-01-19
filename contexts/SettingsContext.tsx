import React, { createContext, useState, useEffect, ReactNode } from 'react';

export type AIModel = 'gemini-flash' | 'gemini-pro' | 'gpt-5-mini' | 'gpt-5';

export interface Settings {
  aiModel: AIModel;
  fontSize: 'small' | 'medium' | 'large';
  autoSave: boolean;
  darkMode: boolean;
  language: 'ar' | 'en';
  showTimestamps: boolean;
  maxImageSize: number; // MB
  maxFileSize: number; // MB for exports/imports
}

interface SettingsContextType {
  settings: Settings;
  updateSettings: (newSettings: Partial<Settings>) => void;
  resetSettings: () => void;
}

export const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

const DEFAULT_SETTINGS: Settings = {
  aiModel: 'gemini-flash',
  fontSize: 'medium',
  autoSave: true,
  darkMode: true,
  language: 'ar',
  showTimestamps: true,
  maxImageSize: 5,
  maxFileSize: 100,
};

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = () => {
    try {
      const stored = localStorage.getItem('app-settings');
      if (stored) {
        const parsed = JSON.parse(stored);
        setSettings({ ...DEFAULT_SETTINGS, ...parsed });
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  };

  const updateSettings = (newSettings: Partial<Settings>) => {
    const updated = { ...settings, ...newSettings };
    setSettings(updated);
    localStorage.setItem('app-settings', JSON.stringify(updated));
  };

  const resetSettings = () => {
    setSettings(DEFAULT_SETTINGS);
    localStorage.setItem('app-settings', JSON.stringify(DEFAULT_SETTINGS));
  };

  return (
    <SettingsContext.Provider value={{ settings, updateSettings, resetSettings }}>
      {children}
    </SettingsContext.Provider>
  );
}
