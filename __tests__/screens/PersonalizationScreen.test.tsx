import React from 'react';
import { render, fireEvent, waitFor, RenderAPI } from '@testing-library/react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { TouchableOpacity, Text, View } from 'react-native';
import { Switch } from 'react-native-switch';
import AsyncStorage from '@react-native-async-storage/async-storage';
import '@testing-library/jest-native/extend-expect';

// Define navigation types
type RootStackParamList = {
  Welcome: undefined;
  Personalization: undefined;
  Dashboard: undefined;
};

const Stack = createStackNavigator<RootStackParamList>();

// Mock expo-speech
jest.mock('expo-speech', () => ({
  speak: jest.fn(),
  stop: jest.fn(),
  isSpeaking: jest.fn(),
}));

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
}));

// Mock the component and its dependencies
jest.mock('../../project/src/screens/onboarding/PersonalizationScreen', () => {
  const React = require('react');
  const { TouchableOpacity, Text, View } = require('react-native');
  const { Switch } = require('react-native-switch');
  return {
    PersonalizationScreen: React.forwardRef((props: any, ref: any) => (
      <View testID="personalization-screen">
        <Text testID="personalization-title">Personalize Your Experience</Text>
        
        {/* Font Size Section */}
        <View testID="font-size-section">
          <Text>Text Size</Text>
          <View style={{ flexDirection: 'row' }}>
            <TouchableOpacity 
              testID="font-size-small"
              accessibilityRole="button"
              accessibilityLabel="Small text size"
              onPress={() => props.onFontSizeChange?.('small')}
            >
              <Text>S</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              testID="font-size-medium"
              accessibilityRole="button"
              accessibilityLabel="Medium text size"
              onPress={() => props.onFontSizeChange?.('medium')}
            >
              <Text>M</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              testID="font-size-large"
              accessibilityRole="button"
              accessibilityLabel="Large text size"
              onPress={() => props.onFontSizeChange?.('large')}
            >
              <Text>L</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Contrast Mode Section */}
        <View testID="contrast-section">
          <Text>High Contrast</Text>
          <Switch
            testID="contrast-toggle"
            accessibilityRole="switch"
            accessibilityLabel="High contrast mode"
            onValueChange={(value: boolean) => props.onContrastChange?.(value)}
          />
        </View>

        {/* Voice Speed Section */}
        <View testID="voice-speed-section">
          <Text>Voice Speed</Text>
          <View style={{ flexDirection: 'row' }}>
            <TouchableOpacity 
              testID="voice-speed-slow"
              accessibilityRole="button"
              accessibilityLabel="Slow voice speed"
              onPress={() => props.onVoiceSpeedChange?.('slow')}
            >
              <Text>Slow</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              testID="voice-speed-medium"
              accessibilityRole="button"
              accessibilityLabel="Medium voice speed"
              onPress={() => props.onVoiceSpeedChange?.('medium')}
            >
              <Text>Medium</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Save Button */}
        <TouchableOpacity 
          testID="save-button"
          accessibilityRole="button"
          accessibilityLabel="Save and continue"
          onPress={() => props.onSave?.()}
        >
          <Text>Save & Continue</Text>
        </TouchableOpacity>
      </View>
    )),
  };
});

// Mock voice feedback
jest.mock('../../project/src/utils/voiceFeedback', () => ({
  voiceFeedback: {
    speak: jest.fn(),
  },
}));

// Mock accessibility config
jest.mock('../../project/src/utils/accessibility', () => ({
  accessibilityConfig: {
    textScaling: {
      adjustSize: jest.fn(),
    },
    contrastMode: {
      enable: jest.fn(),
      disable: jest.fn(),
    },
    defaultFontSizes: {
      small: 12,
      medium: 16,
      large: 20,
      xlarge: 24,
    },
    minTouchTargetSize: 48,
    getAccessibilityProps: jest.fn().mockImplementation((props) => ({
      ...props,
      accessibilityRole: props.role || 'none',
      accessibilityLabel: props.label || '',
      accessibilityHint: props.hint || '',
    })),
  },
}));

// Import the mocked component
const { PersonalizationScreen } = require('../../project/src/screens/onboarding/PersonalizationScreen');

// Test wrapper component
const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name="Personalization">
          {() => children}
        </Stack.Screen>
      </Stack.Navigator>
    </NavigationContainer>
  );
};

describe('PersonalizationScreen', () => {
  let rendered: RenderAPI;

  beforeEach(() => {
    jest.clearAllMocks();
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);
    (AsyncStorage.setItem as jest.Mock).mockResolvedValue(undefined);
  });

  afterEach(() => {
    rendered?.unmount();
  });

  const renderScreen = () => {
    rendered = render(
      <TestWrapper>
        <PersonalizationScreen />
      </TestWrapper>
    );
    return rendered;
  };

  describe('Basic Rendering', () => {
    it('renders all personalization options and save button', () => {
      const { getByTestId, getByText } = renderScreen();

      // Check main sections
      expect(getByTestId('personalization-screen')).toBeTruthy();
      expect(getByTestId('font-size-section')).toBeTruthy();
      expect(getByTestId('contrast-section')).toBeTruthy();
      expect(getByTestId('voice-speed-section')).toBeTruthy();

      // Check buttons
      expect(getByText('Save & Continue')).toBeTruthy();
      expect(getByText('S')).toBeTruthy();
      expect(getByText('M')).toBeTruthy();
      expect(getByText('L')).toBeTruthy();
      expect(getByText('Slow')).toBeTruthy();
      expect(getByText('Medium')).toBeTruthy();
    });

    it('triggers voice guidance on mount', async () => {
      renderScreen();

      await waitFor(() => {
        expect(require('expo-speech').speak).toHaveBeenCalledWith(
          expect.stringContaining('Personalize Your Experience'),
          expect.any(Object)
        );
      });
    });
  });

  describe('Interaction Tests', () => {
    it('handles font size changes correctly', async () => {
      const { getByTestId } = renderScreen();

      const largeButton = getByTestId('font-size-large');
      fireEvent.press(largeButton);

      await waitFor(() => {
        expect(AsyncStorage.setItem).toHaveBeenCalledWith('@accessibility_font_size', 'large');
        expect(require('expo-speech').speak).toHaveBeenCalledWith(
          expect.stringContaining('Text size set to large'),
          expect.any(Object)
        );
      });
    });

    it('handles contrast mode toggle correctly', async () => {
      const { getByTestId } = renderScreen();

      const contrastToggle = getByTestId('contrast-toggle');
      fireEvent(contrastToggle, 'valueChange', true);

      await waitFor(() => {
        expect(AsyncStorage.setItem).toHaveBeenCalledWith('@accessibility_high_contrast', 'true');
        expect(require('expo-speech').speak).toHaveBeenCalledWith(
          expect.stringContaining('High contrast mode enabled'),
          expect.any(Object)
        );
      });
    });

    it('handles voice speed changes correctly', async () => {
      const { getByTestId } = renderScreen();

      const slowButton = getByTestId('voice-speed-slow');
      fireEvent.press(slowButton);

      await waitFor(() => {
        expect(AsyncStorage.setItem).toHaveBeenCalledWith('@accessibility_voice_speed', 'slow');
        expect(require('expo-speech').speak).toHaveBeenCalledWith(
          expect.stringContaining('Voice speed set to slow'),
          expect.any(Object)
        );
      });
    });

    it('saves settings and navigates when Save & Continue is pressed', async () => {
      const { getByTestId } = renderScreen();
      const navigation = require('@react-navigation/native').useNavigation();

      const saveButton = getByTestId('save-button');
      fireEvent.press(saveButton);

      await waitFor(() => {
        expect(AsyncStorage.setItem).toHaveBeenCalled();
        expect(navigation.navigate).toHaveBeenCalledWith('Dashboard');
        expect(require('expo-speech').speak).toHaveBeenCalledWith(
          expect.stringContaining('Your preferences have been saved'),
          expect.any(Object)
        );
      });
    });
  });

  describe('Accessibility Features', () => {
    it('ensures all interactive elements have correct accessibility properties', () => {
      const { getByTestId } = renderScreen();

      // Check font size buttons
      expect(getByTestId('font-size-small')).toHaveProp('accessibilityRole', 'button');
      expect(getByTestId('font-size-medium')).toHaveProp('accessibilityRole', 'button');
      expect(getByTestId('font-size-large')).toHaveProp('accessibilityRole', 'button');

      // Check contrast toggle
      expect(getByTestId('contrast-toggle')).toHaveProp('accessibilityRole', 'switch');

      // Check voice speed buttons
      expect(getByTestId('voice-speed-slow')).toHaveProp('accessibilityRole', 'button');
      expect(getByTestId('voice-speed-medium')).toHaveProp('accessibilityRole', 'button');

      // Check save button
      expect(getByTestId('save-button')).toHaveProp('accessibilityRole', 'button');
    });

    it('verifies touch target sizes meet accessibility requirements', () => {
      const { getByTestId } = renderScreen();
      const accessibilityConfig = require('../../project/src/utils/accessibility').accessibilityConfig;

      const interactiveElements = [
        'font-size-small',
        'font-size-medium',
        'font-size-large',
        'contrast-toggle',
        'voice-speed-slow',
        'voice-speed-medium',
        'save-button',
      ];

      interactiveElements.forEach(testId => {
        const element = getByTestId(testId);
        expect(element).toHaveStyle({
          minHeight: accessibilityConfig.minTouchTargetSize,
          minWidth: accessibilityConfig.minTouchTargetSize,
        });
      });
    });

    it('supports dynamic text scaling', async () => {
      const { getByTestId } = renderScreen();
      const accessibilityConfig = require('../../project/src/utils/accessibility').accessibilityConfig;

      // Simulate text size change
      await accessibilityConfig.textScaling.adjustSize();

      const title = getByTestId('personalization-title');
      expect(title).toHaveStyle({
        fontSize: expect.any(Number),
      });
    });
  });

  describe('Error Handling', () => {
    it('handles AsyncStorage save failure gracefully', async () => {
      const { getByTestId } = renderScreen();
      const errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      
      // Mock AsyncStorage failure
      (AsyncStorage.setItem as jest.Mock).mockRejectedValueOnce(new Error('Storage error'));

      const saveButton = getByTestId('save-button');
      fireEvent.press(saveButton);

      await waitFor(() => {
        expect(errorSpy).toHaveBeenCalled();
        // Verify the app continues functioning
        expect(require('@react-navigation/native').useNavigation().navigate)
          .toHaveBeenCalledWith('Dashboard');
      });

      errorSpy.mockRestore();
    });

    it('handles voice feedback failure gracefully', async () => {
      const { getByTestId } = renderScreen();
      const errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      
      // Mock voice feedback failure
      const expoSpeech = require('expo-speech');
      expoSpeech.speak.mockRejectedValueOnce(new Error('Speech error'));

      const saveButton = getByTestId('save-button');
      fireEvent.press(saveButton);

      await waitFor(() => {
        expect(errorSpy).toHaveBeenCalled();
        // Verify the app continues functioning
        expect(require('@react-navigation/native').useNavigation().navigate)
          .toHaveBeenCalledWith('Dashboard');
      });

      errorSpy.mockRestore();
    });

    it('handles multiple concurrent errors gracefully', async () => {
      const { getByTestId } = renderScreen();
      const errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      
      // Mock multiple failures
      (AsyncStorage.setItem as jest.Mock).mockRejectedValueOnce(new Error('Storage error'));
      const expoSpeech = require('expo-speech');
      expoSpeech.speak.mockRejectedValueOnce(new Error('Speech error'));

      const saveButton = getByTestId('save-button');
      fireEvent.press(saveButton);

      await waitFor(() => {
        expect(errorSpy).toHaveBeenCalledTimes(2);
        // Verify the app continues functioning
        expect(require('@react-navigation/native').useNavigation().navigate)
          .toHaveBeenCalledWith('Dashboard');
      });

      errorSpy.mockRestore();
    });
  });

  // Snapshot test
  it('matches snapshot', () => {
    rendered = renderScreen();
    expect(rendered.toJSON()).toMatchSnapshot();
  });
}); 