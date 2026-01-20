import React from 'react';
import { View, Text, Pressable, StyleSheet, I18nManager } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { theme } from '@/constants/theme';
import { Note } from '@/services/noteService';

interface NoteCardProps {
  note: Note;
  onPress: () => void;
  onToggleFavorite: () => void;
}

export function NoteCard({ note, onPress, onToggleFavorite }: NoteCardProps) {
  const preview = note.content.substring(0, 100);
  const date = new Date(note.updatedAt).toLocaleDateString('ar-SA', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
  
  const wordCount = note.content.trim() ? note.content.trim().split(/\s+/).length : 0;
  const charCount = note.content.length;

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.container,
        pressed && styles.pressed,
        note.isFavorite && styles.favorite,
      ]}
    >
      <View style={styles.header}>
        <Text style={styles.title} numberOfLines={1}>
          {note.title || 'ملاحظة بدون عنوان'}
        </Text>
        <Pressable
          onPress={onToggleFavorite}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          style={styles.favoriteButton}
        >
          <MaterialIcons
            name={note.isFavorite ? 'star' : 'star-border'}
            size={24}
            color={note.isFavorite ? theme.colors.primary : theme.colors.textSecondary}
          />
        </Pressable>
      </View>
      
      {preview.length > 0 && (
        <Text style={styles.preview} numberOfLines={3}>
          {preview}{note.content.length > 100 ? '...' : ''}
        </Text>
      )}
      
      <View style={styles.footer}>
        <View style={styles.statsRow}>
          <View style={styles.stat}>
            <MaterialIcons name="article" size={14} color={theme.colors.textTertiary} />
            <Text style={styles.statText}>{wordCount}</Text>
          </View>
          <View style={styles.stat}>
            <MaterialIcons name="text-fields" size={14} color={theme.colors.textTertiary} />
            <Text style={styles.statText}>{charCount}</Text>
          </View>
          <Text style={styles.date}>{date}</Text>
        </View>
        {note.isFavorite && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>مفضلة</Text>
          </View>
        )}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    ...theme.shadows.sm,
  },
  
  pressed: {
    opacity: 0.8,
    transform: [{ scale: 0.98 }],
  },
  
  favorite: {
    borderColor: theme.colors.primary,
    borderWidth: 1.5,
  },
  
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  
  title: {
    flex: 1,
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.text,
    textAlign: I18nManager.isRTL ? 'right' : 'left',
  },
  
  favoriteButton: {
    padding: theme.spacing.xs,
    marginLeft: theme.spacing.sm,
  },
  
  preview: {
    fontSize: theme.fontSize.md,
    color: theme.colors.textSecondary,
    lineHeight: 22,
    marginBottom: theme.spacing.sm,
    textAlign: I18nManager.isRTL ? 'right' : 'left',
  },
  
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    flex: 1,
  },
  
  stat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  
  statText: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.textTertiary,
    fontWeight: theme.fontWeight.medium,
  },
  
  date: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textTertiary,
  },
  
  badge: {
    backgroundColor: 'rgba(255, 215, 0, 0.2)',
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.sm,
  },
  
  badgeText: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.primary,
    fontWeight: theme.fontWeight.medium,
  },
});
