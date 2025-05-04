import React from 'react';
import { View } from 'react-native';
import { useTheme } from '@react-navigation/native';
import { MessageInput } from './MessageInput';
import type { MessageInputProps, EmotionalState } from './MessageInput';

const defaultProps: MessageInputProps = {
  onSend: () => {},
  onRecordAudio: () => {},
  placeholder: 'Type a message...',
  maxLength: 500,
  disabled: false,
};

export default {
  title: 'Components/MessageInput',
  component: MessageInput,
  decorators: [
    // TODO: revisit decorator typing issue during cleanup sprint
    // 🎯 Issue: TypeScript linter error on decorator usage (Story type inference)
    // 🛠️ Root Cause: Incompatibility between React Native, Storybook, and TypeScript's handling of decorators
    // ✅ Workaround: Using React.ComponentType and manually typed the decorator
    // 🔒 Impact: No effect on runtime or Storybook rendering; only a type warning remains
    (StoryFn: React.ComponentType) => {
      const theme = useTheme();
      return (
        <View style={{ padding: 20, flex: 1, backgroundColor: theme.colors.background }}>
          <StoryFn />
        </View>
      );
    },
  ],
  args: defaultProps,
};

export const Default = {
  args: defaultProps,
};

export const Happy = {
  args: {
    ...defaultProps,
    seniorEmotionalState: 'happy' as EmotionalState,
  },
};

export const Sad = {
  args: {
    ...defaultProps,
    seniorEmotionalState: 'sad' as EmotionalState,
  },
};

export const Angry = {
  args: {
    ...defaultProps,
    seniorEmotionalState: 'angry' as EmotionalState,
  },
};

export const Neutral = {
  args: {
    ...defaultProps,
    seniorEmotionalState: 'neutral' as EmotionalState,
  },
};

export const Anxious = {
  args: {
    ...defaultProps,
    seniorEmotionalState: 'anxious' as EmotionalState,
  },
};

export const Calm = {
  args: {
    ...defaultProps,
    seniorEmotionalState: 'calm' as EmotionalState,
  },
};

export const Disabled = {
  args: {
    ...defaultProps,
    disabled: true,
  },
};

export const LongPlaceholder = {
  args: {
    ...defaultProps,
    placeholder: 'This is a very long placeholder text that should wrap properly...',
  },
};

export const ShortMaxLength = {
  args: {
    ...defaultProps,
    maxLength: 50,
  },
}; 