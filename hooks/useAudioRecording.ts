import { useState, useCallback } from 'react';
import { audioService, AudioRecording } from '@/services/audioService';
import { Audio } from 'expo-av';

export function useAudioRecording() {
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [currentSound, setCurrentSound] = useState<Audio.Sound | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const startRecording = useCallback(async () => {
    try {
      await audioService.startRecording();
      setIsRecording(true);
      setIsPaused(false);
    } catch (error) {
      throw error;
    }
  }, []);

  const stopRecording = useCallback(async (): Promise<AudioRecording | null> => {
    try {
      const recording = await audioService.stopRecording();
      setIsRecording(false);
      setIsPaused(false);
      return recording;
    } catch (error) {
      setIsRecording(false);
      setIsPaused(false);
      throw error;
    }
  }, []);

  const pauseRecording = useCallback(async () => {
    try {
      await audioService.pauseRecording();
      setIsPaused(true);
    } catch (error) {
      throw error;
    }
  }, []);

  const resumeRecording = useCallback(async () => {
    try {
      await audioService.resumeRecording();
      setIsPaused(false);
    } catch (error) {
      throw error;
    }
  }, []);

  const playAudio = useCallback(async (uri: string) => {
    try {
      if (currentSound) {
        await currentSound.unloadAsync();
      }

      const sound = await audioService.playAudio(uri);
      if (sound) {
        setCurrentSound(sound);
        setIsPlaying(true);

        sound.setOnPlaybackStatusUpdate((status) => {
          if (status.isLoaded && status.didJustFinish) {
            setIsPlaying(false);
            setCurrentSound(null);
          }
        });
      }
    } catch (error) {
      setIsPlaying(false);
      throw error;
    }
  }, [currentSound]);

  const stopPlaying = useCallback(async () => {
    if (currentSound) {
      await currentSound.stopAsync();
      await currentSound.unloadAsync();
      setCurrentSound(null);
      setIsPlaying(false);
    }
  }, [currentSound]);

  return {
    isRecording,
    isPaused,
    isPlaying,
    startRecording,
    stopRecording,
    pauseRecording,
    resumeRecording,
    playAudio,
    stopPlaying,
  };
}
