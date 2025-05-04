import React from 'react';
import { render, fireEvent, waitFor, RenderAPI } from '@testing-library/react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { TouchableOpacity, Text, View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import '@testing-library/jest-native/extend-expect';

// Define navigation types
type RootStackParamList = {
  Welcome: undefined;
  AccessibilitySetup: undefined;
  EmergencyFeaturesIntro: undefined;
  MedicationManagementIntro: undefined;
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

// Mock all onboarding screens
jest.mock('../../project/src/screens/onboarding/WelcomeScreen', () => ({
  WelcomeScreen: () => (
    <View testID="welcome-screen">
      <TouchableOpacity testID="start-button" onPress={() => {}}>
        <Text>Get Started</Text>
      </TouchableOpacity>
    </View>
  ),
}));

jest.mock('../../project/src/screens/onboarding/AccessibilitySetupScreen', () => ({
  AccessibilitySetupScreen: () => (
    <View testID="accessibility-setup-screen">
      <TouchableOpacity testID="continue-button" onPress={() => {}}>
        <Text>Continue</Text>
      </TouchableOpacity>
    </View>
  ),
}));

jest.mock('../../project/src/screens/onboarding/EmergencyFeaturesIntroScreen', () => ({
  EmergencyFeaturesIntroScreen: () => (
    <View testID="emergency-features-screen">
      <TouchableOpacity testID="next-button" onPress={() => {}}>
        <Text>Next</Text>
      </TouchableOpacity>
    </View>
  ),
}));

jest.mock('../../project/src/screens/onboarding/MedicationManagementIntroScreen', () => ({
  MedicationManagementIntroScreen: () => (
    <View testID="medication-management-screen">
      <TouchableOpacity testID="next-button" onPress={() => {}}>
        <Text>Next</Text>
      </TouchableOpacity>
    </View>
  ),
}));

jest.mock('../../project/src/screens/onboarding/PersonalizationScreen', () => ({
  PersonalizationScreen: () => (
    <View testID="personalization-screen">
      <TouchableOpacity testID="save-button" onPress={() => {}}>
        <Text>Save & Continue</Text>
      </TouchableOpacity>
    </View>
  ),
}));

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

// Test wrapper component
const TestWrapper = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name="Welcome" component={require('../../project/src/screens/onboarding/WelcomeScreen').WelcomeScreen} />
        <Stack.Screen name="AccessibilitySetup" component={require('../../project/src/screens/onboarding/AccessibilitySetupScreen').AccessibilitySetupScreen} />
        <Stack.Screen name="EmergencyFeaturesIntro" component={require('../../project/src/screens/onboarding/EmergencyFeaturesIntroScreen').EmergencyFeaturesIntroScreen} />
        <Stack.Screen name="MedicationManagementIntro" component={require('../../project/src/screens/onboarding/MedicationManagementIntroScreen').MedicationManagementIntroScreen} />
        <Stack.Screen name="Personalization" component={require('../../project/src/screens/onboarding/PersonalizationScreen').PersonalizationScreen} />
        <Stack.Screen name="Dashboard" component={() => <View testID="dashboard-screen" />} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

describe('Onboarding Flow', () => {
  let rendered: RenderAPI;

  beforeEach(() => {
    jest.clearAllMocks();
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);
    (AsyncStorage.setItem as jest.Mock).mockResolvedValue(undefined);
  });

  afterEach(() => {
    rendered?.unmount();
  });

  const renderFlow = () => {
    rendered = render(<TestWrapper />);
    return rendered;
  };

  describe('Full Onboarding Navigation', () => {
    it('completes the entire onboarding flow successfully', async () => {
      const { getByTestId } = renderFlow();

      // Welcome Screen
      expect(getByTestId('welcome-screen')).toBeTruthy();
      fireEvent.press(getByTestId('start-button'));

      // Accessibility Setup Screen
      await waitFor(() => {
        expect(getByTestId('accessibility-setup-screen')).toBeTruthy();
      });
      fireEvent.press(getByTestId('continue-button'));

      // Emergency Features Screen
      await waitFor(() => {
        expect(getByTestId('emergency-features-screen')).toBeTruthy();
      });
      fireEvent.press(getByTestId('next-button'));

      // Medication Management Screen
      await waitFor(() => {
        expect(getByTestId('medication-management-screen')).toBeTruthy();
      });
      fireEvent.press(getByTestId('next-button'));

      // Personalization Screen
      await waitFor(() => {
        expect(getByTestId('personalization-screen')).toBeTruthy();
      });
      fireEvent.press(getByTestId('save-button'));

      // Verify final navigation to Dashboard
      await waitFor(() => {
        expect(getByTestId('dashboard-screen')).toBeTruthy();
      });
    });

    it('preserves accessibility settings throughout the flow', async () => {
      const { getByTestId, getAllByRole } = renderFlow();

      // Navigate through screens
      fireEvent.press(getByTestId('start-button'));
      await waitFor(() => {
        expect(getByTestId('accessibility-setup-screen')).toBeTruthy();
      });

      // Verify accessibility roles at each screen
      const screens = [
        'accessibility-setup-screen',
        'emergency-features-screen',
        'medication-management-screen',
        'personalization-screen',
      ];

      for (const screen of screens) {
        await waitFor(() => {
          expect(getByTestId(screen)).toBeTruthy();
          const buttons = getAllByRole('button');
          expect(buttons.length).toBeGreaterThan(0);
          buttons.forEach(button => {
            expect(button).toHaveProp('accessibilityRole', 'button');
          });
        });
        fireEvent.press(getByTestId('next-button'));
      }
    });
  });

  describe('Settings Persistence', () => {
    it('saves all settings correctly during the flow', async () => {
      const { getByTestId } = renderFlow();

      // Navigate through screens
      fireEvent.press(getByTestId('start-button'));

      // Verify AsyncStorage calls
      await waitFor(() => {
        expect(AsyncStorage.setItem).toHaveBeenCalledWith(
          expect.stringMatching(/@accessibility_/),
          expect.any(String)
        );
      });

      // Complete the flow
      fireEvent.press(getByTestId('continue-button'));
      fireEvent.press(getByTestId('next-button'));
      fireEvent.press(getByTestId('next-button'));
      fireEvent.press(getByTestId('save-button'));

      // Verify final settings are saved
      await waitFor(() => {
        expect(AsyncStorage.setItem).toHaveBeenCalledWith(
          expect.stringMatching(/@accessibility_/),
          expect.any(String)
        );
      });
    });
  });

  describe('Error Resilience', () => {
    it('handles voice feedback failures gracefully', async () => {
      const { getByTestId } = renderFlow();
      const errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      
      // Mock voice feedback failure
      const expoSpeech = require('expo-speech');
      expoSpeech.speak.mockRejectedValueOnce(new Error('Speech error'));

      // Navigate through screens
      fireEvent.press(getByTestId('start-button'));
      fireEvent.press(getByTestId('continue-button'));
      fireEvent.press(getByTestId('next-button'));
      fireEvent.press(getByTestId('next-button'));
      fireEvent.press(getByTestId('save-button'));

      await waitFor(() => {
        expect(errorSpy).toHaveBeenCalled();
        expect(getByTestId('dashboard-screen')).toBeTruthy();
      });

      errorSpy.mockRestore();
    });

    it('handles AsyncStorage failures gracefully', async () => {
      const { getByTestId } = renderFlow();
      const errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      
      // Mock AsyncStorage failure
      (AsyncStorage.setItem as jest.Mock).mockRejectedValueOnce(new Error('Storage error'));

      // Navigate through screens
      fireEvent.press(getByTestId('start-button'));
      fireEvent.press(getByTestId('continue-button'));
      fireEvent.press(getByTestId('next-button'));
      fireEvent.press(getByTestId('next-button'));
      fireEvent.press(getByTestId('save-button'));

      await waitFor(() => {
        expect(errorSpy).toHaveBeenCalled();
        expect(getByTestId('dashboard-screen')).toBeTruthy();
      });

      errorSpy.mockRestore();
    });
  });

  // Snapshot tests for key screens
  describe('Snapshot Tests', () => {
    it('matches welcome screen snapshot', () => {
      const { getByTestId } = renderFlow();
      expect(getByTestId('welcome-screen')).toMatchSnapshot();
    });

    it('matches final screen snapshot', async () => {
      const { getByTestId } = renderFlow();
      
      // Navigate to final screen
      fireEvent.press(getByTestId('start-button'));
      fireEvent.press(getByTestId('continue-button'));
      fireEvent.press(getByTestId('next-button'));
      fireEvent.press(getByTestId('next-button'));
      fireEvent.press(getByTestId('save-button'));

      await waitFor(() => {
        expect(getByTestId('dashboard-screen')).toMatchSnapshot();
      });
    });
  });
}); 