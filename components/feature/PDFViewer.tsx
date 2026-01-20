import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, Modal, ScrollView, Dimensions } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { WebView } from 'react-native-webview';
import { theme } from '@/constants/theme';
import { PDFAttachment } from '@/services/pdfService';

interface PDFViewerProps {
  pdf: PDFAttachment;
  onClose: () => void;
  onRemove?: () => void;
}

export function PDFViewer({ pdf, onClose, onRemove }: PDFViewerProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(pdf.pageCount || 1);

  return (
    <Modal visible animationType="slide" onRequestClose={onClose}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Pressable onPress={onClose} hitSlop={12}>
            <MaterialIcons name="arrow-back" size={24} color={theme.colors.text} />
          </Pressable>
          
          <View style={styles.titleContainer}>
            <MaterialIcons name="picture-as-pdf" size={20} color={theme.colors.error} />
            <Text style={styles.title} numberOfLines={1}>{pdf.name}</Text>
          </View>
          
          {onRemove && (
            <Pressable onPress={onRemove} hitSlop={12}>
              <MaterialIcons name="delete" size={24} color={theme.colors.error} />
            </Pressable>
          )}
        </View>

        <View style={styles.toolbar}>
          <Pressable
            onPress={() => setCurrentPage(Math.max(1, currentPage - 1))}
            disabled={currentPage <= 1}
            style={styles.toolbarButton}
          >
            <MaterialIcons
              name="navigate-before"
              size={24}
              color={currentPage <= 1 ? theme.colors.textTertiary : theme.colors.text}
            />
          </Pressable>
          
          <Text style={styles.pageInfo}>
            {currentPage} / {totalPages}
          </Text>
          
          <Pressable
            onPress={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage >= totalPages}
            style={styles.toolbarButton}
          >
            <MaterialIcons
              name="navigate-next"
              size={24}
              color={currentPage >= totalPages ? theme.colors.textTertiary : theme.colors.text}
            />
          </Pressable>
        </View>

        <View style={styles.content}>
          <WebView
            source={{ uri: pdf.uri }}
            style={styles.webview}
            onError={(error) => console.error('PDF Load Error:', error)}
          />
        </View>
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
  },
  
  titleContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    marginHorizontal: theme.spacing.md,
  },
  
  title: {
    flex: 1,
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.text,
  },
  
  toolbar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.lg,
    padding: theme.spacing.md,
    backgroundColor: theme.colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  
  toolbarButton: {
    padding: theme.spacing.xs,
  },
  
  pageInfo: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.medium,
    color: theme.colors.text,
    minWidth: 80,
    textAlign: 'center',
  },
  
  content: {
    flex: 1,
  },
  
  webview: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
});
