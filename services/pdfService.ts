import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import { Platform } from 'react-native';

export interface PDFAttachment {
  id: string;
  uri: string;
  name: string;
  size: number;
  pageCount?: number;
  createdAt: number;
}

export const pdfService = {
  async pickPDF(): Promise<PDFAttachment | null> {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'application/pdf',
        copyToCacheDirectory: true,
      });

      if (result.canceled || !result.assets || result.assets.length === 0) {
        return null;
      }

      const file = result.assets[0];
      
      const pdfAttachment: PDFAttachment = {
        id: Date.now().toString() + Math.random(),
        uri: file.uri,
        name: file.name,
        size: file.size || 0,
        createdAt: Date.now(),
      };

      return pdfAttachment;
    } catch (error) {
      console.error('Error picking PDF:', error);
      throw new Error('فشل اختيار ملف PDF');
    }
  },

  async deletePDF(uri: string): Promise<void> {
    try {
      if (Platform.OS !== 'web') {
        const fileInfo = await FileSystem.getInfoAsync(uri);
        if (fileInfo.exists) {
          await FileSystem.deleteAsync(uri, { idempotent: true });
        }
      }
    } catch (error) {
      console.error('Error deleting PDF:', error);
    }
  },

  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  },
};
