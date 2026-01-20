import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import Animated, { useAnimatedStyle, withRepeat, withTiming, useSharedValue } from 'react-native-reanimated';
import { theme } from '@/constants/theme';
import { commonStyles } from '@/constants/styles';
import { useNotes } from '@/hooks/useNotes';
import { useSpeech } from '@/hooks/useSpeech';
import { useTextFormat } from '@/hooks/useTextFormat';
import { useAI } from '@/hooks/useAI';
import { useSettings } from '@/hooks/useSettings';
import { useFolders } from '@/hooks/useFolders';
import { useTranslation } from '@/hooks/useTranslation';
import { dataService } from '@/services/dataService';
import { Note, MediaAttachment } from '@/services/noteService';
import { mediaService } from '@/services/mediaService';
import { audioService } from '@/services/audioService';
import { pdfService, PDFAttachment } from '@/services/pdfService';
import { FormatToolbar } from '@/components/feature/FormatToolbar';
import { RichTextPreview } from '@/components/feature/RichTextPreview';
import { AIMenu } from '@/components/feature/AIMenu';
import { MediaAttachments } from '@/components/feature/MediaAttachments';
import { MediaPickerMenu } from '@/components/feature/MediaPickerMenu';
import { FolderPicker } from '@/components/feature/FolderPicker';
import { AudioRecorder } from '@/components/feature/AudioRecorder';
import { AudioPlayer } from '@/components/feature/AudioPlayer';
import { TagPicker } from '@/components/feature/TagPicker';
import { PDFAttachments } from '@/components/feature/PDFAttachments';
import { useTags } from '@/hooks/useTags';
import { useAlert } from '@/template';

export default function NoteDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const { notes, saveNote, deleteNote } = useNotes();
  const { isListening, isAvailable, startListening } = useSpeech();
  const { loading: aiLoading, error: aiError, improveText, summarize, generateTitle, extractPoints, toList, translate } = useAI();
  const { settings } = useSettings();
  const { folders } = useFolders();
  const { tags } = useTags();
  const { showAlert } = useAlert();
  const { t } = useTranslation();
  
  const [note, setNote] = useState<Note | null>(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [hasChanges, setHasChanges] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);
  const [showAIMenu, setShowAIMenu] = useState(false);
  const [showMediaPicker, setShowMediaPicker] = useState(false);
  const [showFolderPicker, setShowFolderPicker] = useState(false);
  const [showAudioRecorder, setShowAudioRecorder] = useState(false);
  const [showTagPicker, setShowTagPicker] = useState(false);
  const [timeSpent, setTimeSpent] = useState(0);
  const [isActive, setIsActive] = useState(true);
  const startTimeRef = useRef(Date.now());
  
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

  const wordCount = content.trim() ? content.trim().split(/\s+/).length : 0;
  const charCount = content.length;
  const currentFolder = folders.find(f => f.id === note?.folderId);
  const noteTags = tags.filter(t => note?.tagIds?.includes(t.id));
  const audioAttachments = note?.attachments?.filter(a => a.type === 'audio') || [];
  const imageAttachments = note?.attachments?.filter(a => a.type === 'image') || [];
  const pdfAttachments = note?.attachments?.filter(a => a.type === 'pdf') || [];

  useEffect(() => {
    const foundNote = notes.find(n => n.id === id);
    if (foundNote) {
      setNote(foundNote);
      setTitle(foundNote.title);
      setContent(foundNote.content);
      setTimeSpent(foundNote.timeSpent || 0);
      startTimeRef.current = Date.now();
    }
  }, [id, notes]);

  // Track time spent on note
  useEffect(() => {
    const interval = setInterval(() => {
      if (isActive && note) {
        setTimeSpent(prev => prev + 1);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [isActive, note]);

  // Save time spent on unmount or when leaving
  useEffect(() => {
    return () => {
      if (note && timeSpent > 0) {
        const updatedNote = {
          ...note,
          timeSpent: (note.timeSpent || 0) + timeSpent,
          lastOpenedAt: Date.now(),
        };
        saveNote(updatedNote);
      }
    };
  }, [note, timeSpent]);

  useEffect(() => {
    if (note) {
      setHasChanges(
        title !== note.title || 
        content !== note.content
      );
    }
  }, [title, content, note]);

  const handleSave = async () => {
    if (!note) return;
    
    const updatedNote = {
      ...note,
      title: title.trim() || t('titlePlaceholder').replace('...', ''),
      content,
      timeSpent: (note.timeSpent || 0) + timeSpent,
      lastOpenedAt: Date.now(),
      updatedAt: Date.now(),
      attachments: note.attachments || [],
    };
    
    await saveNote(updatedNote);
    setTimeSpent(0);
    startTimeRef.current = Date.now();
    setHasChanges(false);
    showAlert(t('saved'), 'تم حفظ الملاحظة بنجاح');
  };

  const handleDelete = () => {
    showAlert(t('deleteNote'), t('deleteConfirm'), [
      { text: t('cancel'), style: 'cancel' },
      {
        text: t('delete'),
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

  const handleAddMedia = async (type: 'pick' | 'capture') => {
    try {
      let media: MediaAttachment | null = null;

      if (type === 'pick') {
        media = await mediaService.pickImage(settings.maxImageSize);
      } else {
        media = await mediaService.captureImage(settings.maxImageSize);
      }

      if (media && note) {
        const updatedNote = {
          ...note,
          attachments: [...(note.attachments || []), media],
          updatedAt: Date.now(),
        };
        await saveNote(updatedNote);
        setNote(updatedNote);
        showAlert('تم', 'تم إضافة الصورة بنجاح');
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'فشل إضافة الصورة';
      showAlert(t('error'), message);
    }
  };

  const handleRemoveMedia = async (id: string) => {
    if (!note) return;

    const attachment = note.attachments?.find(a => a.id === id);
    if (attachment) {
      if (attachment.type === 'pdf') {
        await pdfService.deletePDF(attachment.uri);
      } else {
        await mediaService.deleteMedia(attachment);
      }
    }

    const updatedNote = {
      ...note,
      attachments: note.attachments?.filter(a => a.id !== id) || [],
      updatedAt: Date.now(),
    };
    await saveNote(updatedNote);
    setNote(updatedNote);
    showAlert(t('done'), 'تم حذف الوسائط بنجاح');
  };

  const handleAddPDF = async () => {
    try {
      const pdf = await pdfService.pickPDF();
      if (pdf && note) {
        const pdfAttachment: MediaAttachment = {
          id: pdf.id,
          uri: pdf.uri,
          type: 'pdf',
          name: pdf.name,
          size: pdf.size,
          pageCount: pdf.pageCount,
          createdAt: pdf.createdAt,
        };

        const updatedNote = {
          ...note,
          attachments: [...(note.attachments || []), pdfAttachment],
          updatedAt: Date.now(),
        };
        await saveNote(updatedNote);
        setNote(updatedNote);
        showAlert('تم', 'تم إضافة ملف PDF بنجاح');
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'فشل إضافة ملف PDF';
      showAlert(t('error'), message);
    }
  };

  const handleVoiceInput = () => {
    if (!isAvailable) {
      showAlert(t('warning'), 'ميزة التعرف على الصوت غير متوفرة');
      return;
    }

    startListening(
      (text) => {
        setContent((prev) => (prev ? prev + ' ' + text : text));
        setHasChanges(true);
      },
      (error) => {
        showAlert(t('error'), 'فشل التعرف على الصوت: ' + error);
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

  const handleShareNote = async () => {
    if (!note) return;
    const result = await dataService.shareNote(note);
    if (result.success) {
      showAlert(t('success'), t('shareSuccess'));
    } else {
      showAlert(t('error'), result.error || t('shareError'));
    }
  };

  const handleTagsChange = async (tagIds: string[]) => {
    if (!note) return;
    const updatedNote = { ...note, tagIds, updatedAt: Date.now() };
    await saveNote(updatedNote);
    setNote(updatedNote);
  };

  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}س ${minutes}د`;
    } else if (minutes > 0) {
      return `${minutes}د ${secs}ث`;
    }
    return `${secs}ث`;
  };

  const handleAudioRecorded = async (uri: string, duration: number) => {
    if (!note) return;

    const audioAttachment: MediaAttachment = {
      id: Date.now().toString() + Math.random(),
      uri,
      type: 'audio',
      name: `audio_${Date.now()}.m4a`,
      size: 0,
      duration,
      createdAt: Date.now(),
    };

    const updatedNote = {
      ...note,
      attachments: [...(note.attachments || []), audioAttachment],
      updatedAt: Date.now(),
    };
    await saveNote(updatedNote);
    setNote(updatedNote);
    setShowAudioRecorder(false);
    showAlert(t('done'), 'تم حفظ التسجيل الصوتي');
  };

  const handleRemoveAudio = async (id: string) => {
    if (!note) return;

    const attachment = note.attachments?.find(a => a.id === id);
    if (attachment) {
      await audioService.deleteAudio(attachment.uri);
    }

    const updatedNote = {
      ...note,
      attachments: note.attachments?.filter(a => a.id !== id) || [],
      updatedAt: Date.now(),
    };
    await saveNote(updatedNote);
    setNote(updatedNote);
  };

  const handleAIAction = async (actionId: string) => {
    if (!content.trim()) {
      showAlert(t('warning'), 'الرجاء كتابة نص أولاً');
      setShowAIMenu(false);
      return;
    }

    let result: string | null = null;

    try {
      switch (actionId) {
        case 'improve':
          result = await improveText(content);
          break;
        case 'summarize':
          result = await summarize(content);
          break;
        case 'generateTitle':
          result = await generateTitle(content);
          if (result) {
            setTitle(result);
            setHasChanges(true);
            showAlert(t('done'), 'تم توليد العنوان بنجاح');
          }
          setShowAIMenu(false);
          return;
        case 'extractPoints':
          result = await extractPoints(content);
          break;
        case 'toList':
          result = await toList(content);
          break;
        case 'translateAr':
          result = await translate(content, 'ar');
          break;
        case 'translateEn':
          result = await translate(content, 'en');
          break;
      }

      if (result) {
        setContent(result);
        setHasChanges(true);
        showAlert(t('done'), 'تمت المعالجة بنجاح');
      } else if (aiError) {
        showAlert(t('error'), aiError);
      }
    } catch (error) {
      showAlert(t('error'), 'حدث خطأ أثناء معالجة النص');
    } finally {
      setShowAIMenu(false);
    }
  };

  if (!note) {
    return (
      <SafeAreaView style={commonStyles.container}>
        <View style={[commonStyles.container, commonStyles.centerContent]}>
          <Text style={styles.errorText}>{t('error')}: الملاحظة غير موجودة</Text>
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
            {currentFolder && (
              <Pressable
                style={styles.folderBadge}
                onPress={() => setShowFolderPicker(true)}
              >
                <MaterialIcons name={currentFolder.icon as any} size={16} color={currentFolder.color} />
                <Text style={styles.folderText}>{currentFolder.name}</Text>
              </Pressable>
            )}
            {!currentFolder && (
              <Pressable
                style={styles.addFolderButton}
                onPress={() => setShowFolderPicker(true)}
              >
                <MaterialIcons name="create-new-folder" size={20} color={theme.colors.textSecondary} />
              </Pressable>
            )}
            <Pressable
              style={styles.tagsButton}
              onPress={() => setShowTagPicker(true)}
            >
              <MaterialIcons name="local-offer" size={20} color={theme.colors.primary} />
              {noteTags.length > 0 && (
                <View style={styles.tagsBadge}>
                  <Text style={styles.tagsBadgeText}>{noteTags.length}</Text>
                </View>
              )}
            </Pressable>
            {hasChanges && (
              <View style={styles.unsavedIndicator}>
                <Text style={styles.unsavedText}>{t('unsaved')}</Text>
              </View>
            )}
            <Pressable 
              onPress={handleShareNote} 
              hitSlop={12} 
              style={styles.iconButton}
            >
              <MaterialIcons name="share" size={24} color={theme.colors.textSecondary} />
            </Pressable>
            <Pressable 
              onPress={() => setShowMediaPicker(true)} 
              hitSlop={12} 
              style={styles.iconButton}
            >
              <MaterialIcons name="attach-file" size={24} color={theme.colors.textSecondary} />
            </Pressable>
            <Pressable 
              onPress={handleAddPDF} 
              hitSlop={12} 
              style={styles.iconButton}
            >
              <MaterialIcons name="picture-as-pdf" size={24} color={theme.colors.error} />
            </Pressable>
            <Pressable 
              onPress={() => setShowAIMenu(true)} 
              hitSlop={12} 
              style={styles.iconButton}
            >
              <MaterialIcons name="auto-awesome" size={24} color={theme.colors.primary} />
            </Pressable>
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
            <Pressable 
              onPress={() => setShowAudioRecorder(!showAudioRecorder)} 
              hitSlop={12} 
              style={styles.iconButton}
            >
              <MaterialIcons 
                name={showAudioRecorder ? 'mic-off' : 'mic'} 
                size={24} 
                color={showAudioRecorder ? theme.colors.error : theme.colors.textSecondary} 
              />
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
            placeholder={t('titlePlaceholder')}
            placeholderTextColor={theme.colors.textTertiary}
            style={styles.titleInput}
          />
          
          {showAudioRecorder && (
            <View style={styles.audioRecorderContainer}>
              <AudioRecorder
                onRecordingComplete={handleAudioRecorded}
                onError={(error) => showAlert(t('error'), error)}
              />
            </View>
          )}
          
          {audioAttachments.length > 0 && (
            <View style={styles.audioContainer}>
              <Text style={styles.audioTitle}>التسجيلات الصوتية ({audioAttachments.length})</Text>
              {audioAttachments.map((audio) => (
                <AudioPlayer
                  key={audio.id}
                  uri={audio.uri}
                  duration={audio.duration || 0}
                  onRemove={() => handleRemoveAudio(audio.id)}
                  editable={!previewMode}
                />
              ))}
            </View>
          )}
          
          <MediaAttachments
            attachments={imageAttachments}
            onRemove={handleRemoveMedia}
            editable={!previewMode}
          />
          
          <PDFAttachments
            attachments={pdfAttachments as any}
            onRemove={handleRemoveMedia}
            editable={!previewMode}
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
                placeholder={t('contentPlaceholder')}
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
              {isListening ? t('listening') : t('voiceRecording')}
            </Text>
          </Pressable>
          
          <View style={styles.stats}>
            <View style={styles.statItem}>
              <MaterialIcons name="article" size={16} color={theme.colors.textTertiary} />
              <Text style={styles.statText}>{wordCount} كلمة</Text>
            </View>
            <Text style={styles.statSeparator}>•</Text>
            <View style={styles.statItem}>
              <MaterialIcons name="text-fields" size={16} color={theme.colors.textTertiary} />
              <Text style={styles.statText}>{charCount} حرف</Text>
            </View>
            <Text style={styles.statSeparator}>•</Text>
            <View style={styles.statItem}>
              <MaterialIcons name="schedule" size={16} color={theme.colors.primary} />
              <Text style={[styles.statText, styles.timeText]}>{formatTime(timeSpent)}</Text>
            </View>
          </View>
        </View>

        {!previewMode && (
          <FormatToolbar
            onFormat={handleFormat}
            onColorChange={handleColorChange}
            activeFormats={activeFormats}
          />
        )}

        <AIMenu
          visible={showAIMenu}
          loading={aiLoading}
          onSelect={handleAIAction}
          onClose={() => setShowAIMenu(false)}
        />

        <MediaPickerMenu
          visible={showMediaPicker}
          onClose={() => setShowMediaPicker(false)}
          onPickImage={() => handleAddMedia('pick')}
          onCaptureImage={() => handleAddMedia('capture')}
        />

        <FolderPicker
          visible={showFolderPicker}
          selectedFolderId={note?.folderId}
          onSelect={(folderId) => {
            if (note) {
              const updatedNote = { ...note, folderId, updatedAt: Date.now() };
              saveNote(updatedNote);
              setNote(updatedNote);
            }
          }}
          onClose={() => setShowFolderPicker(false)}
        />

        <TagPicker
          visible={showTagPicker}
          selectedTagIds={note?.tagIds || []}
          onSelect={handleTagsChange}
          onClose={() => setShowTagPicker(false)}
        />
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
  
  folderBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
    backgroundColor: theme.colors.surface,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.sm,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  
  folderText: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.text,
    fontWeight: theme.fontWeight.medium,
  },
  
  addFolderButton: {
    padding: theme.spacing.xs,
  },

  tagsButton: {
    position: 'relative',
    padding: theme.spacing.xs,
  },

  tagsBadge: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: theme.colors.primary,
    width: 16,
    height: 16,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },

  tagsBadgeText: {
    fontSize: 10,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.background,
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
  
  stats: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    flexWrap: 'wrap',
  },

  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  
  statText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textTertiary,
    fontWeight: theme.fontWeight.medium,
  },

  timeText: {
    color: theme.colors.primary,
  },
  
  statSeparator: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textTertiary,
  },
  
  errorText: {
    fontSize: theme.fontSize.lg,
    color: theme.colors.error,
  },
  
  audioRecorderContainer: {
    padding: theme.spacing.md,
    backgroundColor: theme.colors.background,
  },
  
  audioContainer: {
    padding: theme.spacing.md,
    backgroundColor: theme.colors.background,
    gap: theme.spacing.sm,
  },
  
  audioTitle: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
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
