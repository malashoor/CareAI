import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { Audio } from 'expo-av';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '@/theme';

interface BirthdayGreetingProps {
  name: string;
  onClose: () => void;
}

export default function BirthdayGreeting({ name, onClose }: BirthdayGreetingProps) {
  const [fadeAnim] = useState(new Animated.Value(0));
  const [sound, setSound] = useState<Audio.Sound | null>(null);

  useEffect(() => {
    // Fade in animation
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start();

    // Play birthday sound
    playBirthdaySound();

    return () => {
      if (sound) {
        sound.unloadAsync();
      }
    };
  }, []);

  const playBirthdaySound = async () => {
    try {
      const { sound: newSound } = await Audio.Sound.createAsync(
        require('@/assets/sounds/birthday.mp3')
      );
      setSound(newSound);
      await newSound.playAsync();
    } catch (error) {
      console.error('Error playing birthday sound:', error);
    }
  };

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      <View style={styles.content}>
        <Ionicons name="gift" size={48} color={theme.colors.primary} />
        <Text style={styles.title}>Happy Birthday, {name}! 🎉</Text>
        <Text style={styles.message}>
          Wishing you a wonderful day filled with joy and good health.
        </Text>
        <Text style={styles.submessage}>
          Your CareAI family is here to support you every step of the way.
        </Text>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  content: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    width: '80%',
    maxWidth: 400,
  },
  title: {
    fontSize: 24,
    fontFamily: theme.typography.families.bold,
    color: theme.colors.text.primary,
    marginTop: 16,
    textAlign: 'center',
  },
  message: {
    fontSize: 16,
    fontFamily: theme.typography.families.regular,
    color: theme.colors.text.secondary,
    marginTop: 8,
    textAlign: 'center',
  },
  submessage: {
    fontSize: 14,
    fontFamily: theme.typography.families.regular,
    color: theme.colors.text.secondary,
    marginTop: 8,
    textAlign: 'center',
  },
}); 