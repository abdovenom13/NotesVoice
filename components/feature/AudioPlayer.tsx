import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { theme } from '@/constants/theme';
import { audioService } from '@/services/audioService';

interface AudioPlayerProps {
  uri: string;
  duration: number;
  onRemove?: () => void;
  editable?: boolean;
}

export function AudioPlayer({ uri, duration, onRemove, editable = true }: AudioPlayerProps) {
  const [isPlaying, setIsPlaying] = React.useState(false);

  const handlePlay = async () => {
    try {
      if (isPlaying) {
        setIsPlaying(false);
        return;
      }

      const sound = await audioService.playAudio(uri);
      if (sound) {
        setIsPlaying(true);
        sound.setOnPlaybackStatusUpdate((status) => {
          if (status.isLoaded && status.didJustFinish) {
            setIsPlaying(false);
          }
        });
      }
    } catch (error) {
      console.error('Play error:', error);
      setIsPlaying(false);
    }
  };

  return (
    <View style={styles.container}>
      <Pressable
        onPress={handlePlay}
        style={({ pressed }) => [
          styles.playButton,
          pressed && styles.buttonPressed,
        ]}
      >
        <MaterialIcons
          name={isPlaying ? 'pause' : 'play-arrow'}
          size={32}
          color={theme.colors.primary}
        />
      </Pressable>
      
      <View style={styles.info}>
        <View style={styles.waveform}>
          {[...Array(20)].map((_, i) => (
            <View
              key={i}
              style={[
                styles.bar,
                { height: Math.random() * 24 + 8 },
              ]}
            />
          ))}
        </View>
        <Text style={styles.duration}>{audioService.formatDuration(duration)}</Text>
      </View>
      
      {editable && onRemove && (
        <Pressable
          onPress={onRemove}
          style={({ pressed }) => [
            styles.removeButton,
            pressed && styles.buttonPressed,
          ]}
        >
          <MaterialIcons name="delete" size={20} color={theme.colors.error} />
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.sm,
    gap: theme.spacing.sm,
  },
  
  playButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 215, 0, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  info: {
    flex: 1,
    gap: theme.spacing.xs,
  },
  
  waveform: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    height: 32,
  },
  
  bar: {
    width: 3,
    backgroundColor: theme.colors.primary,
    borderRadius: 1.5,
    opacity: 0.6,
  },
  
  duration: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.textSecondary,
    fontVariant: ['tabular-nums'],
  },
  
  removeButton: {
    padding: theme.spacing.sm,
  },
  
  buttonPressed: {
    opacity: 0.7,
  },
});
