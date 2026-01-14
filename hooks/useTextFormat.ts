import { useState, useCallback } from 'react';
import { textFormatService, TextFormat } from '@/services/textFormatService';

export function useTextFormat() {
  const [activeFormats, setActiveFormats] = useState<Set<string>>(new Set());
  const [selection, setSelection] = useState({ start: 0, end: 0 });

  const applyFormat = useCallback(
    (text: string, formatType: keyof TextFormat, value: boolean | string = true) => {
      return textFormatService.applyFormat(text, selection, formatType, value);
    },
    [selection]
  );

  const updateSelection = useCallback((start: number, end: number, text: string) => {
    setSelection({ start, end });
    const formats = textFormatService.getActiveFormats(text, start);
    setActiveFormats(formats);
  }, []);

  const parseText = useCallback((text: string) => {
    return textFormatService.parseFormattedText(text);
  }, []);

  const removeFormatting = useCallback((text: string) => {
    return textFormatService.removeAllFormatting(text);
  }, []);

  return {
    activeFormats,
    selection,
    applyFormat,
    updateSelection,
    parseText,
    removeFormatting,
  };
}
