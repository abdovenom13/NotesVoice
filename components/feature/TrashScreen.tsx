import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Pressable,
  Modal,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { theme } from '@/constants/theme';
import { useTrash } from '@/hooks/useTrash';
import { useAlert } from '@/template';
import { useTranslation } from '@/hooks/useTranslation';

interface TrashScreenProps {
  visible: boolean;
  onClose: () => void;
  onRestore: (type: 'note' | 'folder', data: any) => void;
}

export function TrashScreen({ visible, onClose, onRestore }: TrashScreenProps) {
  const { trashItems, restoreFromTrash, permanentDelete, emptyTrash } = useTrash();
  const { showAlert } = useAlert();
  const { t } = useTranslation();

  const handleRestore = (id: string) => {
    const item = restoreFromTrash(id);
    if (item) {
      onRestore(item.type, item.data);
      showAlert('تم', 'تمت الاستعادة بنجاح');
    }
  };

  const handlePermanentDelete = (id: string) => {
    showAlert('حذف نهائي', 'هل أنت متأكد؟ لا يمكن التراجع عن هذا الإجراء', [
      { text: 'إلغاء', style: 'cancel' },
      {
        text: 'حذف',
        style: 'destructive',
        onPress: () => {
          permanentDelete(id);
          showAlert('تم', 'تم الحذف نهائياً');
        },
      },
    ]);
  };

  const handleEmptyTrash = () => {
    if (trashItems.length === 0) {
      showAlert('تنبيه', 'سلة المحذوفات فارغة');
      return;
    }

    showAlert('إفراغ السلة', 'حذف جميع العناصر نهائياً؟', [
      { text: 'إلغاء', style: 'cancel' },
      {
        text: 'إفراغ',
        style: 'destructive',
        onPress: () => {
          emptyTrash();
          showAlert('تم', 'تم إفراغ سلة المحذوفات');
        },
      },
    ]);
  };

  const getDaysRemaining = (expiresAt: number): number => {
    const diff = expiresAt - Date.now();
    return Math.max(0, Math.ceil(diff / (24 * 60 * 60 * 1000)));
  };

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <View style={styles.container}>
        <View style={styles.header}>
          <View style={styles.titleContainer}>
            <Pressable onPress={onClose} hitSlop={12}>
              <MaterialIcons name="arrow-back" size={24} color={theme.colors.text} />
            </Pressable>
            <MaterialIcons name="delete" size={28} color={theme.colors.error} />
            <Text style={styles.title}>سلة المحذوفات</Text>
          </View>

          {trashItems.length > 0 && (
            <Pressable onPress={handleEmptyTrash} style={styles.emptyButton}>
              <MaterialIcons name="delete-forever" size={20} color={theme.colors.error} />
              <Text style={styles.emptyButtonText}>إفراغ السلة</Text>
            </Pressable>
          )}
        </View>

        <FlatList
          data={trashItems}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => {
            const daysLeft = getDaysRemaining(item.expiresAt);
            const data = item.data as any;

            return (
              <View style={styles.item}>
                <View style={styles.itemHeader}>
                  <MaterialIcons
                    name={item.type === 'note' ? 'note' : 'folder'}
                    size={24}
                    color={theme.colors.textSecondary}
                  />
                  <View style={styles.itemInfo}>
                    <Text style={styles.itemTitle} numberOfLines={1}>
                      {data.title || data.name}
                    </Text>
                    <Text style={styles.itemMeta}>
                      {daysLeft} يوم متبقي • {item.type === 'note' ? 'ملاحظة' : 'مجلد'}
                    </Text>
                  </View>
                </View>

                <View style={styles.itemActions}>
                  <Pressable
                    onPress={() => handleRestore(item.id)}
                    style={styles.actionButton}
                  >
                    <MaterialIcons name="restore" size={20} color={theme.colors.primary} />
                    <Text style={styles.restoreText}>استعادة</Text>
                  </Pressable>

                  <Pressable
                    onPress={() => handlePermanentDelete(item.id)}
                    style={styles.actionButton}
                  >
                    <MaterialIcons name="delete-forever" size={20} color={theme.colors.error} />
                    <Text style={styles.deleteText}>حذف نهائي</Text>
                  </Pressable>
                </View>
              </View>
            );
          }}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <MaterialIcons name="delete-outline" size={64} color={theme.colors.textTertiary} />
              <Text style={styles.emptyText}>سلة المحذوفات فارغة</Text>
              <Text style={styles.emptySubtext}>
                العناصر المحذوفة ستظهر هنا لمدة 30 يوم
              </Text>
            </View>
          }
        />
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
    gap: theme.spacing.md,
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

  emptyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.sm,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.error,
  },

  emptyButtonText: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.medium,
    color: theme.colors.error,
  },

  listContent: {
    padding: theme.spacing.md,
  },

  item: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
    gap: theme.spacing.md,
  },

  itemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },

  itemInfo: {
    flex: 1,
  },

  itemTitle: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.text,
    marginBottom: 4,
  },

  itemMeta: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
  },

  itemActions: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },

  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.xs,
    padding: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.background,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },

  restoreText: {
    fontSize: theme.fontSize.sm,
    fontWeight: theme.fontWeight.medium,
    color: theme.colors.primary,
  },

  deleteText: {
    fontSize: theme.fontSize.sm,
    fontWeight: theme.fontWeight.medium,
    color: theme.colors.error,
  },

  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.spacing.xxl * 2,
  },

  emptyText: {
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.md,
  },

  emptySubtext: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textTertiary,
    marginTop: theme.spacing.xs,
    textAlign: 'center',
  },
});
