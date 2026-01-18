import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, Modal, TextInput, ScrollView } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { theme } from '@/constants/theme';
import { useFolders } from '@/hooks/useFolders';
import type { Folder } from '@/contexts/FoldersContext';

interface FolderPickerProps {
  visible: boolean;
  selectedFolderId?: string;
  onSelect: (folderId: string) => void;
  onClose: () => void;
}

const COLORS = ['#FFD700', '#4A90E2', '#F39C12', '#E74C3C', '#9B59B6', '#2ECC71', '#FF69B4', '#00CED1'];
const ICONS = ['folder', 'work', 'person', 'lightbulb', 'favorite', 'school', 'home', 'fitness_center'];

export function FolderPicker({ visible, selectedFolderId, onSelect, onClose }: FolderPickerProps) {
  const { folders, createFolder, deleteFolder } = useFolders();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [selectedIcon, setSelectedIcon] = useState('folder');
  const [selectedColor, setSelectedColor] = useState('#FFD700');

  const handleCreateFolder = () => {
    if (newFolderName.trim()) {
      createFolder(newFolderName.trim(), selectedIcon, selectedColor);
      setNewFolderName('');
      setShowCreateForm(false);
      setSelectedIcon('folder');
      setSelectedColor('#FFD700');
    }
  };

  const handleSelect = (folderId: string) => {
    onSelect(folderId);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <View style={styles.header}>
            <Text style={styles.title}>اختر المجلد</Text>
            <Pressable onPress={onClose} hitSlop={12}>
              <MaterialIcons name="close" size={24} color={theme.colors.text} />
            </Pressable>
          </View>

          <ScrollView style={styles.content}>
            {!showCreateForm ? (
              <>
                <View style={styles.foldersGrid}>
                  {folders.map((folder) => (
                    <Pressable
                      key={folder.id}
                      style={[
                        styles.folderCard,
                        selectedFolderId === folder.id && styles.folderCardActive,
                      ]}
                      onPress={() => handleSelect(folder.id)}
                      onLongPress={() => {
                        if (!['personal', 'work', 'ideas'].includes(folder.id)) {
                          deleteFolder(folder.id);
                        }
                      }}
                    >
                      <View style={[styles.iconContainer, { backgroundColor: folder.color + '20' }]}>
                        <MaterialIcons name={folder.icon as any} size={32} color={folder.color} />
                      </View>
                      <Text style={styles.folderName} numberOfLines={1}>{folder.name}</Text>
                      {selectedFolderId === folder.id && (
                        <View style={styles.checkBadge}>
                          <MaterialIcons name="check" size={16} color={theme.colors.background} />
                        </View>
                      )}
                    </Pressable>
                  ))}
                </View>

                <Pressable
                  style={styles.createButton}
                  onPress={() => setShowCreateForm(true)}
                >
                  <MaterialIcons name="add" size={24} color={theme.colors.primary} />
                  <Text style={styles.createButtonText}>إنشاء مجلد جديد</Text>
                </Pressable>
              </>
            ) : (
              <View style={styles.createForm}>
                <Text style={styles.formLabel}>اسم المجلد</Text>
                <TextInput
                  value={newFolderName}
                  onChangeText={setNewFolderName}
                  placeholder="اكتب اسم المجلد..."
                  placeholderTextColor={theme.colors.textTertiary}
                  style={styles.input}
                  autoFocus
                />

                <Text style={styles.formLabel}>الأيقونة</Text>
                <View style={styles.iconsGrid}>
                  {ICONS.map((icon) => (
                    <Pressable
                      key={icon}
                      style={[
                        styles.iconOption,
                        selectedIcon === icon && styles.iconOptionActive,
                      ]}
                      onPress={() => setSelectedIcon(icon)}
                    >
                      <MaterialIcons name={icon as any} size={24} color={theme.colors.text} />
                    </Pressable>
                  ))}
                </View>

                <Text style={styles.formLabel}>اللون</Text>
                <View style={styles.colorsGrid}>
                  {COLORS.map((color) => (
                    <Pressable
                      key={color}
                      style={[
                        styles.colorOption,
                        { backgroundColor: color },
                        selectedColor === color && styles.colorOptionActive,
                      ]}
                      onPress={() => setSelectedColor(color)}
                    >
                      {selectedColor === color && (
                        <MaterialIcons name="check" size={20} color="#fff" />
                      )}
                    </Pressable>
                  ))}
                </View>

                <View style={styles.formActions}>
                  <Pressable
                    style={[styles.formButton, styles.cancelButton]}
                    onPress={() => {
                      setShowCreateForm(false);
                      setNewFolderName('');
                    }}
                  >
                    <Text style={styles.cancelButtonText}>إلغاء</Text>
                  </Pressable>
                  <Pressable
                    style={[styles.formButton, styles.saveButton]}
                    onPress={handleCreateFolder}
                    disabled={!newFolderName.trim()}
                  >
                    <Text style={styles.saveButtonText}>إنشاء</Text>
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
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'flex-end',
  },
  
  modal: {
    backgroundColor: theme.colors.surface,
    borderTopLeftRadius: theme.borderRadius.xl,
    borderTopRightRadius: theme.borderRadius.xl,
    maxHeight: '80%',
  },
  
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  
  title: {
    fontSize: theme.fontSize.xl,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.text,
  },
  
  content: {
    padding: theme.spacing.md,
  },
  
  foldersGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.md,
  },
  
  folderCard: {
    width: '30%',
    aspectRatio: 1,
    backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.sm,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  
  folderCardActive: {
    borderColor: theme.colors.primary,
  },
  
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing.xs,
  },
  
  folderName: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.text,
    textAlign: 'center',
    fontWeight: theme.fontWeight.medium,
  },
  
  checkBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: theme.colors.primary,
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.sm,
    backgroundColor: 'rgba(255, 215, 0, 0.1)',
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    marginTop: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.primary,
    borderStyle: 'dashed',
  },
  
  createButtonText: {
    fontSize: theme.fontSize.md,
    color: theme.colors.primary,
    fontWeight: theme.fontWeight.medium,
  },
  
  createForm: {
    gap: theme.spacing.md,
  },
  
  formLabel: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  
  input: {
    backgroundColor: theme.colors.background,
    color: theme.colors.text,
    fontSize: theme.fontSize.md,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  
  iconsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
  },
  
  iconOption: {
    width: 48,
    height: 48,
    backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  
  iconOptionActive: {
    borderColor: theme.colors.primary,
  },
  
  colorsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
  },
  
  colorOption: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: 'transparent',
  },
  
  colorOptionActive: {
    borderColor: theme.colors.text,
  },
  
  formActions: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
    marginTop: theme.spacing.lg,
  },
  
  formButton: {
    flex: 1,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    alignItems: 'center',
  },
  
  cancelButton: {
    backgroundColor: theme.colors.background,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  
  cancelButtonText: {
    fontSize: theme.fontSize.md,
    color: theme.colors.text,
    fontWeight: theme.fontWeight.medium,
  },
  
  saveButton: {
    backgroundColor: theme.colors.primary,
  },
  
  saveButtonText: {
    fontSize: theme.fontSize.md,
    color: theme.colors.background,
    fontWeight: theme.fontWeight.semibold,
  },
});
