import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, I18nManager, ViewStyle, TextStyle } from 'react-native';
import { Audio } from 'expo-av';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '@/theme';
import { calculateAge } from '@/lib/utils/age';

interface VoiceSettings {
  speed: number;
  pitch: number;
  volume: number;
  clarity: number;
}

interface VoicePersonalizationProps {
  dateOfBirth: string;
  onComplete: (settings: VoiceSettings) => void;
}

const DEFAULT_SETTINGS: VoiceSettings = {
  speed: 1.0,
  pitch: 1.0,
  volume: 1.0,
  clarity: 1.0,
};

export default function VoicePersonalization({ dateOfBirth, onComplete }: VoicePersonalizationProps) {
  const [settings, setSettings] = useState<VoiceSettings>(DEFAULT_SETTINGS);
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const age = calculateAge(dateOfBirth);
  const isRTL = I18nManager.isRTL;

  // Adjust default settings based on age
  useEffect(() => {
    const ageBasedSettings: VoiceSettings = {
      speed: age >= 70 ? 0.9 : 1.0, // Slower for older users
      pitch: age >= 70 ? 0.95 : 1.0, // Slightly lower pitch for older users
      volume: age >= 70 ? 1.2 : 1.0, // Louder for older users
      clarity: age >= 70 ? 1.1 : 1.0, // Enhanced clarity for older users
    };
    setSettings(ageBasedSettings);
  }, [age]);

  const playSample = async () => {
    try {
      if (sound) {
        await sound.unloadAsync();
      }

      const { sound: newSound } = await Audio.Sound.createAsync(
        require('@/assets/sounds/voice_sample.mp3'),
        {
          rate: settings.speed,
          volume: settings.volume,
          shouldPlay: true,
        }
      );
      setSound(newSound);
    } catch (error) {
      console.error('Error playing sample:', error);
    }
  };

  const adjustSetting = (key: keyof VoiceSettings, value: number) => {
    setSettings(prev => ({
      ...prev,
      [key]: Math.max(0.5, Math.min(2.0, value)),
    }));
  };

  const renderControl = (title: string, key: keyof VoiceSettings) => (
    <View style={styles.section as ViewStyle}>
      <Text style={styles.sectionTitle as TextStyle}>{title}</Text>
      <View style={[styles.controls as ViewStyle, isRTL && styles.controlsRTL as ViewStyle]}>
        <TouchableOpacity
          onPress={() => adjustSetting(key, settings[key] - 0.1)}
          style={styles.button as ViewStyle}
          accessibilityLabel={`Decrease ${title}`}
          accessibilityHint={`Adjusts the ${title.toLowerCase()} of the voice`}
        >
          <Ionicons 
            name={isRTL ? "add" : "remove"} 
            size={24} 
            color={theme.colors.primary.default} 
          />
        </TouchableOpacity>
        <Text 
          style={styles.value as TextStyle}
          accessibilityLabel={`${title} is set to ${Math.round(settings[key] * 100)}%`}
        >
          {Math.round(settings[key] * 100)}%
        </Text>
        <TouchableOpacity
          onPress={() => adjustSetting(key, settings[key] + 0.1)}
          style={styles.button as ViewStyle}
          accessibilityLabel={`Increase ${title}`}
          accessibilityHint={`Adjusts the ${title.toLowerCase()} of the voice`}
        >
          <Ionicons 
            name={isRTL ? "remove" : "add"} 
            size={24} 
            color={theme.colors.primary.default} 
          />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <ScrollView 
      style={styles.container as ViewStyle}
      contentContainerStyle={styles.contentContainer as ViewStyle}
      showsVerticalScrollIndicator={false}
    >
      <Text style={styles.title as TextStyle}>Voice Assistant Personalization</Text>
      <Text style={styles.subtitle as TextStyle}>
        Let's adjust the voice settings to make it comfortable for you.
      </Text>

      {renderControl('Speed', 'speed')}
      {renderControl('Volume', 'volume')}
      {renderControl('Clarity', 'clarity')}

      <TouchableOpacity
        style={styles.playButton as ViewStyle}
        onPress={playSample}
        accessibilityLabel="Play sample voice"
        accessibilityHint="Plays a sample of the voice with current settings"
      >
        <Ionicons name="play" size={24} color="#FFFFFF" />
        <Text style={styles.playButtonText as TextStyle}>Play Sample</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.saveButton as ViewStyle}
        onPress={() => onComplete(settings)}
        accessibilityLabel="Save voice settings"
        accessibilityHint="Saves your current voice settings"
      >
        <Text style={styles.saveButtonText as TextStyle}>Save Settings</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  } as ViewStyle,
  contentContainer: {
    padding: 20,
    paddingBottom: 40,
  } as ViewStyle,
  title: {
    fontSize: 24,
    fontFamily: theme.typography.families.bold,
    color: theme.colors.text.primary,
    marginBottom: 8,
    textAlign: 'left',
  } as TextStyle,
  subtitle: {
    fontSize: 16,
    fontFamily: theme.typography.families.regular,
    color: theme.colors.text.secondary,
    marginBottom: 24,
    textAlign: 'left',
  } as TextStyle,
  section: {
    marginBottom: 24,
  } as ViewStyle,
  sectionTitle: {
    fontSize: 18,
    fontFamily: theme.typography.families.medium,
    color: theme.colors.text.primary,
    marginBottom: 12,
    textAlign: 'left',
  } as TextStyle,
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  } as ViewStyle,
  controlsRTL: {
    flexDirection: 'row-reverse',
  } as ViewStyle,
  button: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: theme.colors.background.secondary,
    justifyContent: 'center',
    alignItems: 'center',
  } as ViewStyle,
  value: {
    fontSize: 18,
    fontFamily: theme.typography.families.medium,
    color: theme.colors.text.primary,
    minWidth: 60,
    textAlign: 'center',
  } as TextStyle,
  playButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.primary.default,
    padding: 16,
    borderRadius: 8,
    marginTop: 24,
  } as ViewStyle,
  playButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: theme.typography.families.medium,
    marginLeft: 8,
  } as TextStyle,
  saveButton: {
    backgroundColor: theme.colors.primary.default,
    padding: 16,
    borderRadius: 8,
    marginTop: 16,
    alignItems: 'center',
  } as ViewStyle,
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: theme.typography.families.medium,
  } as TextStyle,
}); 