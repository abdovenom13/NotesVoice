import { useContext } from 'react';
import { SecurityContext } from '@/contexts/SecurityContext';

export function useSecurity() {
  const context = useContext(SecurityContext);
  if (!context) {
    throw new Error('useSecurity must be used within SecurityProvider');
  }
  return context;
}
