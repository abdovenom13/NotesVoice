import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { theme } from '@/constants/theme';
import { PDFAttachment, pdfService } from '@/services/pdfService';
import { PDFViewer } from './PDFViewer';

interface PDFAttachmentsProps {
  attachments: PDFAttachment[];
  onRemove?: (id: string) => void;
  editable?: boolean;
}

export function PDFAttachments({ attachments, onRemove, editable = true }: PDFAttachmentsProps) {
  const [selectedPDF, setSelectedPDF] = useState<PDFAttachment | null>(null);

  if (attachments.length === 0) {
    return null;
  }

  return (
    <>
      <View style={styles.container}>
        <View style={styles.header}>
          <MaterialIcons name="picture-as-pdf" size={20} color={theme.colors.error} />
          <Text style={styles.title}>ملفات PDF ({attachments.length})</Text>
        </View>
        
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.list}>
          {attachments.map((pdf) => (
            <Pressable
              key={pdf.id}
              onPress={() => setSelectedPDF(pdf)}
              style={({ pressed }) => [
                styles.pdfCard,
                pressed && styles.pdfCardPressed,
              ]}
            >
              <View style={styles.pdfIcon}>
                <MaterialIcons name="picture-as-pdf" size={32} color={theme.colors.error} />
              </View>
              
              <View style={styles.pdfInfo}>
                <Text style={styles.pdfName} numberOfLines={2}>{pdf.name}</Text>
                <Text style={styles.pdfSize}>{pdfService.formatFileSize(pdf.size)}</Text>
                {pdf.pageCount && (
                  <Text style={styles.pdfPages}>{pdf.pageCount} صفحات</Text>
                )}
              </View>
              
              {editable && onRemove && (
                <Pressable
                  onPress={() => onRemove(pdf.id)}
                  style={styles.removeButton}
                  hitSlop={8}
                >
                  <MaterialIcons name="close" size={18} color={theme.colors.error} />
                </Pressable>
              )}
            </Pressable>
          ))}
        </ScrollView>
      </View>

      {selectedPDF && (
        <PDFViewer
          pdf={selectedPDF}
          onClose={() => setSelectedPDF(null)}
          onRemove={
            editable && onRemove
              ? () => {
                  onRemove(selectedPDF.id);
                  setSelectedPDF(null);
                }
              : undefined
          }
        />
      )}
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: theme.spacing.md,
  },
  
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    marginBottom: theme.spacing.sm,
  },
  
  title: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.text,
  },
  
  list: {
    paddingHorizontal: theme.spacing.md,
    gap: theme.spacing.sm,
  },
  
  pdfCard: {
    width: 160,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    position: 'relative',
  },
  
  pdfCardPressed: {
    opacity: 0.7,
    transform: [{ scale: 0.98 }],
  },
  
  pdfIcon: {
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  
  pdfInfo: {
    gap: 4,
  },
  
  pdfName: {
    fontSize: theme.fontSize.sm,
    fontWeight: theme.fontWeight.medium,
    color: theme.colors.text,
    lineHeight: 18,
  },
  
  pdfSize: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.textSecondary,
  },
  
  pdfPages: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.textTertiary,
  },
  
  removeButton: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: theme.colors.background,
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
});
