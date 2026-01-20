import React, { createContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Note } from '@/services/noteService';
import { Folder } from './FoldersContext';

export interface TrashItem {
  id: string;
  type: 'note' | 'folder';
  data: Note | Folder;
  deletedAt: number;
  expiresAt: number; // 30 days from deletion
}

interface TrashContextType {
  trashItems: TrashItem[];
  moveToTrash: (type: 'note' | 'folder', data: Note | Folder) => void;
  restoreFromTrash: (id: string) => TrashItem | null;
  permanentDelete: (id: string) => void;
  emptyTrash: () => void;
  cleanupExpired: () => void;
}

export const TrashContext = createContext<TrashContextType | undefined>(undefined);

const TRASH_DURATION = 30 * 24 * 60 * 60 * 1000; // 30 days in milliseconds

export function TrashProvider({ children }: { children: ReactNode }) {
  const [trashItems, setTrashItems] = useState<TrashItem[]>([]);

  useEffect(() => {
    loadTrash();
    cleanupExpired();
  }, []);

  const loadTrash = async () => {
    try {
      const stored = await AsyncStorage.getItem('trash-items');
      if (stored) {
        const parsed = JSON.parse(stored);
        setTrashItems(parsed);
      }
    } catch (error) {
      console.error('Error loading trash:', error);
    }
  };

  const saveTrash = async (items: TrashItem[]) => {
    setTrashItems(items);
    try {
      await AsyncStorage.setItem('trash-items', JSON.stringify(items));
    } catch (error) {
      console.error('Error saving trash:', error);
    }
  };

  const moveToTrash = (type: 'note' | 'folder', data: Note | Folder) => {
    const trashItem: TrashItem = {
      id: `trash-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type,
      data,
      deletedAt: Date.now(),
      expiresAt: Date.now() + TRASH_DURATION,
    };

    saveTrash([...trashItems, trashItem]);
  };

  const restoreFromTrash = (id: string): TrashItem | null => {
    const item = trashItems.find(i => i.id === id);
    if (!item) return null;

    const filtered = trashItems.filter(i => i.id !== id);
    saveTrash(filtered);

    return item;
  };

  const permanentDelete = (id: string) => {
    const filtered = trashItems.filter(i => i.id !== id);
    saveTrash(filtered);
  };

  const emptyTrash = () => {
    saveTrash([]);
  };

  const cleanupExpired = () => {
    const now = Date.now();
    const filtered = trashItems.filter(item => item.expiresAt > now);
    
    if (filtered.length !== trashItems.length) {
      saveTrash(filtered);
    }
  };

  return (
    <TrashContext.Provider
      value={{
        trashItems,
        moveToTrash,
        restoreFromTrash,
        permanentDelete,
        emptyTrash,
        cleanupExpired,
      }}
    >
      {children}
    </TrashContext.Provider>
  );
}
