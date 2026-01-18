import React, { createContext, useState, useEffect, ReactNode } from 'react';

export interface Folder {
  id: string;
  name: string;
  icon: string;
  color: string;
  createdAt: number;
}

interface FoldersContextType {
  folders: Folder[];
  createFolder: (name: string, icon?: string, color?: string) => Folder;
  updateFolder: (id: string, updates: Partial<Folder>) => void;
  deleteFolder: (id: string) => void;
}

export const FoldersContext = createContext<FoldersContextType | undefined>(undefined);

const DEFAULT_FOLDERS: Folder[] = [
  { id: 'personal', name: 'شخصي', icon: 'person', color: '#FFD700', createdAt: Date.now() },
  { id: 'work', name: 'عمل', icon: 'work', color: '#4A90E2', createdAt: Date.now() },
  { id: 'ideas', name: 'أفكار', icon: 'lightbulb', color: '#F39C12', createdAt: Date.now() },
];

export function FoldersProvider({ children }: { children: ReactNode }) {
  const [folders, setFolders] = useState<Folder[]>(DEFAULT_FOLDERS);

  useEffect(() => {
    loadFolders();
  }, []);

  const loadFolders = () => {
    try {
      const stored = localStorage.getItem('folders');
      if (stored) {
        setFolders(JSON.parse(stored));
      }
    } catch (error) {
      console.error('Error loading folders:', error);
    }
  };

  const saveFolders = (newFolders: Folder[]) => {
    setFolders(newFolders);
    localStorage.setItem('folders', JSON.stringify(newFolders));
  };

  const createFolder = (name: string, icon = 'folder', color = '#666666'): Folder => {
    const newFolder: Folder = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name,
      icon,
      color,
      createdAt: Date.now(),
    };
    saveFolders([...folders, newFolder]);
    return newFolder;
  };

  const updateFolder = (id: string, updates: Partial<Folder>) => {
    const updated = folders.map(f => 
      f.id === id ? { ...f, ...updates } : f
    );
    saveFolders(updated);
  };

  const deleteFolder = (id: string) => {
    const filtered = folders.filter(f => f.id !== id);
    saveFolders(filtered);
  };

  return (
    <FoldersContext.Provider value={{ folders, createFolder, updateFolder, deleteFolder }}>
      {children}
    </FoldersContext.Provider>
  );
}
