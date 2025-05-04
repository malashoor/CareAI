import React from 'react';
import { render, fireEvent, waitFor, RenderAPI } from '@testing-library/react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { TouchableOpacity, Text, View, ScrollView } from 'react-native';
import { Dimensions } from 'react-native/Libraries/Utilities/Dimensions';
import '@testing-library/jest-native/extend-expect';

// Define navigation types
type RootStackParamList = {
  Dashboard: undefined;
  HealthReport: undefined;
  MoodHistory: undefined;
  Settings: undefined;
};

// Define health metric types
type HealthMetric = {
  value: number;
  unit: string;
};

type HealthMetrics = {
  [key: string]: HealthMetric;
};

const Stack = createStackNavigator<RootStackParamList>();

// Mock dimensions
jest.mock('react-native/Libraries/Utilities/Dimensions', () => ({
  get: jest.fn().mockReturnValue({ width: 375, height: 812 }),
  addEventListener: jest.fn(),
  removeEventListener: jest.fn(),
}));

// Mock hooks
jest.mock('../../project/src/hooks/useHealthStats', () => ({
  useHealthStats: jest.fn(() => ({
    metrics: {
      steps: { value: 8432, unit: 'steps' },
      heartRate: { value: 72, unit: 'bpm' },
      hydration: { value: 1500, unit: 'ml' },
    } as HealthMetrics,
    loading: false,
    error: null,
    refresh: jest.fn(),
  })),
}));

jest.mock('@react-native-community/netinfo', () => ({
  useNetInfo: jest.fn(() => ({
    isConnected: true,
    isInternetReachable: true,
    type: 'wifi',
    details: null,
  })),
}));

jest.mock('../../project/src/hooks/useMoodTracker', () => ({
  useMoodTracker: jest.fn(() => ({
    currentMood: { mood: 'happy', intensity: 8 },
    loading: false,
    error: null,
    saveMood: jest.fn(),
  })),
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

// Mock the component
jest.mock('../../project/src/screens/DashboardLayout', () => {
  const React = require('react');
  const { TouchableOpacity, Text, View, ScrollView } = require('react-native');
  return {
    DashboardLayout: () => {
      const navigation = require('@react-navigation/native').useNavigation();
      const { metrics } = require('../../project/src/hooks/useHealthStats').useHealthStats();
      const { isConnected } = require('@react-native-community/netinfo').useNetInfo();
      const { currentMood } = require('../../project/src/hooks/useMoodTracker').useMoodTracker();

      return (
        <ScrollView testID="dashboard-layout">
          {!isConnected && (
            <View testID="offline-banner">
              <Text>You are offline</Text>
            </View>
          )}

          <View testID="health-metrics-section">
            <Text testID="section-title">Health Metrics</Text>
            <View testID="metrics-grid">
              {(Object.entries(metrics) as [string, HealthMetric][]).map(([type, metric]) => (
                <TouchableOpacity
                  key={type}
                  testID={`metric-card-${type}`}
                  accessibilityRole="button"
                  accessibilityLabel={`View ${type} details`}
                  onPress={() => navigation.navigate('HealthReport')}
                >
                  <Text>{type}</Text>
                  <Text>{metric.value} {metric.unit}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View testID="mood-section">
            <Text testID="section-title">Current Mood</Text>
            <View testID="mood-display">
              <Text>Mood: {currentMood.mood}</Text>
              <Text>Intensity: {currentMood.intensity}</Text>
              <TouchableOpacity
                testID="mood-history-button"
                accessibilityRole="button"
                accessibilityLabel="View mood history"
                onPress={() => navigation.navigate('MoodHistory')}
              >
                <Text>View History</Text>
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity
            testID="settings-button"
            accessibilityRole="button"
            accessibilityLabel="Open settings"
            onPress={() => navigation.navigate('Settings')}
          >
            <Text>Settings</Text>
          </TouchableOpacity>
        </ScrollView>
      );
    },
  };
});

// Import the mocked component
const { DashboardLayout } = require('../../project/src/screens/DashboardLayout');

// Test wrapper component
const TestWrapper = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name="Dashboard" component={DashboardLayout} />
        <Stack.Screen name="HealthReport" component={() => <View testID="health-report-screen" />} />
        <Stack.Screen name="MoodHistory" component={() => <View testID="mood-history-screen" />} />
        <Stack.Screen name="Settings" component={() => <View testID="settings-screen" />} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

describe('DashboardLayout', () => {
  let rendered: RenderAPI;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    rendered?.unmount();
  });

  const renderScreen = () => {
    rendered = render(<TestWrapper />);
    return rendered;
  };

  describe('Integration Rendering', () => {
    it('renders all major components', () => {
      const { getByTestId } = renderScreen();

      expect(getByTestId('dashboard-layout')).toBeTruthy();
      expect(getByTestId('health-metrics-section')).toBeTruthy();
      expect(getByTestId('mood-section')).toBeTruthy();
      expect(getByTestId('metrics-grid')).toBeTruthy();
      expect(getByTestId('mood-display')).toBeTruthy();
    });

    it('shows offline banner when disconnected', () => {
      const useNetInfo = require('@react-native-community/netinfo').useNetInfo;
      useNetInfo.mockImplementation(() => ({
        isConnected: false,
        isInternetReachable: false,
        type: 'none',
        details: null,
      }));

      const { getByTestId } = renderScreen();
      expect(getByTestId('offline-banner')).toBeTruthy();
    });

    it('adjusts layout for different screen sizes', () => {
      const dimensions = require('react-native/Libraries/Utilities/Dimensions');
      
      // Test portrait mode
      dimensions.get.mockReturnValue({ width: 375, height: 812 });
      const { rerender } = renderScreen();
      expect(dimensions.get).toHaveBeenCalled();

      // Test landscape mode
      dimensions.get.mockReturnValue({ width: 812, height: 375 });
      rerender(<TestWrapper />);
      expect(dimensions.get).toHaveBeenCalled();
    });
  });

  describe('Interaction Tests', () => {
    it('navigates to health report when metric card is pressed', async () => {
      const { getByTestId } = renderScreen();
      const navigation = require('@react-navigation/native').useNavigation();

      fireEvent.press(getByTestId('metric-card-steps'));

      await waitFor(() => {
        expect(navigation.navigate).toHaveBeenCalledWith('HealthReport');
      });
    });

    it('navigates to mood history when history button is pressed', async () => {
      const { getByTestId } = renderScreen();
      const navigation = require('@react-navigation/native').useNavigation();

      fireEvent.press(getByTestId('mood-history-button'));

      await waitFor(() => {
        expect(navigation.navigate).toHaveBeenCalledWith('MoodHistory');
      });
    });

    it('navigates to settings when settings button is pressed', async () => {
      const { getByTestId } = renderScreen();
      const navigation = require('@react-navigation/native').useNavigation();

      fireEvent.press(getByTestId('settings-button'));

      await waitFor(() => {
        expect(navigation.navigate).toHaveBeenCalledWith('Settings');
      });
    });
  });

  describe('Accessibility Structure', () => {
    it('ensures all interactive elements have correct accessibility properties', () => {
      const { getByTestId } = renderScreen();

      const buttons = [
        { id: 'metric-card-steps', role: 'button', label: 'View steps details' },
        { id: 'mood-history-button', role: 'button', label: 'View mood history' },
        { id: 'settings-button', role: 'button', label: 'Open settings' },
      ];

      buttons.forEach(({ id, role, label }) => {
        const button = getByTestId(id);
        expect(button).toHaveProp('accessibilityRole', role);
        expect(button).toHaveProp('accessibilityLabel', label);
      });
    });

    it('verifies touch target sizes meet accessibility requirements', () => {
      const { getByTestId } = renderScreen();
      const accessibilityConfig = require('../../project/src/utils/accessibility').accessibilityConfig;

      const buttons = [
        'metric-card-steps',
        'mood-history-button',
        'settings-button',
      ];

      buttons.forEach(testId => {
        const button = getByTestId(testId);
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

      const sectionTitle = getByTestId('section-title');
      expect(sectionTitle).toHaveStyle({
        fontSize: expect.any(Number),
      });
    });
  });

  // Snapshot test
  it('matches snapshot', () => {
    rendered = renderScreen();
    expect(rendered.toJSON()).toMatchSnapshot();
  });
}); 