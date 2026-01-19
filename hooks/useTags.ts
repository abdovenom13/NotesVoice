import { useContext } from 'react';
import { TagsContext } from '@/contexts/TagsContext';

export function useTags() {
  const context = useContext(TagsContext);
  if (!context) {
    throw new Error('useTags must be used within TagsProvider');
  }
  return context;
}
