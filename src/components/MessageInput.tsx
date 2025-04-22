import React, { useState, useRef, useEffect, useCallback } from 'react';
import type { FC } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Platform,
  Text,
  I18nManager,
  Animated,
  Easing,
  useColorScheme,
} from 'react-native';
import type { 
  ViewStyle,
  TextStyle,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Audio } from 'expo-av';
import * as Haptics from 'expo-haptics';
import * as Sentry from '@sentry/react-native';
import * as Permissions from 'expo-permissions';
import { useTranslation } from 'react-i18next';
import { useActiveSenior } from '../contexts/SeniorContext';
import { useSupabase } from '../contexts/SupabaseContext';

export type InteractionType = 'send_message' | 'record_start' | 'record_permission_denied' | 'send_message_error' | 'record_error';

export type EmotionalState = 'happy' | 'sad' | 'angry' | 'neutral' | 'anxious' | 'calm';

export type MaterialIconName = 'sentiment-very-satisfied' | 'sentiment-very-dissatisfied' | 'sentiment-neutral' | 'sentiment-satisfied';

export interface MessageInputProps {
  onSend: (message: string) => void;
  onRecordAudio: () => void;
  placeholder?: string;
  maxLength?: number;
  disabled?: boolean;
  seniorEmotionalState?: EmotionalState;
}

const EMOTION_COLORS: Record<EmotionalState, string> = {
  happy: '#4CAF50',
  sad: '#2196F3',
  angry: '#F44336',
  neutral: '#9E9E9E',
  anxious: '#FF9800',
  calm: '#9C27B0',
};

const EMOTION_ICONS: Record<EmotionalState, MaterialIconName> = {
  happy: 'sentiment-very-satisfied',
  sad: 'sentiment-very-dissatisfied',
  angry: 'sentiment-very-dissatisfied',
  neutral: 'sentiment-neutral',
  anxious: 'sentiment-very-dissatisfied',
  calm: 'sentiment-satisfied',
};

const INTENSE_EMOTIONS: EmotionalState[] = ['angry', 'anxious'];
const CALM_EMOTIONS: EmotionalState[] = ['calm', 'neutral'];

const MessageInput: FC<MessageInputProps> = ({
  onSend,
  onRecordAudio,
  placeholder = 'Type a message',
  maxLength = 1000,
  disabled = false,
  seniorEmotionalState,
}) => {
  const { t } = useTranslation();
  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === 'dark';
  const [interactionSequence, setInteractionSequence] = useState<InteractionType[]>([]);
  const [message, setMessage] = useState('');
  
  // Animation refs
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const slideAnim = useRef(new Animated.Value(-20)).current;
  const prevEmotion = useRef<EmotionalState | undefined>(undefined);

  useEffect(() => {
    if (seniorEmotionalState) {
      // Reset animations
      fadeAnim.setValue(0);
      scaleAnim.setValue(0.8);
      slideAnim.setValue(-20);
      pulseAnim.setValue(1);

      // Start entrance animation
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
          easing: Easing.out(Easing.cubic),
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          useNativeDriver: true,
          bounciness: 8,
          speed: 12,
        }),
        Animated.spring(slideAnim, {
          toValue: 0,
          useNativeDriver: true,
          bounciness: 8,
          speed: 12,
        }),
      ]).start();

      // Trigger haptic feedback based on emotion intensity
      if (INTENSE_EMOTIONS.includes(seniorEmotionalState)) {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
      } else if (CALM_EMOTIONS.includes(seniorEmotionalState)) {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      } else {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      }

      // Start pulse animation for intense emotions
      if (INTENSE_EMOTIONS.includes(seniorEmotionalState)) {
        Animated.loop(
          Animated.sequence([
            Animated.timing(pulseAnim, {
              toValue: 1.1,
              duration: 500,
              useNativeDriver: true,
              easing: Easing.inOut(Easing.ease),
            }),
            Animated.timing(pulseAnim, {
              toValue: 1,
              duration: 500,
              useNativeDriver: true,
              easing: Easing.inOut(Easing.ease),
            }),
          ])
        ).start();
      }

      // Store current emotion for exit animation
      prevEmotion.current = seniorEmotionalState;
    } else if (prevEmotion.current) {
      // Exit animation when emotion is removed
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
          easing: Easing.in(Easing.cubic),
        }),
        Animated.spring(scaleAnim, {
          toValue: 0.8,
          useNativeDriver: true,
          bounciness: 8,
          speed: 12,
        }),
        Animated.spring(slideAnim, {
          toValue: -20,
          useNativeDriver: true,
          bounciness: 8,
          speed: 12,
        }),
      ]).start();
    }
  }, [seniorEmotionalState]);

  const emotionIndicatorStyle = {
    opacity: fadeAnim,
    transform: [
      { scale: scaleAnim },
      { scale: pulseAnim },
      { translateY: slideAnim },
    ],
  };

  const trackInteraction = (interaction: InteractionType, error?: unknown) => {
    const newSequence = [...interactionSequence, interaction];
    setInteractionSequence(newSequence);

    const sentryError = error instanceof Error ? error : new Error('User interaction tracked');
    
    Sentry.captureException(sentryError, {
      tags: {
        component: 'MessageInput',
        last_interaction: interaction,
      },
      extra: {
        interaction_flow: {
          sequence: newSequence,
        },
        error: error ? String(error) : undefined,
      },
    });
  };

  const handleSend = () => {
    if (!message.trim()) return;
    
    try {
      trackInteraction('send_message');
      onSend(message);
      setMessage('');
    } catch (error) {
      trackInteraction('send_message_error', error);
    }
  };

  const handleRecordAudio = async () => {
    try {
      const { status } = await Permissions.askAsync(Permissions.AUDIO_RECORDING);
      if (status === 'granted') {
        trackInteraction('record_start');
        onRecordAudio();
      } else {
        trackInteraction('record_permission_denied', new Error('Audio permission denied'));
      }
    } catch (error) {
      trackInteraction('record_error', error);
    }
  };

  return (
    <View 
      style={[
        styles.container,
        isDarkMode && styles.containerDark
      ]} 
      testID="message-input"
      accessibilityRole="form"
    >
      {seniorEmotionalState && (
        <Animated.View 
          style={[
            styles.emotionIndicator,
            { 
              backgroundColor: EMOTION_COLORS[seniorEmotionalState],
              opacity: fadeAnim,
              transform: [
                { scale: scaleAnim },
                { scale: pulseAnim },
                { translateY: slideAnim },
              ],
            },
            I18nManager.isRTL && styles.emotionIndicatorRTL
          ]}
          testID="emotion-indicator"
          accessibilityRole="image"
          accessibilityLabel={t('emotion.state', { state: seniorEmotionalState })}
          accessibilityLiveRegion="polite"
          importantForAccessibility="yes"
        >
          <MaterialIcons 
            name={EMOTION_ICONS[seniorEmotionalState]} 
            size={24} 
            color="white" 
            accessibilityElementsHidden
          />
          <Text 
            style={styles.emotionText}
            accessibilityElementsHidden
          >
            {t(`emotion.${seniorEmotionalState}`)}
          </Text>
        </Animated.View>
      )}
      <View 
        style={[
          styles.inputContainer,
          I18nManager.isRTL && styles.inputContainerRTL
        ]}
        accessibilityRole="none"
      >
        <TextInput
          testID="message-text-input"
          style={[
            styles.input,
            isDarkMode && styles.inputDark
          ]}
          placeholder={t(placeholder)}
          placeholderTextColor={isDarkMode ? '#A0A0A0' : '#666'}
          value={message}
          onChangeText={setMessage}
          maxLength={maxLength}
          editable={!disabled}
          accessibilityLabel={t('message.input')}
          accessibilityHint={t('message.input.hint')}
          textAlign={I18nManager.isRTL ? 'right' : 'left'}
          importantForAccessibility="yes"
          autoCorrect={false}
          autoCapitalize="none"
          keyboardAppearance={isDarkMode ? 'dark' : 'light'}
        />
        <TouchableOpacity
          testID="send-button"
          onPress={handleSend}
          disabled={disabled || !message.trim()}
          style={[
            styles.button,
            disabled && styles.buttonDisabled,
            isDarkMode && styles.buttonDark
          ]}
          accessibilityLabel={t('message.send')}
          accessibilityHint={t('message.send.hint')}
          accessibilityState={{ disabled: disabled || !message.trim() }}
          importantForAccessibility="yes"
        >
          <Text style={styles.buttonText}>{t('message.send')}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          testID="record-button"
          onPress={handleRecordAudio}
          disabled={disabled}
          style={[
            styles.button,
            disabled && styles.buttonDisabled,
            isDarkMode && styles.buttonDark
          ]}
          accessibilityLabel={t('message.record')}
          accessibilityHint={t('message.record.hint')}
          accessibilityState={{ disabled }}
          importantForAccessibility="yes"
        >
          <Text style={styles.buttonText}>{t('message.record')}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#fff',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  containerDark: {
    backgroundColor: '#1C1C1E',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  inputContainerRTL: {
    flexDirection: 'row-reverse',
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 12,
    padding: 12,
    marginRight: 8,
    fontSize: 16,
    lineHeight: 24,
    color: '#000',
  },
  inputDark: {
    borderColor: '#38383A',
    backgroundColor: '#2C2C2E',
    color: '#FFF',
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 12,
    borderRadius: 12,
    marginLeft: 4,
    minWidth: 80,
  },
  buttonDark: {
    backgroundColor: '#0A84FF',
  },
  buttonDisabled: {
    backgroundColor: '#ccc',
  },
  buttonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
    textAlign: 'center',
  },
  emotionIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    marginBottom: 12,
    alignSelf: 'flex-start',
  },
  emotionIndicatorRTL: {
    alignSelf: 'flex-end',
  },
  emotionText: {
    color: 'white',
    marginLeft: 8,
    fontWeight: '500',
    fontSize: 16,
  },
});

export { MessageInput }; 