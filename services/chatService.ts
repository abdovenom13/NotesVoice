import { getSupabaseClient } from '@/template';
import { FunctionsHttpError } from '@supabase/supabase-js';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

export interface ChatRequest {
  message: string;
  history: Array<{ role: 'user' | 'assistant'; content: string }>;
}

export const chatService = {
  async sendMessage(
    message: string,
    history: ChatMessage[],
    model?: string
  ): Promise<{ data: string | null; error: string | null }> {
    try {
      const supabase = getSupabaseClient();

      const chatHistory = history.map((msg) => ({
        role: msg.role,
        content: msg.content,
      }));

      const { data, error } = await supabase.functions.invoke('ai-assist', {
        body: {
          action: 'chat',
          text: message,
          chatHistory,
          model,
        },
      });

      if (error) {
        let errorMessage = error.message;
        if (error instanceof FunctionsHttpError) {
          try {
            const statusCode = error.context?.status ?? 500;
            const textContent = await error.context?.text();
            errorMessage = `[${statusCode}] ${textContent || error.message || 'خطأ غير معروف'}`;
          } catch {
            errorMessage = error.message || 'فشل في قراءة الاستجابة';
          }
        }
        return { data: null, error: errorMessage };
      }

      if (!data || !data.result) {
        return { data: null, error: 'لم يتم الحصول على رد من الذكاء الاصطناعي' };
      }

      return { data: data.result, error: null };
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error.message : 'حدث خطأ غير متوقع',
      };
    }
  },

  generateMessageId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  },
};
