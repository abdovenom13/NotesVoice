import { useState, useCallback } from 'react';
import { chatService, ChatMessage } from '@/services/chatService';

export function useChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
      const { data, error: chatError } = await chatService.sendMessage(
        text.trim(),
        messages
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
