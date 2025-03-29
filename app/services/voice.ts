import * as Speech from 'expo-speech';
import { NotificationPreferences } from './preferences';

export class VoiceService {
  private static instance: VoiceService;
  private isSpeaking: boolean = false;

  private constructor() {}

  static getInstance(): VoiceService {
    if (!VoiceService.instance) {
      VoiceService.instance = new VoiceService();
    }
    return VoiceService.instance;
  }

  async speak(
    text: string,
    preferences: NotificationPreferences['voiceReadout']
  ): Promise<void> {
    if (!preferences.enabled || this.isSpeaking) return;

    try {
      this.isSpeaking = true;
      await Speech.speak(text, {
        language: preferences.language,
        pitch: preferences.pitch,
        rate: preferences.speed,
        volume: preferences.volume,
      });
    } catch (error) {
      console.error('Error speaking text:', error);
    } finally {
      this.isSpeaking = false;
    }
  }

  async stop(): Promise<void> {
    try {
      await Speech.stop();
      this.isSpeaking = false;
    } catch (error) {
      console.error('Error stopping speech:', error);
    }
  }

  async getAvailableLanguages(): Promise<string[]> {
    try {
      return await Speech.getAvailableLanguagesAsync();
    } catch (error) {
      console.error('Error getting available languages:', error);
      return [];
    }
  }
} 