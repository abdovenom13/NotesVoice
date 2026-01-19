import React, { createContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface Tag {
  id: string;
  name: string;
  color: string;
  createdAt: number;
}

interface TagsContextType {
  tags: Tag[];
  createTag: (name: string, color: string) => Promise<Tag>;
  deleteTag: (id: string) => Promise<void>;
  updateTag: (id: string, name: string, color: string) => Promise<void>;
}

export const TagsContext = createContext<TagsContextType | undefined>(undefined);

const PRESET_TAGS: Tag[] = [
  { id: 'work', name: 'عمل', color: '#3B82F6', createdAt: Date.now() },
  { id: 'personal', name: 'شخصي', color: '#10B981', createdAt: Date.now() },
  { id: 'ideas', name: 'أفكار', color: '#F59E0B', createdAt: Date.now() },
  { id: 'important', name: 'مهم', color: '#EF4444', createdAt: Date.now() },
  { id: 'study', name: 'دراسة', color: '#8B5CF6', createdAt: Date.now() },
];

export function TagsProvider({ children }: { children: ReactNode }) {
  const [tags, setTags] = useState<Tag[]>(PRESET_TAGS);

  useEffect(() => {
    loadTags();
  }, []);

  const loadTags = async () => {
    try {
      const stored = await AsyncStorage.getItem('tags');
      if (stored) {
        const parsed = JSON.parse(stored);
        setTags([...PRESET_TAGS, ...parsed.filter((t: Tag) => !PRESET_TAGS.find(p => p.id === t.id))]);
      }
    } catch (error) {
      console.error('Error loading tags:', error);
    }
  };

  const saveTags = async (updatedTags: Tag[]) => {
    try {
      const customTags = updatedTags.filter(t => !PRESET_TAGS.find(p => p.id === t.id));
      await AsyncStorage.setItem('tags', JSON.stringify(customTags));
    } catch (error) {
      console.error('Error saving tags:', error);
    }
  };

  const createTag = async (name: string, color: string): Promise<Tag> => {
    const newTag: Tag = {
      id: Date.now().toString() + Math.random(),
      name,
      color,
      createdAt: Date.now(),
    };
    
    const updated = [...tags, newTag];
    setTags(updated);
    await saveTags(updated);
    return newTag;
  };

  const deleteTag = async (id: string) => {
    const updated = tags.filter(t => t.id !== id);
    setTags(updated);
    await saveTags(updated);
  };

  const updateTag = async (id: string, name: string, color: string) => {
    const updated = tags.map(t => 
      t.id === id ? { ...t, name, color } : t
    );
    setTags(updated);
    await saveTags(updated);
  };

  return (
    <TagsContext.Provider value={{ tags, createTag, deleteTag, updateTag }}>
      {children}
    </TagsContext.Provider>
  );
}
