import { useCallback } from 'react';
import * as Speech from 'expo-speech';

export function useVoiceFeedback() {
  const announce = useCallback(async (message: string) => {
    try {
      await Speech.speak(message, {
        language: 'en',
        pitch: 1.0,
        rate: 0.9,
      });
    } catch (error) {
      console.error('Error with voice feedback:', error);
    }
  }, []);

  return { announce };
} 