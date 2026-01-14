import React from 'react';
import { View, Text, Pressable, StyleSheet, ActivityIndicator, ScrollView } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { theme } from '@/constants/theme';

export interface AIMenuItem {
  id: string;
  label: string;
  icon: keyof typeof MaterialIcons.glyphMap;
  description: string;
}

interface AIMenuProps {
  visible: boolean;
  loading: boolean;
  onSelect: (itemId: string) => void;
  onClose: () => void;
}

const menuItems: AIMenuItem[] = [
  {
    id: 'improve',
    label: 'تحسين النص',
    icon: 'auto-fix-high',
    description: 'تصحيح الأخطاء وتحسين الصياغة',
  },
  {
    id: 'summarize',
    label: 'تلخيص',
    icon: 'summarize',
    description: 'اختصار النص بشكل موجز',
  },
  {
    id: 'generateTitle',
    label: 'توليد عنوان',
    icon: 'title',
    description: 'اقتراح عنوان مناسب',
  },
  {
    id: 'extractPoints',
    label: 'استخراج نقاط',
    icon: 'format-list-numbered',
    description: 'النقاط الرئيسية من النص',
  },
  {
    id: 'toList',
    label: 'تحويل لقائمة',
    icon: 'format-list-bulleted',
    description: 'تنظيم النص كقائمة',
  },
  {
    id: 'translateAr',
    label: 'ترجمة للعربية',
    icon: 'translate',
    description: 'ترجمة النص للعربية',
  },
  {
    id: 'translateEn',
    label: 'ترجمة للإنجليزية',
    icon: 'g-translate',
    description: 'ترجمة النص للإنجليزية',
  },
];

export function AIMenu({ visible, loading, onSelect, onClose }: AIMenuProps) {
  if (!visible) return null;

  return (
    <View style={styles.overlay}>
      <Pressable style={styles.backdrop} onPress={onClose} />
      <View style={styles.menuContainer}>
        <View style={styles.header}>
          <View style={styles.headerTitle}>
            <MaterialIcons name="auto-awesome" size={24} color={theme.colors.primary} />
            <Text style={styles.title}>مساعد الذكاء الاصطناعي</Text>
          </View>
          <Pressable onPress={onClose} hitSlop={12}>
            <MaterialIcons name="close" size={24} color={theme.colors.textSecondary} />
          </Pressable>
        </View>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={theme.colors.primary} />
            <Text style={styles.loadingText}>جاري المعالجة...</Text>
          </View>
        ) : (
          <ScrollView style={styles.menuScroll} showsVerticalScrollIndicator={false}>
            {menuItems.map((item) => (
              <Pressable
                key={item.id}
                style={({ pressed }) => [
                  styles.menuItem,
                  pressed && styles.menuItemPressed,
                ]}
                onPress={() => onSelect(item.id)}
              >
                <View style={styles.menuItemIcon}>
                  <MaterialIcons name={item.icon} size={24} color={theme.colors.primary} />
                </View>
                <View style={styles.menuItemContent}>
                  <Text style={styles.menuItemLabel}>{item.label}</Text>
                  <Text style={styles.menuItemDescription}>{item.description}</Text>
                </View>
                <MaterialIcons name="chevron-left" size={20} color={theme.colors.textTertiary} />
              </Pressable>
            ))}
          </ScrollView>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1000,
  },

  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },

  menuContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: theme.colors.surface,
    borderTopLeftRadius: theme.borderRadius.xl,
    borderTopRightRadius: theme.borderRadius.xl,
    maxHeight: '80%',
    ...theme.shadows.xl,
  },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },

  headerTitle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },

  title: {
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.text,
  },

  menuScroll: {
    maxHeight: 500,
  },

  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.md,
    gap: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },

  menuItemPressed: {
    backgroundColor: theme.colors.surfaceLight,
  },

  menuItemIcon: {
    width: 40,
    height: 40,
    borderRadius: theme.borderRadius.md,
    backgroundColor: 'rgba(255, 215, 0, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  menuItemContent: {
    flex: 1,
  },

  menuItemLabel: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.text,
    marginBottom: 2,
  },

  menuItemDescription: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
  },

  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.spacing.xxl * 2,
    gap: theme.spacing.md,
  },

  loadingText: {
    fontSize: theme.fontSize.md,
    color: theme.colors.textSecondary,
  },
});
