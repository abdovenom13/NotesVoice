import React from 'react';
import { Pressable, Text, StyleSheet, ViewStyle, TextStyle, ActivityIndicator } from 'react-native';
import { theme } from '@/constants/theme';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  icon?: React.ReactNode;
}

export function Button({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  loading = false,
  style,
  textStyle,
  icon,
}: ButtonProps) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      style={({ pressed }) => [
        styles.base,
        styles[variant],
        styles[size],
        pressed && styles.pressed,
        (disabled || loading) && styles.disabled,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'primary' ? theme.colors.background : theme.colors.primary} />
      ) : (
        <>
          {icon}
          <Text style={[styles.text, styles[`${variant}Text`], styles[`${size}Text`], textStyle]}>
            {title}
          </Text>
        </>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: theme.borderRadius.md,
    gap: theme.spacing.sm,
  },
  
  primary: {
    backgroundColor: theme.colors.primary,
  },
  
  secondary: {
    backgroundColor: theme.colors.surface,
  },
  
  outline: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  
  ghost: {
    backgroundColor: 'transparent',
  },
  
  small: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    minHeight: 36,
  },
  
  medium: {
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    minHeight: 44,
  },
  
  large: {
    paddingHorizontal: theme.spacing.xl,
    paddingVertical: theme.spacing.lg,
    minHeight: 52,
  },
  
  pressed: {
    opacity: 0.7,
    transform: [{ scale: 0.98 }],
  },
  
  disabled: {
    opacity: 0.5,
  },
  
  text: {
    fontWeight: theme.fontWeight.semibold,
  },
  
  primaryText: {
    color: theme.colors.background,
  },
  
  secondaryText: {
    color: theme.colors.text,
  },
  
  outlineText: {
    color: theme.colors.text,
  },
  
  ghostText: {
    color: theme.colors.primary,
  },
  
  smallText: {
    fontSize: theme.fontSize.sm,
  },
  
  mediumText: {
    fontSize: theme.fontSize.md,
  },
  
  largeText: {
    fontSize: theme.fontSize.lg,
  },
});
