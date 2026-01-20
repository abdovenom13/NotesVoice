import React, { createContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type AIModel = 'gemini-flash' | 'gemini-flash-lite' | 'gemini-pro' | 'gpt-5-mini' | 'gpt-5' | 'gpt-5-nano' | 'gemini-flash-image' | 'gemini-pro-image';

export interface Settings {
  aiModel: AIModel;
  fontSize: 'small' | 'medium' | 'large';
  autoSave: boolean;
  darkMode: boolean;
  language: 'ar' | 'en';
  showTimestamps: boolean;
  maxImageSize: number; // MB
  maxFileSize: number; // MB for exports/imports
  compactView: boolean;
  lineSpacing: 'normal' | 'relaxed' | 'loose';
  enableSpellCheck: boolean;
  enableWordCount: boolean;
  enableAutoBackup: boolean;
  backupInterval: number; // hours
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
  compactView: false,
  lineSpacing: 'normal',
  enableSpellCheck: true,
  enableWordCount: true,
  enableAutoBackup: false,
  backupInterval: 24,
};

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const stored = await AsyncStorage.getItem('app-settings');
      if (stored) {
        const parsed = JSON.parse(stored);
        setSettings({ ...DEFAULT_SETTINGS, ...parsed });
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  };

  const updateSettings = async (newSettings: Partial<Settings>) => {
    const updated = { ...settings, ...newSettings };
    setSettings(updated);
    try {
      await AsyncStorage.setItem('app-settings', JSON.stringify(updated));
    } catch (error) {
      console.error('Error saving settings:', error);
    }
  };

  const resetSettings = async () => {
    setSettings(DEFAULT_SETTINGS);
    try {
      await AsyncStorage.setItem('app-settings', JSON.stringify(DEFAULT_SETTINGS));
    } catch (error) {
      console.error('Error resetting settings:', error);
    }
  };

  return (
    <SettingsContext.Provider value={{ settings, updateSettings, resetSettings }}>
      {children}
    </SettingsContext.Provider>
  );
}
