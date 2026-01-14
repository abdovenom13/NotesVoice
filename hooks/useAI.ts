import { useState } from 'react';
import { aiService, AIAction } from '@/services/aiService';

export function useAI() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const processText = async (
    action: AIAction,
    text: string,
    targetLanguage?: 'ar' | 'en'
  ): Promise<string | null> => {
    if (!text.trim()) {
      setError('النص فارغ');
      return null;
    }

    setLoading(true);
    setError(null);

    try {
      const { data, error: aiError } = await aiService.processText({
        action,
        text,
        targetLanguage,
      });

      if (aiError) {
        setError(aiError);
        return null;
      }

      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'حدث خطأ غير متوقع';
      setError(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const improveText = async (text: string) => processText('improve', text);
  const summarize = async (text: string) => processText('summarize', text);
  const generateTitle = async (text: string) => processText('generateTitle', text);
  const extractPoints = async (text: string) => processText('extractPoints', text);
  const toList = async (text: string) => processText('toList', text);
  const translate = async (text: string, targetLanguage: 'ar' | 'en') => 
    processText('translate', text, targetLanguage);

  return {
    loading,
    error,
    improveText,
    summarize,
    generateTitle,
    extractPoints,
    toList,
    translate,
  };
}
