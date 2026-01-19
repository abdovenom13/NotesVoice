import React, { createContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as LocalAuthentication from 'expo-local-authentication';

export type SecurityMethod = 'none' | 'biometric' | 'pattern';

interface SecuritySettings {
  method: SecurityMethod;
  pattern?: string;
  autoLockDelay: number; // minutes
}

interface SecurityContextType {
  settings: SecuritySettings;
  isLocked: boolean;
  isBiometricAvailable: boolean;
  updateSecurityMethod: (method: SecurityMethod, pattern?: string) => Promise<void>;
  updateAutoLockDelay: (minutes: number) => Promise<void>;
  authenticate: (inputPattern?: string) => Promise<boolean>;
  lock: () => void;
  unlock: () => void;
}

export const SecurityContext = createContext<SecurityContextType | undefined>(undefined);

const DEFAULT_SETTINGS: SecuritySettings = {
  method: 'none',
  autoLockDelay: 5,
};

export function SecurityProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<SecuritySettings>(DEFAULT_SETTINGS);
  const [isLocked, setIsLocked] = useState(false);
  const [isBiometricAvailable, setIsBiometricAvailable] = useState(false);
  const [lastActiveTime, setLastActiveTime] = useState(Date.now());

  useEffect(() => {
    loadSettings();
    checkBiometricAvailability();
  }, []);

  useEffect(() => {
    if (settings.method !== 'none') {
      const interval = setInterval(() => {
        const inactiveMinutes = (Date.now() - lastActiveTime) / (1000 * 60);
        if (inactiveMinutes >= settings.autoLockDelay && !isLocked) {
          setIsLocked(true);
        }
      }, 10000); // Check every 10 seconds

      return () => clearInterval(interval);
    }
  }, [lastActiveTime, settings.autoLockDelay, settings.method, isLocked]);

  useEffect(() => {
    const handleActivity = () => {
      setLastActiveTime(Date.now());
    };

    // Reset timer on any interaction
    const activityInterval = setInterval(handleActivity, 30000);
    return () => clearInterval(activityInterval);
  }, []);

  const checkBiometricAvailability = async () => {
    try {
      const compatible = await LocalAuthentication.hasHardwareAsync();
      const enrolled = await LocalAuthentication.isEnrolledAsync();
      setIsBiometricAvailable(compatible && enrolled);
    } catch (error) {
      console.error('Biometric check error:', error);
      setIsBiometricAvailable(false);
    }
  };

  const loadSettings = async () => {
    try {
      const stored = await AsyncStorage.getItem('security-settings');
      if (stored) {
        const parsed = JSON.parse(stored);
        setSettings({ ...DEFAULT_SETTINGS, ...parsed });
        setIsLocked(parsed.method !== 'none');
      }
    } catch (error) {
      console.error('Error loading security settings:', error);
    }
  };

  const updateSecurityMethod = async (method: SecurityMethod, pattern?: string) => {
    const updated = { ...settings, method, pattern };
    setSettings(updated);
    try {
      await AsyncStorage.setItem('security-settings', JSON.stringify(updated));
      setIsLocked(method !== 'none');
    } catch (error) {
      console.error('Error saving security method:', error);
    }
  };

  const updateAutoLockDelay = async (minutes: number) => {
    const updated = { ...settings, autoLockDelay: minutes };
    setSettings(updated);
    try {
      await AsyncStorage.setItem('security-settings', JSON.stringify(updated));
    } catch (error) {
      console.error('Error saving auto-lock delay:', error);
    }
  };

  const authenticate = async (inputPattern?: string): Promise<boolean> => {
    try {
      if (settings.method === 'biometric') {
        const result = await LocalAuthentication.authenticateAsync({
          promptMessage: 'قم بالمصادقة للوصول إلى الملاحظات',
          fallbackLabel: 'استخدم كلمة المرور',
          disableDeviceFallback: false,
        });
        
        if (result.success) {
          setIsLocked(false);
          setLastActiveTime(Date.now());
          return true;
        }
        return false;
      } else if (settings.method === 'pattern') {
        if (inputPattern === settings.pattern) {
          setIsLocked(false);
          setLastActiveTime(Date.now());
          return true;
        }
        return false;
      }
      
      return true;
    } catch (error) {
      console.error('Authentication error:', error);
      return false;
    }
  };

  const lock = () => {
    if (settings.method !== 'none') {
      setIsLocked(true);
    }
  };

  const unlock = () => {
    setIsLocked(false);
    setLastActiveTime(Date.now());
  };

  return (
    <SecurityContext.Provider
      value={{
        settings,
        isLocked,
        isBiometricAvailable,
        updateSecurityMethod,
        updateAutoLockDelay,
        authenticate,
        lock,
        unlock,
      }}
    >
      {children}
    </SecurityContext.Provider>
  );
}
