import { useState, useCallback } from 'react';
import { speechService } from '@/services/speechService';

export function useSpeech() {
  const [isListening, setIsListening] = useState(false);
  const [isAvailable] = useState(speechService.isSpeechRecognitionAvailable());

  const startListening = useCallback((
    onResult: (text: string) => void,
    onError: (error: string) => void
  ) => {
    setIsListening(true);
    
    speechService.startRecognition(
      (text) => {
        setIsListening(false);
        onResult(text);
      },
      (error) => {
        setIsListening(false);
        onError(error);
      }
    );
  }, []);

  return {
    isListening,
    isAvailable,
    startListening,
  };
}
