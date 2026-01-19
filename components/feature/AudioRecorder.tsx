import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import Animated, { useAnimatedStyle, withRepeat, withTiming, useSharedValue } from 'react-native-reanimated';
import { theme } from '@/constants/theme';
import { useAudioRecording } from '@/hooks/useAudioRecording';
import { audioService } from '@/services/audioService';

interface AudioRecorderProps {
  onRecordingComplete: (uri: string, duration: number) => void;
  onError: (error: string) => void;
}

export function AudioRecorder({ onRecordingComplete, onError }: AudioRecorderProps) {
  const { isRecording, isPaused, startRecording, stopRecording, pauseRecording, resumeRecording } = useAudioRecording();
  const [duration, setDuration] = useState(0);
  const pulseAnim = useSharedValue(1);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isRecording && !isPaused) {
      pulseAnim.value = withRepeat(
        withTiming(1.3, { duration: 800 }),
        -1,
        true
      );
      
      interval = setInterval(() => {
        setDuration(prev => prev + 1);
      }, 1000);
    } else {
      pulseAnim.value = withTiming(1, { duration: 200 });
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRecording, isPaused]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseAnim.value }],
  }));

  const handleStartRecording = async () => {
    try {
      setDuration(0);
      await startRecording();
    } catch (error) {
      onError(error instanceof Error ? error.message : 'فشل بدء التسجيل');
    }
  };

  const handleStopRecording = async () => {
    try {
      const recording = await stopRecording();
      if (recording) {
        onRecordingComplete(recording.uri, recording.duration);
      }
      setDuration(0);
    } catch (error) {
      onError(error instanceof Error ? error.message : 'فشل إيقاف التسجيل');
    }
  };

  const handlePauseResume = async () => {
    try {
      if (isPaused) {
        await resumeRecording();
      } else {
        await pauseRecording();
      }
    } catch (error) {
      onError(error instanceof Error ? error.message : 'فشل في إيقاف/استئناف التسجيل');
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (!isRecording) {
    return (
      <Pressable
        onPress={handleStartRecording}
        style={({ pressed }) => [
          styles.startButton,
          pressed && styles.buttonPressed,
        ]}
      >
        <MaterialIcons name="mic" size={24} color={theme.colors.error} />
        <Text style={styles.startButtonText}>ابدأ تسجيل صوتي</Text>
      </Pressable>
    );
  }

  return (
    <View style={styles.recordingContainer}>
      <Animated.View style={[styles.recordingIndicator, animatedStyle]}>
        <MaterialIcons name="fiber-manual-record" size={20} color={theme.colors.error} />
      </Animated.View>
      
      <Text style={styles.durationText}>{formatTime(duration)}</Text>
      
      <View style={styles.controls}>
        <Pressable
          onPress={handlePauseResume}
          style={({ pressed }) => [
            styles.controlButton,
            pressed && styles.buttonPressed,
          ]}
        >
          <MaterialIcons
            name={isPaused ? 'play-arrow' : 'pause'}
            size={28}
            color={theme.colors.text}
          />
        </Pressable>
        
        <Pressable
          onPress={handleStopRecording}
          style={({ pressed }) => [
            styles.stopButton,
            pressed && styles.buttonPressed,
          ]}
        >
          <MaterialIcons name="stop" size={32} color={theme.colors.background} />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  startButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.error,
    borderStyle: 'dashed',
  },
  
  startButtonText: {
    fontSize: theme.fontSize.md,
    color: theme.colors.error,
    fontWeight: theme.fontWeight.medium,
  },
  
  recordingContainer: {
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.lg,
    borderRadius: theme.borderRadius.md,
    alignItems: 'center',
    gap: theme.spacing.md,
  },
  
  recordingIndicator: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(239, 68, 68, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  durationText: {
    fontSize: theme.fontSize.xxl,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.text,
    fontVariant: ['tabular-nums'],
  },
  
  controls: {
    flexDirection: 'row',
    gap: theme.spacing.md,
    marginTop: theme.spacing.sm,
  },
  
  controlButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: theme.colors.surfaceLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  stopButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: theme.colors.error,
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  buttonPressed: {
    opacity: 0.7,
  },
});
