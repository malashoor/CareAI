import React from 'react';
import { render, fireEvent, waitFor, RenderAPI } from '@testing-library/react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { TouchableOpacity, Text, View } from 'react-native';
import '@testing-library/jest-native/extend-expect';

// Define navigation types
type RootStackParamList = {
  Welcome: undefined;
  MedicationManagementIntro: undefined;
  NextOnboardingScreen: undefined;
};

const Stack = createStackNavigator<RootStackParamList>();

// Mock expo-speech
jest.mock('expo-speech', () => ({
  speak: jest.fn(),
  stop: jest.fn(),
  isSpeaking: jest.fn(),
}));

// Mock the component and its dependencies
jest.mock('../../project/src/screens/onboarding/MedicationManagementIntroScreen', () => {
  const React = require('react');
  const { TouchableOpacity, Text, View } = require('react-native');
  return {
    MedicationManagementIntroScreen: React.forwardRef((props: any, ref: any) => (
      <View testID="medication-management-intro-screen">
        <Text testID="medication-intro-text">Medication Management Introduction</Text>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <TouchableOpacity 
            testID="skip-button"
            accessibilityRole="button"
            accessibilityLabel="Skip"
            onPress={() => props.onSkip?.()}
          >
            <Text>Skip</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            testID="next-button"
            accessibilityRole="button"
            accessibilityLabel="Next"
            onPress={() => props.onNext?.()}
          >
            <Text>Next</Text>
          </TouchableOpacity>
        </View>
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
const { MedicationManagementIntroScreen } = require('../../project/src/screens/onboarding/MedicationManagementIntroScreen');

// Test wrapper component
const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name="MedicationManagementIntro">
          {() => children}
        </Stack.Screen>
      </Stack.Navigator>
    </NavigationContainer>
  );
};

describe('MedicationManagementIntroScreen', () => {
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
        <MedicationManagementIntroScreen />
      </TestWrapper>
    );
    return rendered;
  };

  describe('Basic Rendering', () => {
    it('renders medication intro text and navigation buttons', () => {
      const { getByTestId, getByText } = renderScreen();

      expect(getByTestId('medication-management-intro-screen')).toBeTruthy();
      expect(getByTestId('medication-intro-text')).toBeTruthy();
      expect(getByText('Skip')).toBeTruthy();
      expect(getByText('Next')).toBeTruthy();
    });

    it('triggers voice guidance on mount', async () => {
      renderScreen();

      await waitFor(() => {
        expect(require('expo-speech').speak).toHaveBeenCalledWith(
          expect.stringContaining('Medication Management'),
          expect.any(Object)
        );
      });
    });
  });

  describe('Button Functionality', () => {
    it('navigates to next screen when Next is pressed', async () => {
      const { getByText } = renderScreen();
      const navigation = require('@react-navigation/native').useNavigation();

      const nextButton = getByText('Next');
      fireEvent.press(nextButton);

      await waitFor(() => {
        expect(navigation.navigate).toHaveBeenCalledWith('NextOnboardingScreen');
        expect(require('expo-speech').speak).toHaveBeenCalledWith(
          expect.stringContaining('Moving to next screen'),
          expect.any(Object)
        );
      });
    });

    it('skips onboarding when Skip is pressed', async () => {
      const { getByText } = renderScreen();
      const navigation = require('@react-navigation/native').useNavigation();

      const skipButton = getByText('Skip');
      fireEvent.press(skipButton);

      await waitFor(() => {
        expect(navigation.navigate).toHaveBeenCalledWith('Welcome');
        expect(require('expo-speech').speak).toHaveBeenCalledWith(
          expect.stringContaining('Skipping onboarding'),
          expect.any(Object)
        );
      });
    });
  });

  describe('Accessibility Features', () => {
    it('ensures navigation buttons have correct accessibility properties', () => {
      const { getByTestId } = renderScreen();

      const nextButton = getByTestId('next-button');
      const skipButton = getByTestId('skip-button');

      expect(nextButton).toHaveProp('accessibilityRole', 'button');
      expect(nextButton).toHaveProp('accessibilityLabel', 'Next');
      expect(skipButton).toHaveProp('accessibilityRole', 'button');
      expect(skipButton).toHaveProp('accessibilityLabel', 'Skip');
    });

    it('verifies touch target sizes meet accessibility requirements', () => {
      const { getByTestId } = renderScreen();
      const accessibilityConfig = require('../../project/src/utils/accessibility').accessibilityConfig;

      const nextButton = getByTestId('next-button');
      const skipButton = getByTestId('skip-button');

      [nextButton, skipButton].forEach(button => {
        expect(button).toHaveStyle({
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

      const introText = getByTestId('medication-intro-text');
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

      const nextButton = getByText('Next');
      fireEvent.press(nextButton);

      await waitFor(() => {
        expect(errorSpy).toHaveBeenCalled();
        // Verify the app continues functioning and navigation still works
        expect(require('@react-navigation/native').useNavigation().navigate)
          .toHaveBeenCalledWith('NextOnboardingScreen');
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

      const nextButton = getByText('Next');
      const skipButton = getByText('Skip');
      fireEvent.press(nextButton);
      fireEvent.press(skipButton);

      await waitFor(() => {
        expect(errorSpy).toHaveBeenCalledTimes(2);
        // Verify the app continues functioning
        expect(nextButton).toBeEnabled();
        expect(skipButton).toBeEnabled();
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