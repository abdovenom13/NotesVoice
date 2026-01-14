import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Pressable,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { theme } from '@/constants/theme';
import { commonStyles } from '@/constants/styles';
import { useChat } from '@/hooks/useChat';
import { ChatBubble } from '@/components/feature/ChatBubble';
import { ChatInput } from '@/components/feature/ChatInput';
import { ChatMessage } from '@/services/chatService';
import { useAlert } from '@/template';

export default function ChatScreen() {
  const insets = useSafeAreaInsets();
  const { messages, loading, error, sendMessage, clearChat } = useChat();
  const { showAlert } = useAlert();
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages]);

  useEffect(() => {
    if (error) {
      showAlert('خطأ', error);
    }
  }, [error]);

  const handleClearChat = () => {
    if (messages.length === 0) return;

    showAlert('مسح المحادثة', 'هل تريد مسح جميع الرسائل؟', [
      { text: 'إلغاء', style: 'cancel' },
      {
        text: 'مسح',
        style: 'destructive',
        onPress: clearChat,
      },
    ]);
  };

  const renderMessage = ({ item }: { item: ChatMessage }) => (
    <ChatBubble message={item} />
  );

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <LinearGradient
        colors={['rgba(255, 215, 0, 0.3)', 'rgba(255, 215, 0, 0.1)']}
        style={styles.emptyIcon}
      >
        <MaterialIcons name="chat-bubble-outline" size={48} color={theme.colors.primary} />
      </LinearGradient>
      <Text style={styles.emptyTitle}>ابدأ محادثة مع الذكاء الاصطناعي</Text>
      <Text style={styles.emptyDescription}>
        اسأل أي سؤال أو اطلب المساعدة في أي شيء
      </Text>
      <View style={styles.suggestionsContainer}>
        <Text style={styles.suggestionsTitle}>أمثلة:</Text>
        <View style={styles.suggestionsList}>
          <Text style={styles.suggestionText}>• اشرح لي مفهوم الذكاء الاصطناعي</Text>
          <Text style={styles.suggestionText}>• ساعدني في كتابة بريد إلكتروني</Text>
          <Text style={styles.suggestionText}>• اقترح أفكار لمشروع جديد</Text>
        </View>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={commonStyles.container} edges={['top']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
        keyboardVerticalOffset={0}
      >
        <View style={styles.header}>
          <View style={styles.headerTitle}>
            <MaterialIcons name="smart-toy" size={28} color={theme.colors.primary} />
            <Text style={styles.headerText}>مساعد AI</Text>
          </View>
          <Pressable
            onPress={handleClearChat}
            disabled={messages.length === 0}
            hitSlop={12}
            style={({ pressed }) => [
              styles.clearButton,
              messages.length === 0 && styles.clearButtonDisabled,
              pressed && styles.clearButtonPressed,
            ]}
          >
            <MaterialIcons
              name="delete-outline"
              size={24}
              color={messages.length > 0 ? theme.colors.error : theme.colors.textTertiary}
            />
          </Pressable>
        </View>

        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderMessage}
          keyExtractor={(item) => item.id}
          contentContainerStyle={[
            styles.messagesList,
            messages.length === 0 && styles.messagesListEmpty,
          ]}
          ListEmptyComponent={renderEmpty}
          showsVerticalScrollIndicator={false}
          onContentSizeChange={() => {
            if (messages.length > 0) {
              flatListRef.current?.scrollToEnd({ animated: true });
            }
          }}
        />

        {loading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" color={theme.colors.primary} />
            <Text style={styles.loadingText}>يفكر...</Text>
          </View>
        )}

        <ChatInput onSend={sendMessage} disabled={loading} />
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

  headerTitle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },

  headerText: {
    fontSize: theme.fontSize.xl,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.text,
  },

  clearButton: {
    padding: theme.spacing.xs,
  },

  clearButtonDisabled: {
    opacity: 0.3,
  },

  clearButtonPressed: {
    opacity: 0.7,
  },

  messagesList: {
    paddingVertical: theme.spacing.md,
  },

  messagesListEmpty: {
    flexGrow: 1,
  },

  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.xl,
  },

  emptyIcon: {
    width: 96,
    height: 96,
    borderRadius: theme.borderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing.lg,
  },

  emptyTitle: {
    fontSize: theme.fontSize.xl,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
    textAlign: 'center',
  },

  emptyDescription: {
    fontSize: theme.fontSize.md,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginBottom: theme.spacing.xl,
  },

  suggestionsContainer: {
    width: '100%',
    backgroundColor: theme.colors.surfaceLight,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
  },

  suggestionsTitle: {
    fontSize: theme.fontSize.sm,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.sm,
  },

  suggestionsList: {
    gap: theme.spacing.xs,
  },

  suggestionText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.text,
    lineHeight: 20,
  },

  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.sm,
    paddingVertical: theme.spacing.sm,
    backgroundColor: theme.colors.surfaceLight,
    marginHorizontal: theme.spacing.md,
    marginBottom: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
  },

  loadingText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
  },
});
