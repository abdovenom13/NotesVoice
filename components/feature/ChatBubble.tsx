import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { theme } from '@/constants/theme';
import { ChatMessage } from '@/services/chatService';

interface ChatBubbleProps {
  message: ChatMessage;
}

export function ChatBubble({ message }: ChatBubbleProps) {
  const isUser = message.role === 'user';

  return (
    <View style={[styles.container, isUser && styles.userContainer]}>
      <View style={[styles.bubble, isUser ? styles.userBubble : styles.aiBubble]}>
        {!isUser && (
          <View style={styles.aiHeader}>
            <MaterialIcons name="auto-awesome" size={16} color={theme.colors.primary} />
            <Text style={styles.aiLabel}>AI</Text>
          </View>
        )}
        <Text style={[styles.text, isUser && styles.userText]}>
          {message.content}
        </Text>
        <Text style={[styles.timestamp, isUser && styles.userTimestamp]}>
          {new Date(message.timestamp).toLocaleTimeString('ar-SA', {
            hour: '2-digit',
            minute: '2-digit',
          })}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    marginVertical: theme.spacing.xs,
    paddingHorizontal: theme.spacing.md,
  },

  userContainer: {
    justifyContent: 'flex-end',
  },

  bubble: {
    maxWidth: '80%',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.lg,
    ...theme.shadows.sm,
  },

  userBubble: {
    backgroundColor: theme.colors.primary,
    borderBottomRightRadius: 4,
  },

  aiBubble: {
    backgroundColor: theme.colors.surfaceLight,
    borderBottomLeftRadius: 4,
  },

  aiHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
    marginBottom: theme.spacing.xs,
  },

  aiLabel: {
    fontSize: theme.fontSize.xs,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.primary,
  },

  text: {
    fontSize: theme.fontSize.md,
    color: theme.colors.text,
    lineHeight: 22,
  },

  userText: {
    color: theme.colors.background,
  },

  timestamp: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.textTertiary,
    marginTop: theme.spacing.xs,
    textAlign: 'left',
  },

  userTimestamp: {
    color: 'rgba(0, 0, 0, 0.5)',
  },
});
