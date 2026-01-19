import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import * as DocumentPicker from 'expo-document-picker';
import { Platform } from 'react-native';
import { noteService, Note } from './noteService';
import type { Folder } from '@/contexts/FoldersContext';

interface AppData {
  version: string;
  exportDate: number;
  notes: Note[];
  folders: Folder[];
  settings?: any;
}

export const dataService = {
  async exportData(): Promise<{ success: boolean; error?: string }> {
    try {
      const notes = await noteService.getNotes();
      const foldersStr = localStorage.getItem('folders');
      const folders = foldersStr ? JSON.parse(foldersStr) : [];
      const settingsStr = localStorage.getItem('app-settings');
      const settings = settingsStr ? JSON.parse(settingsStr) : {};

      const data: AppData = {
        version: '1.0.0',
        exportDate: Date.now(),
        notes,
        folders,
        settings,
      };

      const jsonStr = JSON.stringify(data, null, 2);
      const fileName = `notes_backup_${new Date().toISOString().split('T')[0]}.json`;
      const fileUri = `${FileSystem.documentDirectory}${fileName}`;

      await FileSystem.writeAsStringAsync(fileUri, jsonStr, {
        encoding: FileSystem.EncodingType.UTF8,
      });

      const canShare = await Sharing.isAvailableAsync();
      if (canShare) {
        await Sharing.shareAsync(fileUri, {
          mimeType: 'application/json',
          dialogTitle: 'Export Notes Data',
          UTI: 'public.json',
        });
      }

      return { success: true };
    } catch (error) {
      console.error('Export error:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'فشل التصدير' 
      };
    }
  },

  async importData(): Promise<{ success: boolean; count?: number; error?: string }> {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'application/json',
        copyToCacheDirectory: true,
      });

      if (result.canceled || !result.assets || result.assets.length === 0) {
        return { success: false, error: 'تم الإلغاء' };
      }

      const fileUri = result.assets[0].uri;
      const content = await FileSystem.readAsStringAsync(fileUri, {
        encoding: FileSystem.EncodingType.UTF8,
      });

      const data: AppData = JSON.parse(content);

      if (!data.notes || !Array.isArray(data.notes)) {
        return { success: false, error: 'ملف غير صالح' };
      }

      // Save notes
      for (const note of data.notes) {
        await noteService.saveNote(note);
      }

      // Save folders if available
      if (data.folders && Array.isArray(data.folders)) {
        localStorage.setItem('folders', JSON.stringify(data.folders));
      }

      // Save settings if available
      if (data.settings) {
        const currentSettings = localStorage.getItem('app-settings');
        const currentSettingsObj = currentSettings ? JSON.parse(currentSettings) : {};
        localStorage.setItem('app-settings', JSON.stringify({
          ...currentSettingsObj,
          ...data.settings,
        }));
      }

      return { success: true, count: data.notes.length };
    } catch (error) {
      console.error('Import error:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'فشل الاستيراد' 
      };
    }
  },

  async shareNote(note: Note): Promise<{ success: boolean; error?: string }> {
    try {
      const canShare = await Sharing.isAvailableAsync();
      if (!canShare) {
        return { success: false, error: 'المشاركة غير متوفرة على هذا الجهاز' };
      }

      let content = `${note.title}\n\n${note.content}`;
      
      if (note.createdAt) {
        const date = new Date(note.createdAt).toLocaleDateString('ar-EG');
        content += `\n\n---\nتاريخ الإنشاء: ${date}`;
      }

      const fileName = `${note.title.replace(/[^a-zA-Z0-9\u0600-\u06FF]/g, '_')}.txt`;
      const fileUri = `${FileSystem.cacheDirectory}${fileName}`;

      await FileSystem.writeAsStringAsync(fileUri, content, {
        encoding: FileSystem.EncodingType.UTF8,
      });

      await Sharing.shareAsync(fileUri, {
        mimeType: 'text/plain',
        dialogTitle: 'Share Note',
      });

      return { success: true };
    } catch (error) {
      console.error('Share error:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'فشل المشاركة' 
      };
    }
  },

  async getStorageInfo(): Promise<{ used: string; available: string }> {
    try {
      const notes = await noteService.getNotes();
      const notesSize = JSON.stringify(notes).length;
      
      const folders = localStorage.getItem('folders') || '';
      const settings = localStorage.getItem('app-settings') || '';
      
      const totalBytes = notesSize + folders.length + settings.length;
      const usedMB = (totalBytes / (1024 * 1024)).toFixed(2);
      
      // Calculate approximate available space (100MB limit for localStorage)
      const limitMB = 100;
      const availableMB = (limitMB - parseFloat(usedMB)).toFixed(2);

      return {
        used: `${usedMB} MB`,
        available: `${availableMB} MB`,
      };
    } catch (error) {
      console.error('Storage info error:', error);
      return { used: 'N/A', available: 'N/A' };
    }
  },
};
