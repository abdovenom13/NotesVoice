import { useState, useCallback } from 'react';
import { chatService, ChatMessage } from '@/services/chatService';
import { useSettings } from './useSettings';
import type { AIModel } from '@/contexts/SettingsContext';

const MODEL_MAP: Record<AIModel, string> = {
  'gemini-flash': 'google/gemini-3-flash-preview',
  'gemini-pro': 'google/gemini-3-pro-preview',
  'gpt-5-mini': 'openai/gpt-5-mini',
  'gpt-5': 'openai/gpt-5',
};

export function useChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { settings } = useSettings();

  const sendMessage = useCallback(async (text: string) => {
    if (!text.trim()) {
      setError('الرجاء كتابة رسالة');
      return;
    }

    const userMessage: ChatMessage = {
      id: chatService.generateMessageId(),
      role: 'user',
      content: text.trim(),
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setLoading(true);
    setError(null);

    try {
      const model = MODEL_MAP[settings.aiModel] || 'google/gemini-3-flash-preview';
      const { data, error: chatError } = await chatService.sendMessage(
        text.trim(),
        messages,
        model
      );

      if (chatError) {
        setError(chatError);
        return;
      }

      if (data) {
        const assistantMessage: ChatMessage = {
          id: chatService.generateMessageId(),
          role: 'assistant',
          content: data,
          timestamp: Date.now(),
        };

        setMessages((prev) => [...prev, assistantMessage]);
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'حدث خطأ غير متوقع';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [messages]);

  const clearChat = useCallback(() => {
    setMessages([]);
    setError(null);
  }, []);

  return {
    messages,
    loading,
    error,
    sendMessage,
    clearChat,
  };
}
