import { useSettings } from './useSettings';
import { t as translate, Language } from '@/constants/i18n';

export function useTranslation() {
  const { settings } = useSettings();
  
  const t = (key: string, params?: Record<string, any>) => {
    return translate(key, settings.language as Language, params);
  };

  return { t, language: settings.language };
}
