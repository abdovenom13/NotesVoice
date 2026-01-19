import { Audio } from 'expo-av';
import * as FileSystem from 'expo-file-system';

export interface AudioRecording {
  id: string;
  uri: string;
  duration: number;
  size: number;
  createdAt: number;
}

export const audioService = {
  recording: null as Audio.Recording | null,
  
  async requestPermissions(): Promise<boolean> {
    try {
      const { status } = await Audio.requestPermissionsAsync();
      return status === 'granted';
    } catch (error) {
      console.error('Permission error:', error);
      return false;
    }
  },

  async startRecording(): Promise<void> {
    try {
      const hasPermission = await this.requestPermissions();
      if (!hasPermission) {
        throw new Error('يجب السماح بالوصول إلى الميكروفون');
      }

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      
      this.recording = recording;
    } catch (error) {
      console.error('Start recording error:', error);
      throw error;
    }
  },

  async stopRecording(): Promise<AudioRecording | null> {
    try {
      if (!this.recording) {
        return null;
      }

      await this.recording.stopAndUnloadAsync();
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
      });

      const uri = this.recording.getURI();
      const status = await this.recording.getStatusAsync();
      
      if (!uri) {
        this.recording = null;
        return null;
      }

      const fileInfo = await FileSystem.getInfoAsync(uri);
      
      const audioRecording: AudioRecording = {
        id: Date.now().toString() + Math.random(),
        uri,
        duration: status.durationMillis || 0,
        size: fileInfo.exists && fileInfo.size ? fileInfo.size : 0,
        createdAt: Date.now(),
      };

      this.recording = null;
      return audioRecording;
    } catch (error) {
      console.error('Stop recording error:', error);
      this.recording = null;
      return null;
    }
  },

  async pauseRecording(): Promise<void> {
    try {
      if (this.recording) {
        await this.recording.pauseAsync();
      }
    } catch (error) {
      console.error('Pause recording error:', error);
    }
  },

  async resumeRecording(): Promise<void> {
    try {
      if (this.recording) {
        await this.recording.startAsync();
      }
    } catch (error) {
      console.error('Resume recording error:', error);
    }
  },

  async playAudio(uri: string): Promise<Audio.Sound | null> {
    try {
      const { sound } = await Audio.Sound.createAsync(
        { uri },
        { shouldPlay: true }
      );
      return sound;
    } catch (error) {
      console.error('Play audio error:', error);
      return null;
    }
  },

  async deleteAudio(uri: string): Promise<void> {
    try {
      const fileInfo = await FileSystem.getInfoAsync(uri);
      if (fileInfo.exists) {
        await FileSystem.deleteAsync(uri);
      }
    } catch (error) {
      console.error('Delete audio error:', error);
    }
  },

  formatDuration(milliseconds: number): string {
    const totalSeconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  },
};
