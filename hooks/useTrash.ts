import { useContext } from 'react';
import { TrashContext } from '@/contexts/TrashContext';

export function useTrash() {
  const context = useContext(TrashContext);
  if (!context) {
    throw new Error('useTrash must be used within TrashProvider');
  }
  return context;
}
