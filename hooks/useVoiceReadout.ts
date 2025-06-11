import { useState, useEffect } from 'react';
import * as Speech from 'expo-speech';
import AsyncStorage from '@react-native-async-storage/async-storage';

const VOICE_READOUT_KEY = 'hasSeenVoiceReadout';

export function useVoiceReadout() {
  const [hasSeenReadout, setHasSeenReadout] = useState(false);

  useEffect(() => {
    checkFirstTimeUser();
  }, []);

  const checkFirstTimeUser = async () => {
    try {
      const hasSeen = await AsyncStorage.getItem(VOICE_READOUT_KEY);
      if (!hasSeen) {
        setHasSeenReadout(false);
      } else {
        setHasSeenReadout(true);
      }
    } catch (error) {
      console.error('Error checking voice readout status:', error);
    }
  };

  const speak = async (text: string, options: Speech.SpeakOptions = {}) => {
    try {
      await Speech.speak(text, {
        language: 'en',
        pitch: 1.0,
        rate: 0.9,
        ...options
      });
    } catch (error) {
      console.error('Error speaking:', error);
    }
  };

  const markAsSeen = async () => {
    try {
      await AsyncStorage.setItem(VOICE_READOUT_KEY, 'true');
      setHasSeenReadout(true);
    } catch (error) {
      console.error('Error marking voice readout as seen:', error);
    }
  };

  return {
    hasSeenReadout,
    speak,
    markAsSeen
  };
} 