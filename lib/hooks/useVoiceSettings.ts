import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface VoiceSettings {
  speed: number;
  pitch: number;
  volume: number;
  clarity: number;
}

const DEFAULT_SETTINGS: VoiceSettings = {
  speed: 1.0,
  pitch: 1.0,
  volume: 1.0,
  clarity: 1.0,
};

const STORAGE_KEY = '@careai_voice_settings';

export function useVoiceSettings() {
  const [settings, setSettings] = useState<VoiceSettings>(DEFAULT_SETTINGS);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Try to load from local storage first
      const storedSettings = await AsyncStorage.getItem(STORAGE_KEY);
      if (storedSettings) {
        setSettings(JSON.parse(storedSettings));
        setIsLoading(false);
        return;
      }

      // If not in local storage, try to load from database
      const { data: profile } = await supabase
        .from('profiles')
        .select('voice_settings')
        .eq('id', user.id)
        .single();

      if (profile?.voice_settings) {
        setSettings(profile.voice_settings);
        // Cache in local storage
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(profile.voice_settings));
      }
    } catch (error) {
      console.error('Error loading voice settings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveSettings = async (newSettings: VoiceSettings) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Update local storage
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newSettings));

      // Update database
      await supabase
        .from('profiles')
        .update({ voice_settings: newSettings })
        .eq('id', user.id);

      setSettings(newSettings);
    } catch (error) {
      console.error('Error saving voice settings:', error);
      throw error;
    }
  };

  return {
    settings,
    isLoading,
    saveSettings,
  };
} 