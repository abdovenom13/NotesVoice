import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Pressable, Vibration } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { useAnimatedStyle, withSequence, withTiming, useSharedValue } from 'react-native-reanimated';
import { theme } from '@/constants/theme';
import { useSecurity } from '@/hooks/useSecurity';

const PATTERN_SIZE = 3;
const DOT_SIZE = 20;
const DOT_SPACING = 80;

export function LockScreen() {
  const { settings, authenticate } = useSecurity();
  const [pattern, setPattern] = useState<number[]>([]);
  const [error, setError] = useState(false);
  const shakeAnim = useSharedValue(0);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: shakeAnim.value }],
  }));

  useEffect(() => {
    if (settings.method === 'biometric') {
      handleBiometricAuth();
    }
  }, []);

  const handleBiometricAuth = async () => {
    const success = await authenticate();
    if (!success) {
      setError(true);
    }
  };

  const handlePatternDot = (index: number) => {
    if (pattern.includes(index)) return;
    
    const newPattern = [...pattern, index];
    setPattern(newPattern);
    
    if (newPattern.length >= 4) {
      verifyPattern(newPattern.join(''));
    }
  };

  const verifyPattern = async (inputPattern: string) => {
    const success = await authenticate(inputPattern);
    
    if (!success) {
      Vibration.vibrate([0, 50, 100, 50]);
      shakeAnim.value = withSequence(
        withTiming(-10, { duration: 50 }),
        withTiming(10, { duration: 50 }),
        withTiming(-10, { duration: 50 }),
        withTiming(10, { duration: 50 }),
        withTiming(0, { duration: 50 })
      );
      setError(true);
      setTimeout(() => {
        setPattern([]);
        setError(false);
      }, 500);
    }
  };

  const resetPattern = () => {
    setPattern([]);
    setError(false);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <LinearGradient colors={['#1a1a1a', '#0a0a0a']} style={styles.gradient}>
        <View style={styles.header}>
          <MaterialIcons name="lock" size={64} color={theme.colors.primary} />
          <Text style={styles.title}>التطبيق مقفل</Text>
          <Text style={styles.subtitle}>
            {settings.method === 'biometric'
              ? 'استخدم البصمة أو التعرف على الوجه'
              : 'ارسم النمط للفتح'}
          </Text>
        </View>

        {settings.method === 'pattern' && (
          <Animated.View style={[styles.patternContainer, animatedStyle]}>
            <View style={styles.patternGrid}>
              {Array.from({ length: PATTERN_SIZE * PATTERN_SIZE }).map((_, index) => {
                const isSelected = pattern.includes(index);
                const order = pattern.indexOf(index);
                
                return (
                  <Pressable
                    key={index}
                    onPress={() => handlePatternDot(index)}
                    style={styles.dotWrapper}
                  >
                    <View
                      style={[
                        styles.dot,
                        isSelected && styles.dotSelected,
                        error && isSelected && styles.dotError,
                      ]}
                    >
                      {isSelected && (
                        <Text style={styles.dotNumber}>{order + 1}</Text>
                      )}
                    </View>
                  </Pressable>
                );
              })}
            </View>
            
            {pattern.length > 0 && (
              <Pressable onPress={resetPattern} style={styles.resetButton}>
                <MaterialIcons name="refresh" size={24} color={theme.colors.textSecondary} />
                <Text style={styles.resetText}>إعادة المحاولة</Text>
              </Pressable>
            )}
          </Animated.View>
        )}

        {settings.method === 'biometric' && (
          <View style={styles.biometricContainer}>
            <Pressable
              onPress={handleBiometricAuth}
              style={({ pressed }) => [
                styles.biometricButton,
                pressed && styles.biometricButtonPressed,
              ]}
            >
              <MaterialIcons name="fingerprint" size={80} color={theme.colors.primary} />
            </Pressable>
            <Text style={styles.biometricText}>اضغط للمصادقة</Text>
          </View>
        )}
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  
  gradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.xl,
  },
  
  header: {
    alignItems: 'center',
    marginBottom: theme.spacing.xxl * 2,
  },
  
  title: {
    fontSize: theme.fontSize.xxxl,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.text,
    marginTop: theme.spacing.lg,
  },
  
  subtitle: {
    fontSize: theme.fontSize.md,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.sm,
    textAlign: 'center',
  },
  
  patternContainer: {
    alignItems: 'center',
  },
  
  patternGrid: {
    width: DOT_SPACING * PATTERN_SIZE,
    height: DOT_SPACING * PATTERN_SIZE,
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  
  dotWrapper: {
    width: DOT_SPACING,
    height: DOT_SPACING,
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  dot: {
    width: DOT_SIZE,
    height: DOT_SIZE,
    borderRadius: DOT_SIZE / 2,
    backgroundColor: theme.colors.surface,
    borderWidth: 2,
    borderColor: theme.colors.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  dotSelected: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
    transform: [{ scale: 1.5 }],
  },
  
  dotError: {
    backgroundColor: theme.colors.error,
    borderColor: theme.colors.error,
  },
  
  dotNumber: {
    fontSize: theme.fontSize.xs,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.background,
  },
  
  resetButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    marginTop: theme.spacing.xxl,
    padding: theme.spacing.md,
  },
  
  resetText: {
    fontSize: theme.fontSize.md,
    color: theme.colors.textSecondary,
  },
  
  biometricContainer: {
    alignItems: 'center',
  },
  
  biometricButton: {
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: theme.colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: theme.colors.primary,
  },
  
  biometricButtonPressed: {
    opacity: 0.7,
    transform: [{ scale: 0.95 }],
  },
  
  biometricText: {
    fontSize: theme.fontSize.lg,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.xl,
  },
});
