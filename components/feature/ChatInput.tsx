import React, { useState } from 'react';
import { View, TextInput, Pressable, StyleSheet, Platform } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { theme } from '@/constants/theme';

interface ChatInputProps {
  onSend: (message: string) => void;
  disabled?: boolean;
  placeholder?: string;
}

export function ChatInput({ onSend, disabled, placeholder = 'اكتب رسالتك...' }: ChatInputProps) {
  const [message, setMessage] = useState('');

  const handleSend = () => {
    if (message.trim() && !disabled) {
      onSend(message.trim());
      setMessage('');
    }
  };

  return (
    <View style={styles.container}>
      <TextInput
        value={message}
        onChangeText={setMessage}
        placeholder={placeholder}
        placeholderTextColor={theme.colors.textTertiary}
        style={styles.input}
        multiline
        maxLength={2000}
        editable={!disabled}
        onSubmitEditing={handleSend}
        blurOnSubmit={false}
      />
      <Pressable
        onPress={handleSend}
        disabled={!message.trim() || disabled}
        style={({ pressed }) => [
          styles.sendButton,
          (!message.trim() || disabled) && styles.sendButtonDisabled,
          pressed && styles.sendButtonPressed,
        ]}
        hitSlop={12}
      >
        <MaterialIcons
          name="send"
          size={24}
          color={message.trim() && !disabled ? theme.colors.primary : theme.colors.textTertiary}
        />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    backgroundColor: theme.colors.surface,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    gap: theme.spacing.sm,
  },

  input: {
    flex: 1,
    backgroundColor: theme.colors.surfaceLight,
    borderRadius: theme.borderRadius.lg,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: Platform.OS === 'ios' ? theme.spacing.sm : theme.spacing.xs,
    fontSize: theme.fontSize.md,
    color: theme.colors.text,
    maxHeight: 100,
    minHeight: 44,
  },

  sendButton: {
    width: 44,
    height: 44,
    borderRadius: theme.borderRadius.full,
    backgroundColor: 'rgba(255, 215, 0, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  sendButtonDisabled: {
    backgroundColor: 'transparent',
  },

  sendButtonPressed: {
    opacity: 0.7,
  },
});
