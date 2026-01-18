import { getSupabaseClient } from '@/template';
import { FunctionsHttpError } from '@supabase/supabase-js';

export type AIAction = 'improve' | 'summarize' | 'generateTitle' | 'extractPoints' | 'toList' | 'translate';

export interface AIRequest {
  action: AIAction;
  text: string;
  targetLanguage?: 'ar' | 'en';
  model?: string;
}

export interface AIResponse {
  result: string;
  error?: string;
}

export const aiService = {
  async processText(request: AIRequest, model?: string): Promise<{ data: string | null; error: string | null }> {
    const requestWithModel = { ...request, model };
    try {
      const supabase = getSupabaseClient();
      
      const { data, error } = await supabase.functions.invoke('ai-assist', {
        body: requestWithModel,
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
        return { data: null, error: 'لم يتم الحصول على نتيجة من الذكاء الاصطناعي' };
      }

      return { data: data.result, error: null };
    } catch (error) {
      return { 
        data: null, 
        error: error instanceof Error ? error.message : 'حدث خطأ غير متوقع' 
      };
    }
  },

  async improveText(text: string): Promise<{ data: string | null; error: string | null }> {
    return this.processText({ action: 'improve', text });
  },

  async summarize(text: string): Promise<{ data: string | null; error: string | null }> {
    return this.processText({ action: 'summarize', text });
  },

  async generateTitle(text: string): Promise<{ data: string | null; error: string | null }> {
    return this.processText({ action: 'generateTitle', text });
  },

  async extractPoints(text: string): Promise<{ data: string | null; error: string | null }> {
    return this.processText({ action: 'extractPoints', text });
  },

  async toList(text: string): Promise<{ data: string | null; error: string | null }> {
    return this.processText({ action: 'toList', text });
  },

  async translate(text: string, targetLanguage: 'ar' | 'en'): Promise<{ data: string | null; error: string | null }> {
    return this.processText({ action: 'translate', text, targetLanguage });
  },
};
