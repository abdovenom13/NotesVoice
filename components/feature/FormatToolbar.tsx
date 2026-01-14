import React from 'react';
import { View, Pressable, StyleSheet, ScrollView } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { theme } from '@/constants/theme';

interface FormatToolbarProps {
  onFormat: (type: 'bold' | 'italic' | 'underline' | 'strikethrough') => void;
  onColorChange: (color: string) => void;
  activeFormats?: Set<string>;
}

export function FormatToolbar({ onFormat, onColorChange, activeFormats = new Set() }: FormatToolbarProps) {
  const formatButtons = [
    { type: 'bold' as const, icon: 'format-bold' },
    { type: 'italic' as const, icon: 'format-italic' },
    { type: 'underline' as const, icon: 'format-underlined' },
    { type: 'strikethrough' as const, icon: 'format-strikethrough' },
  ];

  const colors = [
    { color: theme.colors.formatRed, name: 'red' },
    { color: theme.colors.formatBlue, name: 'blue' },
    { color: theme.colors.formatGreen, name: 'green' },
    { color: theme.colors.formatYellow, name: 'yellow' },
    { color: theme.colors.formatPurple, name: 'purple' },
  ];

  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {formatButtons.map((btn) => (
          <Pressable
            key={btn.type}
            onPress={() => onFormat(btn.type)}
            style={({ pressed }) => [
              styles.button,
              activeFormats.has(btn.type) && styles.buttonActive,
              pressed && styles.buttonPressed,
            ]}
          >
            <MaterialIcons
              name={btn.icon as any}
              size={22}
              color={activeFormats.has(btn.type) ? theme.colors.primary : theme.colors.textSecondary}
            />
          </Pressable>
        ))}
        
        <View style={styles.divider} />
        
        {colors.map((c) => (
          <Pressable
            key={c.name}
            onPress={() => onColorChange(c.color)}
            style={({ pressed }) => [
              styles.colorButton,
              { backgroundColor: c.color },
              pressed && styles.buttonPressed,
            ]}
          />
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.surface,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  
  scrollContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    gap: theme.spacing.sm,
  },
  
  button: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: theme.borderRadius.sm,
    backgroundColor: 'transparent',
  },
  
  buttonActive: {
    backgroundColor: 'rgba(255, 215, 0, 0.2)',
  },
  
  buttonPressed: {
    opacity: 0.6,
  },
  
  divider: {
    width: 1,
    height: 24,
    backgroundColor: theme.colors.border,
    marginHorizontal: theme.spacing.xs,
  },
  
  colorButton: {
    width: 32,
    height: 32,
    borderRadius: theme.borderRadius.full,
    borderWidth: 2,
    borderColor: theme.colors.border,
  },
});
