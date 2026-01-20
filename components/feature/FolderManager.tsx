import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Modal,
  TextInput,
  ScrollView,
  FlatList,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { theme } from '@/constants/theme';
import { useFolders } from '@/hooks/useFolders';
import { useAlert } from '@/template';

interface FolderManagerProps {
  visible: boolean;
  onClose: () => void;
  onDeleteFolder: (folderId: string) => void;
}

const FOLDER_ICONS = [
  'folder', 'work', 'school', 'home', 'favorite',
  'sports', 'fitness-center', 'restaurant', 'flight',
  'beach-access', 'code', 'brush', 'music-note',
  'movie', 'camera', 'book', 'lightbulb', 'star',
];

const FOLDER_COLORS = [
  '#FFD700', '#4A90E2', '#F39C12', '#E74C3C',
  '#9B59B6', '#1ABC9C', '#34495E', '#16A085',
];

export function FolderManager({ visible, onClose, onDeleteFolder }: FolderManagerProps) {
  const { folders, createFolder, updateFolder, deleteFolder } = useFolders();
  const { showAlert } = useAlert();

  const [showCreate, setShowCreate] = useState(false);
  const [editingFolder, setEditingFolder] = useState<any>(null);
  const [folderName, setFolderName] = useState('');
  const [selectedIcon, setSelectedIcon] = useState('folder');
  const [selectedColor, setSelectedColor] = useState(FOLDER_COLORS[0]);

  const handleCreateFolder = () => {
    if (!folderName.trim()) {
      showAlert('تنبيه', 'الرجاء إدخال اسم المجلد');
      return;
    }

    createFolder(folderName.trim(), selectedIcon, selectedColor);
    setFolderName('');
    setSelectedIcon('folder');
    setSelectedColor(FOLDER_COLORS[0]);
    setShowCreate(false);
    showAlert('تم', 'تم إنشاء المجلد بنجاح');
  };

  const handleEditFolder = (folder: any) => {
    setEditingFolder(folder);
    setFolderName(folder.name);
    setSelectedIcon(folder.icon);
    setSelectedColor(folder.color);
    setShowCreate(false);
  };

  const handleUpdateFolder = () => {
    if (!folderName.trim()) {
      showAlert('تنبيه', 'الرجاء إدخال اسم المجلد');
      return;
    }

    updateFolder(editingFolder.id, {
      name: folderName.trim(),
      icon: selectedIcon,
      color: selectedColor,
    });

    setEditingFolder(null);
    setFolderName('');
    setSelectedIcon('folder');
    setSelectedColor(FOLDER_COLORS[0]);
    showAlert('تم', 'تم تحديث المجلد بنجاح');
  };

  const handleDeleteFolder = (folderId: string) => {
    showAlert('حذف المجلد', 'هل أنت متأكد؟ سيتم نقل المجلد إلى سلة المحذوفات', [
      { text: 'إلغاء', style: 'cancel' },
      {
        text: 'حذف',
        style: 'destructive',
        onPress: () => {
          onDeleteFolder(folderId);
          deleteFolder(folderId);
          showAlert('تم', 'تم نقل المجلد إلى سلة المحذوفات');
        },
      },
    ]);
  };

  const cancelEdit = () => {
    setEditingFolder(null);
    setFolderName('');
    setSelectedIcon('folder');
    setSelectedColor(FOLDER_COLORS[0]);
  };

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <View style={styles.container}>
        <View style={styles.header}>
          <View style={styles.titleContainer}>
            <Pressable onPress={onClose} hitSlop={12}>
              <MaterialIcons name="arrow-back" size={24} color={theme.colors.text} />
            </Pressable>
            <MaterialIcons name="folder" size={28} color={theme.colors.primary} />
            <Text style={styles.title}>إدارة المجلدات</Text>
          </View>
        </View>

        <ScrollView style={styles.content}>
          {!showCreate && !editingFolder ? (
            <>
              <FlatList
                data={folders}
                scrollEnabled={false}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                  <View style={styles.folderItem}>
                    <View style={styles.folderInfo}>
                      <View style={[styles.folderIcon, { backgroundColor: item.color + '20' }]}>
                        <MaterialIcons name={item.icon as any} size={24} color={item.color} />
                      </View>
                      <Text style={styles.folderName}>{item.name}</Text>
                    </View>

                    <View style={styles.folderActions}>
                      <Pressable
                        onPress={() => handleEditFolder(item)}
                        style={styles.actionButton}
                        hitSlop={8}
                      >
                        <MaterialIcons name="edit" size={20} color={theme.colors.textSecondary} />
                      </Pressable>

                      <Pressable
                        onPress={() => handleDeleteFolder(item.id)}
                        style={styles.actionButton}
                        hitSlop={8}
                      >
                        <MaterialIcons name="delete" size={20} color={theme.colors.error} />
                      </Pressable>
                    </View>
                  </View>
                )}
              />

              <Pressable
                onPress={() => setShowCreate(true)}
                style={({ pressed }) => [
                  styles.createButton,
                  pressed && styles.createButtonPressed,
                ]}
              >
                <MaterialIcons name="add" size={20} color={theme.colors.primary} />
                <Text style={styles.createButtonText}>إنشاء مجلد جديد</Text>
              </Pressable>
            </>
          ) : (
            <View style={styles.createForm}>
              <Text style={styles.formTitle}>
                {editingFolder ? 'تعديل المجلد' : 'مجلد جديد'}
              </Text>

              <TextInput
                value={folderName}
                onChangeText={setFolderName}
                placeholder="اسم المجلد..."
                placeholderTextColor={theme.colors.textTertiary}
                style={styles.input}
                maxLength={30}
              />

              <Text style={styles.sectionLabel}>اختر أيقونة:</Text>
              <View style={styles.iconsGrid}>
                {FOLDER_ICONS.map((icon) => (
                  <Pressable
                    key={icon}
                    onPress={() => setSelectedIcon(icon)}
                    style={[
                      styles.iconOption,
                      selectedIcon === icon && styles.iconOptionSelected,
                    ]}
                  >
                    <MaterialIcons
                      name={icon as any}
                      size={28}
                      color={selectedIcon === icon ? theme.colors.primary : theme.colors.textSecondary}
                    />
                  </Pressable>
                ))}
              </View>

              <Text style={styles.sectionLabel}>اختر لون:</Text>
              <View style={styles.colorsGrid}>
                {FOLDER_COLORS.map((color) => (
                  <Pressable
                    key={color}
                    onPress={() => setSelectedColor(color)}
                    style={[
                      styles.colorOption,
                      { backgroundColor: color },
                      selectedColor === color && styles.colorOptionSelected,
                    ]}
                  >
                    {selectedColor === color && (
                      <MaterialIcons name="check" size={20} color="#fff" />
                    )}
                  </Pressable>
                ))}
              </View>

              <View style={styles.formActions}>
                <Pressable
                  onPress={() => {
                    if (editingFolder) {
                      cancelEdit();
                    } else {
                      setShowCreate(false);
                      setFolderName('');
                      setSelectedIcon('folder');
                      setSelectedColor(FOLDER_COLORS[0]);
                    }
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
                  onPress={editingFolder ? handleUpdateFolder : handleCreateFolder}
                  style={({ pressed }) => [
                    styles.formButton,
                    styles.confirmButton,
                    pressed && styles.formButtonPressed,
                  ]}
                >
                  <Text style={styles.confirmButtonText}>
                    {editingFolder ? 'تحديث' : 'إنشاء'}
                  </Text>
                </Pressable>
              </View>
            </View>
          )}
        </ScrollView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },

  header: {
    padding: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },

  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },

  title: {
    fontSize: theme.fontSize.xxl,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.text,
  },

  content: {
    flex: 1,
    padding: theme.spacing.md,
  },

  folderItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing.sm,
  },

  folderInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
    flex: 1,
  },

  folderIcon: {
    width: 48,
    height: 48,
    borderRadius: theme.borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },

  folderName: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.text,
    flex: 1,
  },

  folderActions: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },

  actionButton: {
    padding: theme.spacing.xs,
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
    marginTop: theme.spacing.lg,
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

  formTitle: {
    fontSize: theme.fontSize.xl,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
  },

  input: {
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    fontSize: theme.fontSize.md,
    color: theme.colors.text,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },

  sectionLabel: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.text,
    marginTop: theme.spacing.md,
  },

  iconsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
  },

  iconOption: {
    width: 56,
    height: 56,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },

  iconOptionSelected: {
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.primaryDark + '20',
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
    borderWidth: 2,
    borderColor: 'transparent',
  },

  colorOptionSelected: {
    borderWidth: 3,
    borderColor: theme.colors.text,
  },

  formActions: {
    flexDirection: 'row',
    gap: theme.spacing.md,
    marginTop: theme.spacing.xl,
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
    backgroundColor: theme.colors.surface,
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
