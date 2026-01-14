import * as Speech from 'expo-speech';

export const speechService = {
  async startRecognition(
    onResult: (text: string) => void,
    onError: (error: string) => void
  ): Promise<void> {
    try {
      // Check if browser supports speech recognition
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      
      if (!SpeechRecognition) {
        onError('Speech recognition not supported in this browser');
        return;
      }

      const recognition = new SpeechRecognition();
      recognition.lang = 'ar-SA'; // Arabic
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;
      recognition.continuous = false;

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        onResult(transcript);
      };

      recognition.onerror = (event: any) => {
        onError(event.error || 'Speech recognition error');
      };

      recognition.start();
    } catch (error) {
      onError('Failed to start speech recognition');
    }
  },

  isSpeechRecognitionAvailable(): boolean {
    if (typeof window === 'undefined') return false;
    return !!(
      (window as any).SpeechRecognition || 
      (window as any).webkitSpeechRecognition
    );
  },
};
