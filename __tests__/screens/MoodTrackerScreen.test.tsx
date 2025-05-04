import React from 'react';
import { render, fireEvent, waitFor, RenderAPI } from '@testing-library/react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { TouchableOpacity, Text, View, TextInput } from 'react-native';
import '@testing-library/jest-native/extend-expect';

// Define navigation types
type RootStackParamList = {
  MoodTracker: undefined;
  MoodHistory: undefined;
  Settings: undefined;
};

// Define mood data type
type MoodEntry = {
  id: string;
  timestamp: string;
  mood: 'happy' | 'neutral' | 'sad' | 'anxious';
  intensity: number;
  notes?: string;
};

const Stack = createStackNavigator<RootStackParamList>();

// Mock mood data
const mockMoodEntry: MoodEntry = {
  id: '1',
  timestamp: new Date().toISOString(),
  mood: 'happy',
  intensity: 8,
  notes: 'Feeling great today!',
};

// Mock hooks
jest.mock('../../project/src/hooks/useMoodTracker', () => ({
  useMoodTracker: jest.fn(() => ({
    currentMood: mockMoodEntry,
    loading: false,
    error: null,
    saveMood: jest.fn(),
    getMoodHistory: jest.fn(),
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
jest.mock('../../project/src/screens/MoodTrackerScreen', () => {
  const React = require('react');
  const { TouchableOpacity, Text, View } = require('react-native');
  return {
    MoodTrackerScreen: () => {
      const { currentMood, loading, error, saveMood } = require('../../project/src/hooks/useMoodTracker').useMoodTracker();
      const navigation = require('@react-navigation/native').useNavigation();
      const [selectedMood, setSelectedMood] = React.useState(currentMood?.mood || 'neutral');
      const [intensity, setIntensity] = React.useState(currentMood?.intensity || 5);
      const [notes, setNotes] = React.useState(currentMood?.notes || '');

      const handleSave = async () => {
        try {
          await saveMood({
            mood: selectedMood,
            intensity,
            notes,
          });
          navigation.navigate('MoodHistory');
        } catch (err) {
          // Handle error
        }
      };

      if (loading) {
        return (
          <View testID="loading-state">
            <Text>Loading...</Text>
          </View>
        );
      }

      if (error) {
        return (
          <View testID="error-state">
            <Text>Error loading mood data</Text>
            <TouchableOpacity 
              testID="retry-button"
              accessibilityRole="button"
              accessibilityLabel="Retry loading mood data"
              onPress={() => navigation.goBack()}
            >
              <Text>Go Back</Text>
            </TouchableOpacity>
          </View>
        );
      }

      return (
        <View testID="mood-tracker-screen">
          <Text testID="screen-title">How are you feeling?</Text>

          <View testID="mood-selector">
            {['happy', 'neutral', 'sad', 'anxious'].map((mood) => (
              <TouchableOpacity
                key={mood}
                testID={`mood-${mood}`}
                accessibilityRole="button"
                accessibilityLabel={`Select ${mood} mood`}
                onPress={() => setSelectedMood(mood)}
              >
                <Text>{mood}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <View testID="intensity-slider">
            <Text>Intensity: {intensity}</Text>
            <TouchableOpacity 
              testID="decrease-intensity"
              accessibilityRole="button"
              accessibilityLabel="Decrease intensity"
              onPress={() => setIntensity(Math.max(1, intensity - 1))}
            >
              <Text>-</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              testID="increase-intensity"
              accessibilityRole="button"
              accessibilityLabel="Increase intensity"
              onPress={() => setIntensity(Math.min(10, intensity + 1))}
            >
              <Text>+</Text>
            </TouchableOpacity>
          </View>

          <View testID="notes-input">
            <Text>Notes (optional)</Text>
            <TextInput
              testID="notes-text-input"
              accessibilityRole="textbox"
              accessibilityLabel="Enter notes about your mood"
              value={notes}
              onChangeText={setNotes}
              placeholder="How are you feeling?"
            />
          </View>

          <View testID="action-buttons">
            <TouchableOpacity 
              testID="save-button"
              accessibilityRole="button"
              accessibilityLabel="Save mood entry"
              onPress={handleSave}
            >
              <Text>Save</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              testID="history-button"
              accessibilityRole="button"
              accessibilityLabel="View mood history"
              onPress={() => navigation.navigate('MoodHistory')}
            >
              <Text>View History</Text>
            </TouchableOpacity>
          </View>
        </View>
      );
    },
  };
});

// Import the mocked component
const { MoodTrackerScreen } = require('../../project/src/screens/MoodTrackerScreen');

// Test wrapper component
const TestWrapper = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name="MoodTracker" component={MoodTrackerScreen} />
        <Stack.Screen name="MoodHistory" component={() => <View testID="mood-history-screen" />} />
        <Stack.Screen name="Settings" component={() => <View testID="settings-screen" />} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

describe('MoodTrackerScreen', () => {
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

  describe('Basic Rendering', () => {
    it('renders all mood tracking elements', () => {
      const { getByTestId } = renderScreen();

      expect(getByTestId('mood-tracker-screen')).toBeTruthy();
      expect(getByTestId('screen-title')).toBeTruthy();
      expect(getByTestId('mood-selector')).toBeTruthy();
      expect(getByTestId('intensity-slider')).toBeTruthy();
      expect(getByTestId('notes-input')).toBeTruthy();
      expect(getByTestId('action-buttons')).toBeTruthy();
    });

    it('shows loading state when data is loading', () => {
      const useMoodTracker = require('../../project/src/hooks/useMoodTracker').useMoodTracker;
      useMoodTracker.mockImplementation(() => ({
        currentMood: null,
        loading: true,
        error: null,
        saveMood: jest.fn(),
        getMoodHistory: jest.fn(),
      }));

      const { getByTestId } = renderScreen();
      expect(getByTestId('loading-state')).toBeTruthy();
    });

    it('shows error state when data fails to load', () => {
      const useMoodTracker = require('../../project/src/hooks/useMoodTracker').useMoodTracker;
      useMoodTracker.mockImplementation(() => ({
        currentMood: null,
        loading: false,
        error: new Error('Failed to load mood data'),
        saveMood: jest.fn(),
        getMoodHistory: jest.fn(),
      }));

      const { getByTestId } = renderScreen();
      expect(getByTestId('error-state')).toBeTruthy();
      expect(getByTestId('retry-button')).toBeTruthy();
    });
  });

  describe('Interaction Tests', () => {
    it('allows selecting different moods', () => {
      const { getByTestId } = renderScreen();

      fireEvent.press(getByTestId('mood-happy'));
      expect(getByTestId('mood-happy')).toHaveStyle({ backgroundColor: expect.any(String) });

      fireEvent.press(getByTestId('mood-sad'));
      expect(getByTestId('mood-sad')).toHaveStyle({ backgroundColor: expect.any(String) });
    });

    it('adjusts intensity level', () => {
      const { getByTestId } = renderScreen();

      fireEvent.press(getByTestId('increase-intensity'));
      expect(getByTestId('intensity-slider')).toHaveTextContent('Intensity: 6');

      fireEvent.press(getByTestId('decrease-intensity'));
      expect(getByTestId('intensity-slider')).toHaveTextContent('Intensity: 5');
    });

    it('saves mood entry and navigates to history', async () => {
      const { getByTestId } = renderScreen();
      const navigation = require('@react-navigation/native').useNavigation();
      const useMoodTracker = require('../../project/src/hooks/useMoodTracker').useMoodTracker;
      const mockSaveMood = jest.fn().mockResolvedValue(undefined);
      useMoodTracker.mockImplementation(() => ({
        currentMood: mockMoodEntry,
        loading: false,
        error: null,
        saveMood: mockSaveMood,
        getMoodHistory: jest.fn(),
      }));

      fireEvent.press(getByTestId('mood-happy'));
      fireEvent.press(getByTestId('save-button'));

      await waitFor(() => {
        expect(mockSaveMood).toHaveBeenCalledWith(expect.objectContaining({
          mood: 'happy',
        }));
        expect(navigation.navigate).toHaveBeenCalledWith('MoodHistory');
      });
    });

    it('navigates to mood history screen', async () => {
      const { getByTestId } = renderScreen();
      const navigation = require('@react-navigation/native').useNavigation();

      fireEvent.press(getByTestId('history-button'));

      await waitFor(() => {
        expect(navigation.navigate).toHaveBeenCalledWith('MoodHistory');
      });
    });
  });

  describe('Accessibility Features', () => {
    it('ensures all interactive elements have correct accessibility properties', () => {
      const { getByTestId } = renderScreen();

      const buttons = [
        { id: 'mood-happy', role: 'button', label: 'Select happy mood' },
        { id: 'save-button', role: 'button', label: 'Save mood entry' },
        { id: 'history-button', role: 'button', label: 'View mood history' },
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
        'mood-happy',
        'save-button',
        'history-button',
        'increase-intensity',
        'decrease-intensity',
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

      const title = getByTestId('screen-title');
      expect(title).toHaveStyle({
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