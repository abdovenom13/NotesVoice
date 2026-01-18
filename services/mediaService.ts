import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import { Platform } from 'react-native';

export interface MediaAttachment {
  id: string;
  uri: string;
  type: 'image' | 'video';
  name: string;
  size: number;
  createdAt: number;
}

export const mediaService = {
  async requestPermissions(): Promise<boolean> {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    return status === 'granted';
  },

  async pickImage(maxSize: number = 5): Promise<MediaAttachment | null> {
    const hasPermission = await this.requestPermissions();
    if (!hasPermission) {
      throw new Error('يجب السماح بالوصول إلى المعرض');
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.8,
      base64: false,
    });

    if (result.canceled) {
      return null;
    }

    const asset = result.assets[0];
    
    // Check file size
    const fileInfo = await FileSystem.getInfoAsync(asset.uri);
    if (fileInfo.exists && fileInfo.size) {
      const sizeMB = fileInfo.size / (1024 * 1024);
      if (sizeMB > maxSize) {
        throw new Error(`حجم الصورة يجب أن يكون أقل من ${maxSize}MB`);
      }
    }

    return {
      id: Date.now().toString() + Math.random(),
      uri: asset.uri,
      type: 'image',
      name: asset.fileName || `image_${Date.now()}.jpg`,
      size: fileInfo.exists && fileInfo.size ? fileInfo.size : 0,
      createdAt: Date.now(),
    };
  },

  async captureImage(maxSize: number = 5): Promise<MediaAttachment | null> {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      throw new Error('يجب السماح بالوصول إلى الكاميرا');
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      quality: 0.8,
    });

    if (result.canceled) {
      return null;
    }

    const asset = result.assets[0];
    
    const fileInfo = await FileSystem.getInfoAsync(asset.uri);
    if (fileInfo.exists && fileInfo.size) {
      const sizeMB = fileInfo.size / (1024 * 1024);
      if (sizeMB > maxSize) {
        throw new Error(`حجم الصورة يجب أن يكون أقل من ${maxSize}MB`);
      }
    }

    return {
      id: Date.now().toString() + Math.random(),
      uri: asset.uri,
      type: 'image',
      name: `photo_${Date.now()}.jpg`,
      size: fileInfo.exists && fileInfo.size ? fileInfo.size : 0,
      createdAt: Date.now(),
    };
  },

  async deleteMedia(attachment: MediaAttachment): Promise<void> {
    try {
      const fileInfo = await FileSystem.getInfoAsync(attachment.uri);
      if (fileInfo.exists) {
        await FileSystem.deleteAsync(attachment.uri);
      }
    } catch (error) {
      console.error('Error deleting media:', error);
    }
  },

  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  },
};
