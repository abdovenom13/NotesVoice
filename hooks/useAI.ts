import { useState } from 'react';
import { aiService, AIAction } from '@/services/aiService';
import { useSettings } from './useSettings';
import type { AIModel } from '@/contexts/SettingsContext';

const MODEL_MAP: Record<AIModel, string> = {
  'gemini-flash': 'google/gemini-3-flash-preview',
  'gemini-pro': 'google/gemini-3-pro-preview',
  'gpt-5-mini': 'openai/gpt-5-mini',
  'gpt-5': 'openai/gpt-5',
};

export function useAI() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { settings } = useSettings();

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
      const model = MODEL_MAP[settings.aiModel] || 'google/gemini-3-flash-preview';
      const { data, error: aiError } = await aiService.processText({
        action,
        text,
        targetLanguage,
      }, model);

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
