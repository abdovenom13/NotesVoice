import { useContext } from 'react';
import { FoldersContext } from '@/contexts/FoldersContext';

export function useFolders() {
  const context = useContext(FoldersContext);
  if (!context) {
    throw new Error('useFolders must be used within FoldersProvider');
  }
  return context;
}
