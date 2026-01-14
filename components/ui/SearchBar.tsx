import React from 'react';
import { View, TextInput, StyleSheet, I18nManager } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { theme } from '@/constants/theme';

interface SearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
}

export function SearchBar({ value, onChangeText, placeholder = 'ابحث...' }: SearchBarProps) {
  return (
    <View style={styles.container}>
      <MaterialIcons name="search" size={20} color={theme.colors.textTertiary} style={styles.icon} />
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={theme.colors.textTertiary}
        style={styles.input}
      />
      {value.length > 0 && (
        <MaterialIcons
          name="close"
          size={20}
          color={theme.colors.textTertiary}
          onPress={() => onChangeText('')}
          style={styles.clearIcon}
        />
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
    paddingHorizontal: theme.spacing.md,
    height: 48,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  
  icon: {
    marginRight: theme.spacing.sm,
  },
  
  input: {
    flex: 1,
    color: theme.colors.text,
    fontSize: theme.fontSize.md,
    textAlign: I18nManager.isRTL ? 'right' : 'left',
  },
  
  clearIcon: {
    marginLeft: theme.spacing.sm,
    padding: theme.spacing.xs,
  },
});
