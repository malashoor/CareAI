import React from 'react';
import { render, fireEvent, waitFor, RenderAPI } from '@testing-library/react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import '@testing-library/jest-native/extend-expect';

// Define navigation types
type RootStackParamList = {
  Welcome: undefined;
  AccessibilitySetup: undefined;
};

const Stack = createStackNavigator<RootStackParamList>();

// Mock the component and its dependencies
jest.mock('../../project/src/screens/onboarding/AccessibilitySetupScreen', () => {
  const React = require('react');
  return {
    AccessibilitySetupScreen: React.forwardRef((props: any, ref: any) => (
      <div data-testid="accessibility-setup-screen">Mocked AccessibilitySetupScreen</div>
    )),
  };
});

jest.mock('../../project/src/utils/voiceFeedback', () => ({
  voiceFeedback: {
    speak: jest.fn(),
  },
}));

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
    minTouchTargetSize: 44,
    getAccessibilityProps: jest.fn().mockImplementation((props) => ({
      ...props,
      accessibilityRole: props.role || 'none',
      accessibilityLabel: props.label || '',
      accessibilityHint: props.hint || '',
    })),
  },
}));

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
}));

// Import the mocked component
const { AccessibilitySetupScreen } = require('../../project/src/screens/onboarding/AccessibilitySetupScreen');

// Test wrapper component
const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name="AccessibilitySetup">
          {() => children}
        </Stack.Screen>
      </Stack.Navigator>
    </NavigationContainer>
  );
};

describe('AccessibilitySetupScreen', () => {
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
        <AccessibilitySetupScreen />
      </TestWrapper>
    );
    return rendered;
  };

  it('renders correctly with default settings', async () => {
    const { getByText, getByTestId } = renderScreen();

    // Check main elements are rendered
    expect(getByText('Accessibility Setup')).toBeTruthy();
    expect(getByText('Text Size')).toBeTruthy();
    expect(getByText('High Contrast')).toBeTruthy();
    expect(getByText('Voice Speed')).toBeTruthy();
    expect(getByText('Continue')).toBeTruthy();
    expect(getByText('Skip')).toBeTruthy();

    // Check accessibility labels
    expect(getByTestId('accessibility-setup-screen')).toBeTruthy();
  });

  it('handles font size changes correctly', async () => {
    const { getByText } = renderScreen();

    // Test changing font size
    const largeButton = getByText('Large');
    fireEvent.press(largeButton);

    await waitFor(() => {
      expect(AsyncStorage.setItem).toHaveBeenCalledWith('@accessibility_font_size', 'large');
      expect(require('../../project/src/utils/voiceFeedback').voiceFeedback.speak)
        .toHaveBeenCalledWith('Text size set to large');
    });
  });

  it('handles contrast mode toggle correctly', async () => {
    const { getByTestId } = renderScreen();

    const contrastToggle = getByTestId('high-contrast-toggle');
    fireEvent(contrastToggle, 'valueChange', true);

    await waitFor(() => {
      expect(AsyncStorage.setItem).toHaveBeenCalledWith('@accessibility_high_contrast', 'true');
      expect(require('../../project/src/utils/voiceFeedback').voiceFeedback.speak)
        .toHaveBeenCalledWith('High contrast mode enabled');
    });
  });

  it('handles voice speed selection correctly', async () => {
    const { getByText } = renderScreen();

    const slowButton = getByText('Slow');
    fireEvent.press(slowButton);

    await waitFor(() => {
      expect(AsyncStorage.setItem).toHaveBeenCalledWith('@accessibility_voice_speed', 'slow');
      expect(require('../../project/src/utils/voiceFeedback').voiceFeedback.speak)
        .toHaveBeenCalledWith('Voice speed set to slow');
    });
  });

  it('navigates to Welcome screen when Skip is pressed', () => {
    const { getByText } = renderScreen();
    const navigation = require('@react-navigation/native').useNavigation();

    const skipButton = getByText('Skip');
    fireEvent.press(skipButton);

    expect(navigation.navigate).toHaveBeenCalledWith('Welcome');
  });

  it('saves settings and navigates when Continue is pressed', async () => {
    const { getByText } = renderScreen();
    const navigation = require('@react-navigation/native').useNavigation();

    const continueButton = getByText('Continue');
    fireEvent.press(continueButton);

    await waitFor(() => {
      expect(navigation.navigate).toHaveBeenCalledWith('Welcome');
      expect(AsyncStorage.setItem).toHaveBeenCalled();
    });
  });

  it('loads saved settings on mount', async () => {
    // Mock previously saved settings
    (AsyncStorage.getItem as jest.Mock)
      .mockImplementation((key) => {
        switch (key) {
          case '@accessibility_font_size':
            return Promise.resolve('large');
          case '@accessibility_high_contrast':
            return Promise.resolve('true');
          case '@accessibility_voice_speed':
            return Promise.resolve('slow');
          default:
            return Promise.resolve(null);
        }
      });

    renderScreen();

    await waitFor(() => {
      expect(AsyncStorage.getItem).toHaveBeenCalledWith('@accessibility_font_size');
      expect(AsyncStorage.getItem).toHaveBeenCalledWith('@accessibility_high_contrast');
      expect(AsyncStorage.getItem).toHaveBeenCalledWith('@accessibility_voice_speed');
    });
  });

  it('verifies all interactive elements have accessibility props', () => {
    const { getByTestId, getAllByRole } = renderScreen();

    // Check main screen label
    expect(getByTestId('accessibility-setup-screen')).toBeTruthy();

    // Check header
    expect(getByTestId('accessibility-setup-header')).toBeTruthy();

    // Check all text elements have proper roles
    const textElements = getAllByRole('text');
    expect(textElements.length).toBeGreaterThan(0);

    // Check specific interactive elements
    expect(getByTestId('high-contrast-toggle')).toBeTruthy();
    expect(getByTestId('font-size-small')).toBeTruthy();
    expect(getByTestId('font-size-medium')).toBeTruthy();
    expect(getByTestId('font-size-large')).toBeTruthy();
    expect(getByTestId('voice-speed-slow')).toBeTruthy();
    expect(getByTestId('voice-speed-medium')).toBeTruthy();
  });

  // Snapshot test
  it('matches snapshot', () => {
    rendered = renderScreen();
    expect(rendered.toJSON()).toMatchSnapshot();
  });

  // Error Scenario Tests
  describe('Error Handling', () => {
    it('handles AsyncStorage save failure gracefully', async () => {
      const { getByText } = renderScreen();
      const errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      
      // Mock AsyncStorage failure
      (AsyncStorage.setItem as jest.Mock).mockRejectedValueOnce(new Error('Storage error'));

      const continueButton = getByText('Continue');
      fireEvent.press(continueButton);

      await waitFor(() => {
        expect(errorSpy).toHaveBeenCalled();
        // Verify the app doesn't crash and still attempts navigation
        expect(require('@react-navigation/native').useNavigation().navigate)
          .toHaveBeenCalledWith('Welcome');
      });

      errorSpy.mockRestore();
    });

    it('handles voice feedback failure gracefully', async () => {
      const { getByText } = renderScreen();
      const errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      
      // Mock voice feedback failure
      const voiceFeedback = require('../../project/src/utils/voiceFeedback').voiceFeedback;
      voiceFeedback.speak.mockRejectedValueOnce(new Error('Speech error'));

      const largeButton = getByText('Large');
      fireEvent.press(largeButton);

      await waitFor(() => {
        expect(errorSpy).toHaveBeenCalled();
        // Verify the app continues functioning
        expect(AsyncStorage.setItem).toHaveBeenCalledWith('@accessibility_font_size', 'large');
      });

      errorSpy.mockRestore();
    });

    it('handles multiple concurrent errors gracefully', async () => {
      const { getByText } = renderScreen();
      const errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      
      // Mock multiple failures
      (AsyncStorage.setItem as jest.Mock).mockRejectedValueOnce(new Error('Storage error'));
      const voiceFeedback = require('../../project/src/utils/voiceFeedback').voiceFeedback;
      voiceFeedback.speak.mockRejectedValueOnce(new Error('Speech error'));

      const continueButton = getByText('Continue');
      fireEvent.press(continueButton);

      await waitFor(() => {
        expect(errorSpy).toHaveBeenCalledTimes(2);
        // Verify the app still attempts navigation
        expect(require('@react-navigation/native').useNavigation().navigate)
          .toHaveBeenCalledWith('Welcome');
      });

      errorSpy.mockRestore();
    });
  });

  // Enhanced Accessibility Tests
  describe('Accessibility Features', () => {
    it('ensures all interactive elements have proper accessibility roles', () => {
      const { getAllByRole } = renderScreen();

      // Check for specific roles
      expect(getAllByRole('button')).toHaveLength(5); // Font size buttons, voice speed buttons, continue/skip
      expect(getAllByRole('switch')).toHaveLength(1); // High contrast toggle
      expect(getAllByRole('header')).toHaveLength(1); // Screen title
    });

    it('verifies accessibility labels are descriptive and unique', () => {
      const { getByLabelText } = renderScreen();

      // Check main elements
      expect(getByLabelText('Accessibility Setup Screen')).toBeTruthy();
      expect(getByLabelText('Text Size')).toBeTruthy();
      expect(getByLabelText('High Contrast')).toBeTruthy();
      expect(getByLabelText('Voice Speed')).toBeTruthy();
      expect(getByLabelText('Continue')).toBeTruthy();
      expect(getByLabelText('Skip')).toBeTruthy();
    });

    it('updates accessibility feedback when settings change', async () => {
      const { getByText, getByLabelText } = renderScreen();

      // Test font size change
      const largeButton = getByText('Large');
      fireEvent.press(largeButton);

      await waitFor(() => {
        expect(getByLabelText('large text size')).toHaveAccessibilityState({ selected: true });
      });

      // Test contrast mode
      const contrastToggle = getByLabelText('High contrast mode');
      fireEvent(contrastToggle, 'valueChange', true);

      await waitFor(() => {
        expect(contrastToggle).toHaveAccessibilityState({ checked: true });
      });
    });

    it('ensures proper touch target sizes for all interactive elements', () => {
      const { getByTestId } = renderScreen();
      const accessibilityConfig = require('../../project/src/utils/accessibility').accessibilityConfig;

      // Check all interactive elements
      const elements = [
        'font-size-small',
        'font-size-medium',
        'font-size-large',
        'high-contrast-toggle',
        'voice-speed-slow',
        'voice-speed-medium',
        'continue-button',
        'skip-button',
      ];

      elements.forEach(testId => {
        const element = getByTestId(testId);
        expect(element).toHaveStyle({
          minHeight: accessibilityConfig.minTouchTargetSize,
          minWidth: accessibilityConfig.minTouchTargetSize,
        });
      });
    });

    it('maintains accessibility state during loading and saving', async () => {
      const { getByText, getByLabelText } = renderScreen();

      // Mock slow AsyncStorage operation
      (AsyncStorage.setItem as jest.Mock).mockImplementation(() => 
        new Promise(resolve => setTimeout(resolve, 100))
      );

      const continueButton = getByText('Continue');
      fireEvent.press(continueButton);

      // Verify button remains accessible during save
      await waitFor(() => {
        expect(continueButton).toHaveAccessibilityState({ disabled: true });
        expect(getByLabelText('Saving settings...')).toBeTruthy();
      });

      // Verify button returns to normal state after save
      await waitFor(() => {
        expect(continueButton).toHaveAccessibilityState({ disabled: false });
      });
    });
  });
}); 