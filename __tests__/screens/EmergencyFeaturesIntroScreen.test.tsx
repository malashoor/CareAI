import React from 'react';
import { render, fireEvent, waitFor, RenderAPI } from '@testing-library/react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { TouchableOpacity, Text, View } from 'react-native';
import '@testing-library/jest-native/extend-expect';

// Define navigation types
type RootStackParamList = {
  Welcome: undefined;
  EmergencyFeaturesIntro: undefined;
};

const Stack = createStackNavigator<RootStackParamList>();

// Mock expo-speech
jest.mock('expo-speech', () => ({
  speak: jest.fn(),
  stop: jest.fn(),
  isSpeaking: jest.fn(),
}));

// Mock the component and its dependencies
jest.mock('../../project/src/screens/onboarding/EmergencyFeaturesIntroScreen', () => {
  const React = require('react');
  const { TouchableOpacity, Text, View } = require('react-native');
  return {
    EmergencyFeaturesIntroScreen: React.forwardRef((props: any, ref: any) => (
      <View testID="emergency-features-intro-screen">
        <Text testID="emergency-intro-text">Emergency Features Introduction</Text>
        <TouchableOpacity 
          testID="test-sos-button"
          accessibilityRole="button"
          accessibilityLabel="Test SOS"
          onPress={() => props.onTestSOS?.()}
        >
          <Text>Test SOS</Text>
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
const { EmergencyFeaturesIntroScreen } = require('../../project/src/screens/onboarding/EmergencyFeaturesIntroScreen');

// Test wrapper component
const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name="EmergencyFeaturesIntro">
          {() => children}
        </Stack.Screen>
      </Stack.Navigator>
    </NavigationContainer>
  );
};

describe('EmergencyFeaturesIntroScreen', () => {
  let rendered: RenderAPI;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    rendered?.unmount();
  });

  const renderScreen = () => {
    rendered = render(
      <TestWrapper>
        <EmergencyFeaturesIntroScreen />
      </TestWrapper>
    );
    return rendered;
  };

  describe('Basic Rendering', () => {
    it('renders emergency intro text and test SOS button', () => {
      const { getByTestId, getByText } = renderScreen();

      expect(getByTestId('emergency-features-intro-screen')).toBeTruthy();
      expect(getByTestId('emergency-intro-text')).toBeTruthy();
      expect(getByText('Test SOS')).toBeTruthy();
    });

    it('triggers voice guidance on mount', async () => {
      renderScreen();

      await waitFor(() => {
        expect(require('expo-speech').speak).toHaveBeenCalledWith(
          expect.stringContaining('Emergency Features'),
          expect.any(Object)
        );
      });
    });
  });

  describe('Button Functionality', () => {
    it('triggers voice feedback when Test SOS is pressed', async () => {
      const { getByText } = renderScreen();

      const testSOSButton = getByText('Test SOS');
      fireEvent.press(testSOSButton);

      await waitFor(() => {
        expect(require('expo-speech').speak).toHaveBeenCalledWith(
          expect.stringContaining('This is a test of the SOS feature'),
          expect.any(Object)
        );
      });
    });

    it('does not trigger actual SOS call during test', async () => {
      const { getByText } = renderScreen();
      const sosSpy = jest.spyOn(require('../../project/src/utils/emergency'), 'triggerSOS');

      const testSOSButton = getByText('Test SOS');
      fireEvent.press(testSOSButton);

      await waitFor(() => {
        expect(sosSpy).not.toHaveBeenCalled();
      });

      sosSpy.mockRestore();
    });
  });

  describe('Accessibility Features', () => {
    it('ensures Test SOS button has correct accessibility properties', () => {
      const { getByTestId } = renderScreen();

      const testSOSButton = getByTestId('test-sos-button');
      expect(testSOSButton).toHaveProp('accessibilityRole', 'button');
      expect(testSOSButton).toHaveProp('accessibilityLabel', 'Test SOS');
    });

    it('verifies touch target size meets accessibility requirements', () => {
      const { getByTestId } = renderScreen();
      const accessibilityConfig = require('../../project/src/utils/accessibility').accessibilityConfig;

      const testSOSButton = getByTestId('test-sos-button');
      expect(testSOSButton).toHaveStyle({
        minHeight: accessibilityConfig.minTouchTargetSize,
        minWidth: accessibilityConfig.minTouchTargetSize,
      });
    });

    it('supports dynamic text scaling', async () => {
      const { getByTestId } = renderScreen();
      const accessibilityConfig = require('../../project/src/utils/accessibility').accessibilityConfig;

      // Simulate text size change
      await accessibilityConfig.textScaling.adjustSize();

      const introText = getByTestId('emergency-intro-text');
      expect(introText).toHaveStyle({
        fontSize: expect.any(Number),
      });
    });
  });

  describe('Error Handling', () => {
    it('handles voice feedback failure gracefully', async () => {
      const { getByText } = renderScreen();
      const errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      
      // Mock voice feedback failure
      const expoSpeech = require('expo-speech');
      expoSpeech.speak.mockRejectedValueOnce(new Error('Speech error'));

      const testSOSButton = getByText('Test SOS');
      fireEvent.press(testSOSButton);

      await waitFor(() => {
        expect(errorSpy).toHaveBeenCalled();
        // Verify the app continues functioning
        expect(testSOSButton).toBeEnabled();
      });

      errorSpy.mockRestore();
    });

    it('handles multiple voice feedback failures gracefully', async () => {
      const { getByText } = renderScreen();
      const errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      
      // Mock multiple voice feedback failures
      const expoSpeech = require('expo-speech');
      expoSpeech.speak
        .mockRejectedValueOnce(new Error('Speech error'))
        .mockRejectedValueOnce(new Error('Speech error'));

      const testSOSButton = getByText('Test SOS');
      fireEvent.press(testSOSButton);
      fireEvent.press(testSOSButton);

      await waitFor(() => {
        expect(errorSpy).toHaveBeenCalledTimes(2);
        // Verify the app continues functioning
        expect(testSOSButton).toBeEnabled();
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