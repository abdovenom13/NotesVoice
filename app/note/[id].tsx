import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import Animated, { useAnimatedStyle, withRepeat, withTiming, useSharedValue } from 'react-native-reanimated';
import { theme } from '@/constants/theme';
import { commonStyles } from '@/constants/styles';
import { useNotes } from '@/hooks/useNotes';
import { useSpeech } from '@/hooks/useSpeech';
import { useTextFormat } from '@/hooks/useTextFormat';
import { Note } from '@/services/noteService';
import { FormatToolbar } from '@/components/feature/FormatToolbar';
import { RichTextPreview } from '@/components/feature/RichTextPreview';
import { useAlert } from '@/template';

export default function NoteDetailScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams();
  const { notes, saveNote, deleteNote } = useNotes();
  const { isListening, isAvailable, startListening } = useSpeech();
  const { showAlert } = useAlert();
  
  const [note, setNote] = useState<Note | null>(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [hasChanges, setHasChanges] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);
  
  const contentInputRef = useRef<TextInput>(null);
  const pulseAnim = useSharedValue(1);
  const { activeFormats, applyFormat, updateSelection } = useTextFormat();

  useEffect(() => {
    if (isListening) {
      pulseAnim.value = withRepeat(
        withTiming(1.2, { duration: 800 }),
        -1,
        true
      );
    } else {
      pulseAnim.value = withTiming(1, { duration: 200 });
    }
  }, [isListening]);

  const animatedMicStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseAnim.value }],
  }));

  useEffect(() => {
    const foundNote = notes.find(n => n.id === id);
    if (foundNote) {
      setNote(foundNote);
      setTitle(foundNote.title);
      setContent(foundNote.content);
    }
  }, [id, notes]);

  useEffect(() => {
    if (note) {
      setHasChanges(title !== note.title || content !== note.content);
    }
  }, [title, content, note]);

  const handleSave = async () => {
    if (!note) return;
    
    const updatedNote = {
      ...note,
      title: title.trim() || 'ملاحظة بدون عنوان',
      content,
      updatedAt: Date.now(),
    };
    
    await saveNote(updatedNote);
    setHasChanges(false);
    showAlert('تم الحفظ', 'تم حفظ الملاحظة بنجاح');
  };

  const handleDelete = () => {
    showAlert('حذف الملاحظة', 'هل أنت متأكد من حذف هذه الملاحظة؟', [
      { text: 'إلغاء', style: 'cancel' },
      {
        text: 'حذف',
        style: 'destructive',
        onPress: async () => {
          if (note) {
            await deleteNote(note.id);
            router.back();
          }
        },
      },
    ]);
  };

  const handleVoiceInput = () => {
    if (!isAvailable) {
      showAlert('غير متوفر', 'ميزة التعرف على الصوت غير متوفرة في هذا المتصفح');
      return;
    }

    startListening(
      (text) => {
        setContent((prev) => (prev ? prev + ' ' + text : text));
        setHasChanges(true);
      },
      (error) => {
        showAlert('خطأ', 'فشل التعرف على الصوت: ' + error);
      }
    );
  };

  const handleFormat = (type: 'bold' | 'italic' | 'underline' | 'strikethrough') => {
    const formattedText = applyFormat(content, type, !activeFormats.has(type));
    setContent(formattedText);
    setHasChanges(true);
    
    setTimeout(() => {
      contentInputRef.current?.focus();
    }, 100);
  };

  const handleColorChange = (color: string) => {
    const formattedText = applyFormat(content, 'color', color);
    setContent(formattedText);
    setHasChanges(true);
    
    setTimeout(() => {
      contentInputRef.current?.focus();
    }, 100);
  };

  const handleSelectionChange = (event: any) => {
    const { start, end } = event.nativeEvent.selection;
    updateSelection(start, end, content);
  };

  if (!note) {
    return (
      <SafeAreaView style={commonStyles.container}>
        <View style={[commonStyles.container, commonStyles.centerContent]}>
          <Text style={styles.errorText}>الملاحظة غير موجودة</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={commonStyles.container} edges={['top']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} hitSlop={12}>
            <MaterialIcons name="arrow-back" size={24} color={theme.colors.text} />
          </Pressable>
          
          <View style={styles.headerActions}>
            {hasChanges && (
              <View style={styles.unsavedIndicator}>
                <Text style={styles.unsavedText}>غير محفوظ</Text>
              </View>
            )}
            <Pressable 
              onPress={() => setPreviewMode(!previewMode)} 
              hitSlop={12} 
              style={styles.iconButton}
            >
              <MaterialIcons 
                name={previewMode ? 'edit' : 'visibility'} 
                size={24} 
                color={previewMode ? theme.colors.primary : theme.colors.textSecondary} 
              />
            </Pressable>
            <Pressable onPress={handleSave} hitSlop={12} style={styles.iconButton}>
              <MaterialIcons name="save" size={24} color={theme.colors.primary} />
            </Pressable>
            <Pressable onPress={handleDelete} hitSlop={12} style={styles.iconButton}>
              <MaterialIcons name="delete" size={24} color={theme.colors.error} />
            </Pressable>
          </View>
        </View>

        <ScrollView style={styles.content} keyboardShouldPersistTaps="handled">
          <TextInput
            value={title}
            onChangeText={setTitle}
            placeholder="عنوان الملاحظة..."
            placeholderTextColor={theme.colors.textTertiary}
            style={styles.titleInput}
          />
          
          {previewMode ? (
            <View style={styles.previewContainer}>
              <View style={styles.previewBadge}>
                <MaterialIcons name="visibility" size={16} color={theme.colors.primary} />
                <Text style={styles.previewBadgeText}>وضع المعاينة</Text>
              </View>
              <RichTextPreview text={content} />
            </View>
          ) : (
            <View style={styles.contentContainer}>
              <TextInput
                ref={contentInputRef}
                value={content}
                onChangeText={setContent}
                onSelectionChange={handleSelectionChange}
                placeholder="ابدأ الكتابة هنا... حدد النص ثم اضغط على أزرار التنسيق"
                placeholderTextColor={theme.colors.textTertiary}
                style={styles.contentInput}
                multiline
                textAlignVertical="top"
              />
            </View>
          )}
        </ScrollView>

        <View style={styles.bottomBar}>
          <Pressable
            onPress={handleVoiceInput}
            style={({ pressed }) => [
              styles.voiceButton,
              isListening && styles.voiceButtonActive,
              pressed && styles.voiceButtonPressed,
            ]}
          >
            <Animated.View style={animatedMicStyle}>
              <MaterialIcons
                name={isListening ? 'mic' : 'mic-none'}
                size={28}
                color={isListening ? theme.colors.error : theme.colors.text}
              />
            </Animated.View>
            <Text style={[styles.voiceText, isListening && styles.voiceTextActive]}>
              {isListening ? 'استمع...' : 'تسجيل صوتي'}
            </Text>
          </Pressable>
          
          <Text style={styles.charCount}>{content.length} حرف</Text>
        </View>

        {!previewMode && (
          <FormatToolbar
            onFormat={handleFormat}
            onColorChange={handleColorChange}
            activeFormats={activeFormats}
          />
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
  },
  
  iconButton: {
    padding: theme.spacing.xs,
  },
  
  unsavedIndicator: {
    backgroundColor: 'rgba(255, 215, 0, 0.2)',
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.sm,
  },
  
  unsavedText: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.primary,
    fontWeight: theme.fontWeight.medium,
  },
  
  content: {
    flex: 1,
  },
  
  titleInput: {
    fontSize: theme.fontSize.xxl,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.text,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  
  contentContainer: {
    flex: 1,
    minHeight: 400,
  },
  
  contentInput: {
    fontSize: theme.fontSize.md,
    color: theme.colors.text,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.md,
    lineHeight: 24,
    minHeight: 400,
  },
  
  bottomBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.md,
    backgroundColor: theme.colors.surface,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  
  voiceButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    backgroundColor: theme.colors.surfaceLight,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
  },
  
  voiceButtonActive: {
    backgroundColor: 'rgba(239, 68, 68, 0.2)',
  },
  
  voiceButtonPressed: {
    opacity: 0.7,
  },
  
  voiceText: {
    fontSize: theme.fontSize.md,
    color: theme.colors.text,
    fontWeight: theme.fontWeight.medium,
  },
  
  voiceTextActive: {
    color: theme.colors.error,
  },
  
  charCount: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textTertiary,
  },
  
  errorText: {
    fontSize: theme.fontSize.lg,
    color: theme.colors.error,
  },
  
  previewContainer: {
    flex: 1,
    minHeight: 400,
    backgroundColor: theme.colors.surfaceLight,
    borderRadius: theme.borderRadius.md,
    margin: theme.spacing.md,
  },
  
  previewBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
    backgroundColor: 'rgba(255, 215, 0, 0.2)',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderTopLeftRadius: theme.borderRadius.md,
    borderTopRightRadius: theme.borderRadius.md,
  },
  
  previewBadgeText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.primary,
    fontWeight: theme.fontWeight.medium,
  },
});
