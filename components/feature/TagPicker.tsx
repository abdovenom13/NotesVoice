import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, Modal, TextInput, ScrollView } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { theme } from '@/constants/theme';
import { useTags } from '@/hooks/useTags';
import { useAlert } from '@/template';

interface TagPickerProps {
  visible: boolean;
  selectedTagIds: string[];
  onSelect: (tagIds: string[]) => void;
  onClose: () => void;
}

const TAG_COLORS = [
  '#EF4444', '#F59E0B', '#10B981', '#3B82F6', 
  '#8B5CF6', '#EC4899', '#14B8A6', '#F97316',
];

export function TagPicker({ visible, selectedTagIds, onSelect, onClose }: TagPickerProps) {
  const { tags, createTag, deleteTag } = useTags();
  const { showAlert } = useAlert();
  const [showCreate, setShowCreate] = useState(false);
  const [newTagName, setNewTagName] = useState('');
  const [newTagColor, setNewTagColor] = useState(TAG_COLORS[0]);

  const handleToggleTag = (tagId: string) => {
    const updated = selectedTagIds.includes(tagId)
      ? selectedTagIds.filter(id => id !== tagId)
      : [...selectedTagIds, tagId];
    onSelect(updated);
  };

  const handleCreateTag = async () => {
    if (!newTagName.trim()) {
      showAlert('تنبيه', 'الرجاء إدخال اسم الوسم');
      return;
    }

    await createTag(newTagName.trim(), newTagColor);
    setNewTagName('');
    setNewTagColor(TAG_COLORS[0]);
    setShowCreate(false);
    showAlert('تم', 'تم إنشاء الوسم بنجاح');
  };

  const handleDeleteTag = (tagId: string) => {
    showAlert('حذف الوسم', 'هل أنت متأكد من حذف هذا الوسم؟', [
      { text: 'إلغاء', style: 'cancel' },
      {
        text: 'حذف',
        style: 'destructive',
        onPress: () => {
          deleteTag(tagId);
          onSelect(selectedTagIds.filter(id => id !== tagId));
        },
      },
    ]);
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <Pressable style={styles.backdrop} onPress={onClose} />
        
        <View style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.title}>الوسوم</Text>
            <Pressable onPress={onClose} hitSlop={12}>
              <MaterialIcons name="close" size={24} color={theme.colors.textSecondary} />
            </Pressable>
          </View>

          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            {!showCreate ? (
              <>
                <View style={styles.tagsGrid}>
                  {tags.map((tag) => {
                    const isSelected = selectedTagIds.includes(tag.id);
                    const isPreset = ['work', 'personal', 'ideas', 'important', 'study'].includes(tag.id);
                    
                    return (
                      <Pressable
                        key={tag.id}
                        onPress={() => handleToggleTag(tag.id)}
                        onLongPress={() => !isPreset && handleDeleteTag(tag.id)}
                        style={[
                          styles.tag,
                          { borderColor: tag.color },
                          isSelected && { backgroundColor: tag.color + '20' },
                        ]}
                      >
                        <View style={[styles.tagDot, { backgroundColor: tag.color }]} />
                        <Text style={[styles.tagText, isSelected && { color: tag.color }]}>
                          {tag.name}
                        </Text>
                        {isSelected && (
                          <MaterialIcons name="check" size={16} color={tag.color} />
                        )}
                      </Pressable>
                    );
                  })}
                </View>

                <Pressable
                  onPress={() => setShowCreate(true)}
                  style={({ pressed }) => [
                    styles.createButton,
                    pressed && styles.createButtonPressed,
                  ]}
                >
                  <MaterialIcons name="add" size={20} color={theme.colors.primary} />
                  <Text style={styles.createButtonText}>إنشاء وسم جديد</Text>
                </Pressable>
              </>
            ) : (
              <View style={styles.createForm}>
                <TextInput
                  value={newTagName}
                  onChangeText={setNewTagName}
                  placeholder="اسم الوسم..."
                  placeholderTextColor={theme.colors.textTertiary}
                  style={styles.input}
                  maxLength={20}
                />

                <Text style={styles.colorLabel}>اختر اللون:</Text>
                <View style={styles.colorsGrid}>
                  {TAG_COLORS.map((color) => (
                    <Pressable
                      key={color}
                      onPress={() => setNewTagColor(color)}
                      style={[
                        styles.colorOption,
                        { backgroundColor: color },
                        newTagColor === color && styles.colorOptionSelected,
                      ]}
                    >
                      {newTagColor === color && (
                        <MaterialIcons name="check" size={20} color="#fff" />
                      )}
                    </Pressable>
                  ))}
                </View>

                <View style={styles.formActions}>
                  <Pressable
                    onPress={() => {
                      setShowCreate(false);
                      setNewTagName('');
                      setNewTagColor(TAG_COLORS[0]);
                    }}
                    style={({ pressed }) => [
                      styles.formButton,
                      styles.cancelButton,
                      pressed && styles.formButtonPressed,
                    ]}
                  >
                    <Text style={styles.cancelButtonText}>إلغاء</Text>
                  </Pressable>

                  <Pressable
                    onPress={handleCreateTag}
                    style={({ pressed }) => [
                      styles.formButton,
                      styles.confirmButton,
                      pressed && styles.formButtonPressed,
                    ]}
                  >
                    <Text style={styles.confirmButtonText}>إنشاء</Text>
                  </Pressable>
                </View>
              </View>
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  
  container: {
    backgroundColor: theme.colors.surface,
    borderTopLeftRadius: theme.borderRadius.xl,
    borderTopRightRadius: theme.borderRadius.xl,
    maxHeight: '80%',
  },
  
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: theme.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  
  title: {
    fontSize: theme.fontSize.xl,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.text,
  },
  
  content: {
    padding: theme.spacing.lg,
  },
  
  tagsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.lg,
  },
  
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
    backgroundColor: theme.colors.background,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.full,
    borderWidth: 1.5,
  },
  
  tagDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  
  tagText: {
    fontSize: theme.fontSize.sm,
    fontWeight: theme.fontWeight.medium,
    color: theme.colors.text,
  },
  
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.sm,
    backgroundColor: 'rgba(255, 215, 0, 0.1)',
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.primary,
    borderStyle: 'dashed',
  },
  
  createButtonPressed: {
    opacity: 0.7,
  },
  
  createButtonText: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.medium,
    color: theme.colors.primary,
  },
  
  createForm: {
    gap: theme.spacing.md,
  },
  
  input: {
    backgroundColor: theme.colors.background,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    fontSize: theme.fontSize.md,
    color: theme.colors.text,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  
  colorLabel: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.medium,
    color: theme.colors.text,
    marginTop: theme.spacing.sm,
  },
  
  colorsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.md,
  },
  
  colorOption: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  colorOptionSelected: {
    borderWidth: 3,
    borderColor: theme.colors.text,
  },
  
  formActions: {
    flexDirection: 'row',
    gap: theme.spacing.md,
    marginTop: theme.spacing.lg,
  },
  
  formButton: {
    flex: 1,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    alignItems: 'center',
  },
  
  formButtonPressed: {
    opacity: 0.7,
  },
  
  cancelButton: {
    backgroundColor: theme.colors.background,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  
  cancelButtonText: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.medium,
    color: theme.colors.textSecondary,
  },
  
  confirmButton: {
    backgroundColor: theme.colors.primary,
  },
  
  confirmButtonText: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.background,
  },
});
