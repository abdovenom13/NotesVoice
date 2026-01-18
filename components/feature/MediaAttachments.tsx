import React from 'react';
import { View, Text, StyleSheet, Pressable, Image, Alert } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { theme } from '@/constants/theme';
import type { MediaAttachment } from '@/services/noteService';
import { mediaService } from '@/services/mediaService';

interface MediaAttachmentsProps {
  attachments: MediaAttachment[];
  onRemove: (id: string) => void;
  editable?: boolean;
}

export function MediaAttachments({ attachments, onRemove, editable = true }: MediaAttachmentsProps) {
  const handleRemove = (attachment: MediaAttachment) => {
    Alert.alert(
      'حذف المرفق',
      'هل أنت متأكد من حذف هذا المرفق؟',
      [
        { text: 'إلغاء', style: 'cancel' },
        {
          text: 'حذف',
          style: 'destructive',
          onPress: () => onRemove(attachment.id),
        },
      ]
    );
  };

  if (attachments.length === 0) {
    return null;
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <MaterialIcons name="attachment" size={20} color={theme.colors.textSecondary} />
        <Text style={styles.headerText}>المرفقات ({attachments.length})</Text>
      </View>

      <View style={styles.grid}>
        {attachments.map((attachment) => (
          <View key={attachment.id} style={styles.attachmentCard}>
            <Image source={{ uri: attachment.uri }} style={styles.image} resizeMode="cover" />
            
            <View style={styles.overlay}>
              <Text style={styles.imageName} numberOfLines={1}>
                {attachment.name}
              </Text>
              <Text style={styles.imageSize}>
                {mediaService.formatFileSize(attachment.size)}
              </Text>
            </View>

            {editable && (
              <Pressable
                style={styles.removeButton}
                onPress={() => handleRemove(attachment)}
              >
                <MaterialIcons name="close" size={18} color={theme.colors.text} />
              </Pressable>
            )}
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: theme.spacing.md,
  },
  
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
    marginBottom: theme.spacing.sm,
  },
  
  headerText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
    fontWeight: theme.fontWeight.medium,
  },
  
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
  },
  
  attachmentCard: {
    width: '48%',
    aspectRatio: 1,
    borderRadius: theme.borderRadius.md,
    overflow: 'hidden',
    backgroundColor: theme.colors.surface,
  },
  
  image: {
    width: '100%',
    height: '100%',
  },
  
  overlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    padding: theme.spacing.xs,
  },
  
  imageName: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.text,
    fontWeight: theme.fontWeight.medium,
  },
  
  imageSize: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
  
  removeButton: {
    position: 'absolute',
    top: theme.spacing.xs,
    right: theme.spacing.xs,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    borderRadius: 12,
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
