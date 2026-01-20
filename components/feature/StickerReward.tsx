import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Modal } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { theme } from '@/constants/theme';
import { Sticker } from '@/contexts/GamificationContext';

interface StickerRewardProps {
  visible: boolean;
  sticker: Sticker | null;
  onClose: () => void;
}

const RARITY_COLORS = {
  common: '#95A5A6',
  rare: '#3498DB',
  epic: '#9B59B6',
  legendary: '#F39C12',
};

const RARITY_NAMES = {
  common: 'عادي',
  rare: 'نادر',
  epic: 'أسطوري',
  legendary: 'خرافي',
};

export function StickerReward({ visible, sticker, onClose }: StickerRewardProps) {
  const scale = useSharedValue(0);
  const rotation = useSharedValue(0);

  useEffect(() => {
    if (visible && sticker) {
      scale.value = withSequence(
        withSpring(1.2, { damping: 5 }),
        withSpring(1, { damping: 10 })
      );
      rotation.value = withSequence(
        withTiming(10, { duration: 100 }),
        withTiming(-10, { duration: 100 }),
        withTiming(10, { duration: 100 }),
        withTiming(0, { duration: 100 })
      );

      const timer = setTimeout(onClose, 3000);
      return () => clearTimeout(timer);
    } else {
      scale.value = 0;
    }
  }, [visible, sticker]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: scale.value },
      { rotate: `${rotation.value}deg` },
    ],
  }));

  if (!sticker) return null;

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <Animated.View style={[styles.container, animatedStyle]}>
          <View
            style={[
              styles.rarityBadge,
              { backgroundColor: RARITY_COLORS[sticker.rarity] },
            ]}
          >
            <Text style={styles.rarityText}>{RARITY_NAMES[sticker.rarity]}</Text>
          </View>

          <Text style={styles.emoji}>{sticker.emoji}</Text>
          <Text style={styles.title}>ملصق جديد!</Text>
          <Text style={styles.name}>{sticker.name}</Text>

          <View style={styles.confetti}>
            <MaterialIcons name="celebration" size={32} color={theme.colors.primary} />
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  container: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.xl,
    padding: theme.spacing.xxl,
    alignItems: 'center',
    minWidth: 280,
    ...theme.shadows.xl,
  },

  rarityBadge: {
    position: 'absolute',
    top: theme.spacing.md,
    right: theme.spacing.md,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.sm,
  },

  rarityText: {
    fontSize: theme.fontSize.xs,
    fontWeight: theme.fontWeight.bold,
    color: '#fff',
  },

  emoji: {
    fontSize: 80,
    marginBottom: theme.spacing.md,
  },

  title: {
    fontSize: theme.fontSize.xxl,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.primary,
    marginBottom: theme.spacing.sm,
  },

  name: {
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.medium,
    color: theme.colors.text,
  },

  confetti: {
    position: 'absolute',
    bottom: theme.spacing.md,
    right: theme.spacing.md,
  },
});
