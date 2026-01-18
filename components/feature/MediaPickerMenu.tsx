import React from 'react';
import { View, Text, StyleSheet, Pressable, Modal } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { theme } from '@/constants/theme';

interface MediaPickerMenuProps {
  visible: boolean;
  onClose: () => void;
  onPickImage: () => void;
  onCaptureImage: () => void;
}

export function MediaPickerMenu({ visible, onClose, onPickImage, onCaptureImage }: MediaPickerMenuProps) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable style={styles.backdrop} onPress={onClose}>
        <View style={styles.menu}>
          <Text style={styles.menuTitle}>إضافة وسائط</Text>

          <Pressable
            style={styles.menuItem}
            onPress={() => {
              onClose();
              onPickImage();
            }}
          >
            <MaterialIcons name="photo-library" size={24} color={theme.colors.primary} />
            <Text style={styles.menuItemText}>اختيار من المعرض</Text>
          </Pressable>

          <Pressable
            style={styles.menuItem}
            onPress={() => {
              onClose();
              onCaptureImage();
            }}
          >
            <MaterialIcons name="camera-alt" size={24} color={theme.colors.primary} />
            <Text style={styles.menuItemText}>التقاط صورة</Text>
          </Pressable>

          <Pressable style={[styles.menuItem, styles.cancelItem]} onPress={onClose}>
            <MaterialIcons name="close" size={24} color={theme.colors.error} />
            <Text style={[styles.menuItemText, styles.cancelText]}>إلغاء</Text>
          </Pressable>
        </View>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.lg,
  },
  
  menu: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    ...theme.shadows.lg,
  },
  
  menuTitle: {
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.text,
    textAlign: 'center',
    marginBottom: theme.spacing.md,
  },
  
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.background,
    marginBottom: theme.spacing.sm,
  },
  
  menuItemText: {
    fontSize: theme.fontSize.md,
    color: theme.colors.text,
    fontWeight: theme.fontWeight.medium,
  },
  
  cancelItem: {
    marginTop: theme.spacing.sm,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
  },
  
  cancelText: {
    color: theme.colors.error,
  },
});
