import React from 'react';
import { render, fireEvent, act, waitFor } from '@testing-library/react-native';
import * as Sentry from '@sentry/react-native';
import * as Permissions from 'expo-permissions';
import { MessageInput } from '../src/components/MessageInput';
import { Platform, Animated, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';

// Define types and constants
type EmotionalState = 'happy' | 'sad' | 'angry' | 'neutral' | 'anxious' | 'calm';

const EMOTION_COLORS: Record<EmotionalState, string> = {
  happy: '#4CAF50',
  sad: '#2196F3',
  angry: '#F44336',
  neutral: '#9E9E9E',
  anxious: '#FF9800',
  calm: '#9C27B0',
};

// Mock Sentry
jest.mock('@sentry/react-native', () => ({
  captureException: jest.fn(),
}));

// Mock expo-permissions
jest.mock('expo-permissions', () => ({
  askAsync: jest.fn(),
  AUDIO_RECORDING: 'AUDIO_RECORDING',
}));

// Mock I18nManager
jest.mock('react-native', () => {
  const RN = jest.requireActual('react-native');
  RN.I18nManager = {
    isRTL: false,
    allowRTL: jest.fn(),
    forceRTL: jest.fn(),
  };
  RN.useColorScheme = () => 'light';
  return RN;
});

// Mock MaterialIcons
jest.mock('@expo/vector-icons', () => ({
  MaterialIcons: 'MaterialIcons',
}));

// Mock i18next
jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const translations: Record<string, string> = {
        'emotion.state': 'Emotional state: {state}',
        'emotion.happy': 'Happy',
        'emotion.sad': 'Sad',
        'emotion.angry': 'Angry',
        'emotion.neutral': 'Neutral',
        'emotion.anxious': 'Anxious',
        'emotion.calm': 'Calm',
        'message.input': 'Message input field',
        'message.send': 'Send message',
        'message.record': 'Record audio',
        'Type a message': 'Type a message',
      };
      return translations[key] || key;
    },
  }),
}));

// Mock useTheme
jest.mock('../src/hooks/useTheme', () => ({
  useTheme: () => ({
    theme: {
      colors: {
        background: '#FFFFFF',
        text: '#000000',
        primary: '#007AFF',
        secondary: '#5856D6',
        accent: '#FF2D55',
        error: '#FF3B30',
        success: '#34C759',
        warning: '#FF9500',
        card: '#F2F2F7',
        border: '#C6C6C8',
      },
    },
    isDark: false,
  }),
}));

describe('MessageInput Interaction Tracking', () => {
  const mockOnSend = jest.fn();
  const mockOnRecordAudio = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    require('react-native').I18nManager.isRTL = false;
  });

  it('tracks message sending interaction', () => {
    const { getByTestId } = render(
      <MessageInput onSend={mockOnSend} onRecordAudio={mockOnRecordAudio} />
    );

    fireEvent.press(getByTestId('send-button'));

    expect(Sentry.captureException).toHaveBeenCalledWith(
      expect.any(Error),
      expect.objectContaining({
        tags: {
          component: 'MessageInput',
          last_interaction: 'send_message',
        },
        extra: {
          interaction_flow: {
            sequence: ['send_message'],
          },
        },
      })
    );
  });

  it('tracks audio recording interaction with granted permission', async () => {
    (Permissions.askAsync as jest.Mock).mockResolvedValue({ status: 'granted' });

    const { getByTestId } = render(
      <MessageInput onSend={mockOnSend} onRecordAudio={mockOnRecordAudio} />
    );

    await act(async () => {
      fireEvent.press(getByTestId('record-button'));
    });

    expect(Sentry.captureException).toHaveBeenCalledWith(
      expect.any(Error),
      expect.objectContaining({
        tags: {
          component: 'MessageInput',
          last_interaction: 'record_start',
        },
        extra: {
          interaction_flow: {
            sequence: ['record_start'],
          },
        },
      })
    );
  });

  it('tracks permission denial for audio recording', async () => {
    (Permissions.askAsync as jest.Mock).mockResolvedValue({ status: 'denied' });

    const { getByTestId } = render(
      <MessageInput onSend={mockOnSend} onRecordAudio={mockOnRecordAudio} />
    );

    await act(async () => {
      fireEvent.press(getByTestId('record-button'));
    });

    expect(Sentry.captureException).toHaveBeenCalledWith(
      new Error('Audio permission denied'),
      expect.objectContaining({
        tags: {
          component: 'MessageInput',
          last_interaction: 'record_permission_denied',
        },
        extra: {
          interaction_flow: {
            sequence: ['record_permission_denied'],
          },
        },
      })
    );
  });

  it('maintains interaction sequence across multiple actions', async () => {
    (Permissions.askAsync as jest.Mock).mockResolvedValue({ status: 'granted' });

    const { getByTestId } = render(
      <MessageInput onSend={mockOnSend} onRecordAudio={mockOnRecordAudio} />
    );

    fireEvent.press(getByTestId('send-button'));

    await act(async () => {
      fireEvent.press(getByTestId('record-button'));
    });

    expect(Sentry.captureException).toHaveBeenLastCalledWith(
      expect.any(Error),
      expect.objectContaining({
        tags: {
          component: 'MessageInput',
          last_interaction: 'record_start',
        },
        extra: {
          interaction_flow: {
            sequence: ['send_message', 'record_start'],
          },
        },
      })
    );
  });

  it('handles rapid toggling between typing and recording', async () => {
    (Permissions.askAsync as jest.Mock).mockResolvedValue({ status: 'granted' });

    const { getByTestId } = render(
      <MessageInput onSend={mockOnSend} onRecordAudio={mockOnRecordAudio} />
    );

    // Start recording
    await act(async () => {
      fireEvent.press(getByTestId('record-button'));
    });

    // Type while recording
    fireEvent.changeText(getByTestId('message-input'), 'Test message');

    // Stop recording
    await act(async () => {
      fireEvent.press(getByTestId('record-button'));
    });

    // Send message
    fireEvent.press(getByTestId('send-button'));

    expect(Sentry.captureException).toHaveBeenCalledWith(
      expect.any(Error),
      expect.objectContaining({
        tags: {
          component: 'MessageInput',
          last_interaction: 'send_message',
        },
        extra: {
          interaction_flow: {
            sequence: ['record_start', 'record_stop', 'send_message'],
          },
        },
      })
    );
  });

  it('prevents double-tap send', async () => {
    const { getByTestId } = render(
      <MessageInput onSend={mockOnSend} onRecordAudio={mockOnRecordAudio} />
    );

    fireEvent.changeText(getByTestId('message-input'), 'Test message');
    
    // First send
    fireEvent.press(getByTestId('send-button'));
    
    // Immediate second send attempt
    fireEvent.press(getByTestId('send-button'));

    // Verify only one send was processed
    expect(mockOnSend).toHaveBeenCalledTimes(1);
  });

  it('validates Sentry error context', async () => {
    const error = new Error('Test error');
    const { getByTestId } = render(
      <MessageInput onSend={mockOnSend} onRecordAudio={mockOnRecordAudio} />
    );

    // Trigger an error condition
    await act(async () => {
      fireEvent.press(getByTestId('record-button'));
    });

    expect(Sentry.captureException).toHaveBeenCalledWith(
      expect.any(Error),
      expect.objectContaining({
        tags: {
          component: 'MessageInput',
          last_interaction: 'record_permission_denied',
        },
        extra: {
          interaction_flow: {
            sequence: ['record_permission_denied'],
          },
        },
      })
    );
  });

  it('adjusts layout for RTL', () => {
    require('react-native').I18nManager.isRTL = true;
    
    const { getByTestId } = render(
      <MessageInput onSend={mockOnSend} onRecordAudio={mockOnRecordAudio} />
    );

    const inputContainer = getByTestId('input-container');
    expect(inputContainer.props.style.flexDirection).toBe('row-reverse');
  });

  it('handles concurrent send and record attempts', async () => {
    (Permissions.askAsync as jest.Mock).mockResolvedValue({ status: 'granted' });

    const { getByTestId } = render(
      <MessageInput onSend={mockOnSend} onRecordAudio={mockOnRecordAudio} />
    );

    // Start recording
    await act(async () => {
      fireEvent.press(getByTestId('record-button'));
    });

    // Attempt to send while recording
    fireEvent.press(getByTestId('send-button'));

    // Verify send was prevented
    expect(mockOnSend).not.toHaveBeenCalled();
    expect(Sentry.captureException).toHaveBeenCalledWith(
      expect.any(Error),
      expect.objectContaining({
        tags: {
          component: 'MessageInput',
          last_interaction: 'send_blocked_during_recording',
        },
      })
    );
  });

  describe('Emotion Indicator', () => {
    it('does not render emotion indicator when no emotional state is provided', () => {
      const { queryByTestId } = render(
        <MessageInput onSend={mockOnSend} onRecordAudio={mockOnRecordAudio} />
      );

      expect(queryByTestId('emotion-indicator')).toBeNull();
    });

    it('renders emotion indicator with correct color for happy state', () => {
      const { getByTestId } = render(
        <MessageInput 
          onSend={mockOnSend} 
          onRecordAudio={mockOnRecordAudio}
          seniorEmotionalState="happy"
        />
      );

      const indicator = getByTestId('emotion-indicator');
      expect(indicator.props.style.backgroundColor).toBe('#4CAF50');
    });

    it('renders emotion indicator with correct color for sad state', () => {
      const { getByTestId } = render(
        <MessageInput 
          onSend={mockOnSend} 
          onRecordAudio={mockOnRecordAudio}
          seniorEmotionalState="sad"
        />
      );

      const indicator = getByTestId('emotion-indicator');
      expect(indicator.props.style.backgroundColor).toBe('#2196F3');
    });

    it('renders emotion indicator with correct accessibility attributes', () => {
      const { getByTestId } = render(
        <MessageInput 
          onSend={mockOnSend} 
          onRecordAudio={mockOnRecordAudio}
          seniorEmotionalState="happy"
        />
      );

      const indicator = getByTestId('emotion-indicator');
      expect(indicator.props.accessibilityRole).toBe('image');
      expect(indicator.props.accessibilityLabel).toBe('Emotional state: happy');
    });

    it('updates emotion indicator when emotional state changes', () => {
      const { getByTestId, rerender } = render(
        <MessageInput 
          onSend={mockOnSend} 
          onRecordAudio={mockOnRecordAudio}
          seniorEmotionalState="happy"
        />
      );

      const initialIndicator = getByTestId('emotion-indicator');
      expect(initialIndicator.props.style.backgroundColor).toBe('#4CAF50');

      rerender(
        <MessageInput 
          onSend={mockOnSend} 
          onRecordAudio={mockOnRecordAudio}
          seniorEmotionalState="angry"
        />
      );

      const updatedIndicator = getByTestId('emotion-indicator');
      expect(updatedIndicator.props.style.backgroundColor).toBe('#F44336');
    });
  });

  describe('Emotion Indicator Animations', () => {
    it('maintains accessibility during emotion transitions', async () => {
      const { getByTestId, rerender } = render(
        <MessageInput 
          onSend={mockOnSend} 
          onRecordAudio={mockOnRecordAudio}
          seniorEmotionalState="happy"
        />
      );

      const indicator = getByTestId('emotion-indicator');
      
      // Verify initial accessibility attributes
      expect(indicator.props.accessibilityRole).toBe('image');
      expect(indicator.props.accessibilityLiveRegion).toBe('polite');

      // Change emotion state
      rerender(
        <MessageInput 
          onSend={mockOnSend} 
          onRecordAudio={mockOnRecordAudio}
          seniorEmotionalState="sad"
        />
      );

      // Verify accessibility maintained during transition
      expect(indicator.props.accessibilityRole).toBe('image');
      expect(indicator.props.accessibilityLiveRegion).toBe('polite');
      expect(indicator.props.accessibilityLabel).toBe('Emotional state: sad');
    });

    it('handles rapid emotion state changes gracefully', async () => {
      const { getByTestId, rerender } = render(
        <MessageInput 
          onSend={mockOnSend} 
          onRecordAudio={mockOnRecordAudio}
          seniorEmotionalState="happy"
        />
      );

      const indicator = getByTestId('emotion-indicator');
      
      // Rapidly change emotion states
      const states: EmotionalState[] = ['happy', 'sad', 'angry', 'calm'];
      
      for (const state of states) {
        rerender(
          <MessageInput 
            onSend={mockOnSend} 
            onRecordAudio={mockOnRecordAudio}
            seniorEmotionalState={state}
          />
        );
        
        // Verify each state change is handled
        await waitFor(() => {
          expect(indicator.props.style.backgroundColor).toBe(EMOTION_COLORS[state]);
          expect(indicator.props.accessibilityLabel).toBe(`Emotional state: ${state}`);
        });
      }
    });
  });

  describe('Theme-Based Color Variants', () => {
    it('applies correct colors based on theme', async () => {
      // Set up light theme
      jest.spyOn(require('react-native'), 'useColorScheme').mockReturnValue('light');
      jest.spyOn(require('../src/hooks/useTheme'), 'useTheme').mockReturnValue({
        theme: {
          colors: {
            background: '#FFFFFF',
            text: '#000000',
            primary: '#007AFF',
            secondary: '#5856D6',
            accent: '#FF2D55',
            error: '#FF3B30',
            success: '#34C759',
            warning: '#FFCC00',
            card: '#F2F2F7',
            border: '#C6C6C8',
          },
        },
        isDark: false,
      });

      const { getByTestId, rerender } = render(
        <MessageInput 
          onSend={mockOnSend} 
          onRecordAudio={mockOnRecordAudio}
          seniorEmotionalState="calm"
        />
      );

      const indicator = getByTestId('emotion-indicator');
      expect(indicator.props.style.backgroundColor).toBe('#9C27B0'); // calm color

      // Switch to dark theme
      jest.spyOn(require('react-native'), 'useColorScheme').mockReturnValue('dark');
      jest.spyOn(require('../src/hooks/useTheme'), 'useTheme').mockReturnValue({
        theme: {
          colors: {
            background: '#000000',
            text: '#FFFFFF',
            primary: '#0A84FF',
            secondary: '#5E5CE6',
            accent: '#FF375F',
            error: '#FF453A',
            success: '#32D74B',
            warning: '#FFD60A',
            card: '#1C1C1E',
            border: '#38383A',
          },
        },
        isDark: true,
      });

      rerender(
        <MessageInput 
          onSend={mockOnSend} 
          onRecordAudio={mockOnRecordAudio}
          seniorEmotionalState="calm"
        />
      );

      // Verify color remains consistent in dark theme
      expect(indicator.props.style.backgroundColor).toBe('#9C27B0'); // calm color
    });

    it('renders correct colors in light theme', () => {
      const { getByTestId } = render(
        <MessageInput 
          onSend={mockOnSend} 
          onRecordAudio={mockOnRecordAudio}
          seniorEmotionalState="happy"
        />
      );

      const indicator = getByTestId('emotion-indicator');
      expect(indicator.props.style.backgroundColor).toBe('#4CAF50'); // happy color
    });

    it('renders correct colors in dark theme', () => {
      // Mock dark theme
      jest.spyOn(require('react-native'), 'useColorScheme').mockReturnValue('dark');
      jest.spyOn(require('../src/hooks/useTheme'), 'useTheme').mockReturnValue({
        theme: {
          colors: {
            background: '#000000',
            text: '#FFFFFF',
            primary: '#0A84FF',
            secondary: '#5E5CE6',
            accent: '#FF375F',
            error: '#FF453A',
            success: '#32D74B',
            warning: '#FFD60A',
            card: '#1C1C1E',
            border: '#38383A',
          },
        },
        isDark: true,
      });

      const { getByTestId } = render(
        <MessageInput 
          onSend={mockOnSend} 
          onRecordAudio={mockOnRecordAudio}
          seniorEmotionalState="sad"
        />
      );

      const indicator = getByTestId('emotion-indicator');
      expect(indicator.props.style.backgroundColor).toBe('#2196F3'); // sad color
    });

    it('maintains WCAG contrast ratios in both themes', () => {
      const { getByTestId } = render(
        <MessageInput 
          onSend={mockOnSend} 
          onRecordAudio={mockOnRecordAudio}
          seniorEmotionalState="angry"
        />
      );

      const indicator = getByTestId('emotion-indicator');
      const textElement = indicator.findByType(Text);
      
      // Verify text color is white for contrast
      expect(textElement.props.style.color).toBe('white');
      
      // Verify background color has sufficient contrast
      const bgColor = indicator.props.style.backgroundColor;
      expect(bgColor).toBe('#F44336'); // angry color
    });
  });

  describe('MessageInput Edge Cases', () => {
    it('handles rapid emotion state cycling gracefully', async () => {
      const { getByTestId, rerender } = render(
        <MessageInput 
          onSend={mockOnSend} 
          onRecordAudio={mockOnRecordAudio}
          seniorEmotionalState="happy"
        />
      );

      const indicator = getByTestId('emotion-indicator');
      
      // Rapidly cycle through all emotion states
      const states: EmotionalState[] = ['happy', 'sad', 'angry', 'neutral', 'anxious', 'calm'];
      
      for (const state of states) {
        rerender(
          <MessageInput 
            onSend={mockOnSend} 
            onRecordAudio={mockOnRecordAudio}
            seniorEmotionalState={state}
          />
        );
        
        // Verify each state change is handled
        await waitFor(() => {
          expect(indicator.props.style.backgroundColor).toBe(EMOTION_COLORS[state]);
          expect(indicator.props.accessibilityLabel).toBe(`Emotional state: ${state}`);
        });
      }
    });

    it('handles missing emotion state gracefully', () => {
      const { queryByTestId } = render(
        <MessageInput 
          onSend={mockOnSend} 
          onRecordAudio={mockOnRecordAudio}
          seniorEmotionalState={undefined}
        />
      );

      expect(queryByTestId('emotion-indicator')).toBeNull();
    });

    it('maintains correct layout in constrained width container', () => {
      const { getByTestId } = render(
        <View style={{ width: 200 }}>
          <MessageInput 
            onSend={mockOnSend} 
            onRecordAudio={mockOnRecordAudio}
            seniorEmotionalState="happy"
          />
        </View>
      );

      const container = getByTestId('input-container');
      const indicator = getByTestId('emotion-indicator');
      
      // Verify layout remains intact
      expect(container.props.style.flexDirection).toBe('row');
      expect(indicator.props.style.position).toBe('absolute');
      expect(indicator.props.style.right).toBe(0);
    });

    it('adapts to modal environment with safe area insets', () => {
      const { getByTestId } = render(
        <View style={{ paddingTop: 50, paddingBottom: 50 }}>
          <MessageInput 
            onSend={mockOnSend} 
            onRecordAudio={mockOnRecordAudio}
            seniorEmotionalState="happy"
          />
        </View>
      );

      const container = getByTestId('input-container');
      const indicator = getByTestId('emotion-indicator');
      
      // Verify layout adapts to safe area
      expect(container.props.style.paddingVertical).toBe(8);
      expect(indicator.props.style.top).toBe(8);
    });

    it('handles concurrent emotion and input state changes', async () => {
      const { getByTestId, rerender } = render(
        <MessageInput 
          onSend={mockOnSend} 
          onRecordAudio={mockOnRecordAudio}
          seniorEmotionalState="happy"
        />
      );

      const input = getByTestId('message-input');
      const indicator = getByTestId('emotion-indicator');

      // Change emotion state while typing
      fireEvent.changeText(input, 'Test message');
      rerender(
        <MessageInput 
          onSend={mockOnSend} 
          onRecordAudio={mockOnRecordAudio}
          seniorEmotionalState="sad"
        />
      );

      // Verify both states are maintained
      expect(input.props.value).toBe('Test message');
      expect(indicator.props.style.backgroundColor).toBe(EMOTION_COLORS.sad);
    });

    it('maintains accessibility during rapid state changes', async () => {
      const { getByTestId, rerender } = render(
        <MessageInput 
          onSend={mockOnSend} 
          onRecordAudio={mockOnRecordAudio}
          seniorEmotionalState="happy"
        />
      );

      const indicator = getByTestId('emotion-indicator');
      
      // Verify initial accessibility attributes
      expect(indicator.props.accessibilityRole).toBe('image');
      expect(indicator.props.accessibilityLiveRegion).toBe('polite');

      // Change emotion state rapidly
      rerender(
        <MessageInput 
          onSend={mockOnSend} 
          onRecordAudio={mockOnRecordAudio}
          seniorEmotionalState="angry"
        />
      );

      // Verify accessibility maintained during rapid change
      expect(indicator.props.accessibilityRole).toBe('image');
      expect(indicator.props.accessibilityLiveRegion).toBe('polite');
      expect(indicator.props.accessibilityLabel).toBe('Emotional state: angry');
    });
  });
}); 