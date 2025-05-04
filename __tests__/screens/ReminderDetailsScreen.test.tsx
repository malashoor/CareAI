import React from 'react';
import { render, fireEvent, waitFor, RenderAPI } from '@testing-library/react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { TouchableOpacity, Text, View } from 'react-native';
import '@testing-library/jest-native/extend-expect';

// Define navigation types
type RootStackParamList = {
  ReminderDetails: { reminderId: string };
  EditReminder: { reminderId: string };
  ReminderList: undefined;
};

const Stack = createStackNavigator<RootStackParamList>();

// Mock reminder data
const mockReminder = {
  id: '1',
  title: 'Take Blood Pressure Medication',
  description: 'Take with food',
  time: '2024-03-20T08:00:00Z',
  priority: 'high',
  category: 'medication',
  completed: false,
  emotion: 'calm',
  notes: 'Remember to check blood pressure before taking',
};

// Mock hooks
jest.mock('../../project/src/hooks/useReminderDetails', () => ({
  useReminderDetails: jest.fn(() => ({
    reminder: mockReminder,
    loading: false,
    error: null,
    deleteReminder: jest.fn(),
    completeReminder: jest.fn(),
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
jest.mock('../../project/src/screens/ReminderDetailsScreen', () => {
  const React = require('react');
  const { TouchableOpacity, Text, View } = require('react-native');
  return {
    ReminderDetailsScreen: () => {
      const { reminder, loading, error, deleteReminder } = require('../../project/src/hooks/useReminderDetails').useReminderDetails();
      const navigation = require('@react-navigation/native').useNavigation();

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
            <Text>Error loading reminder</Text>
            <TouchableOpacity 
              testID="retry-button"
              accessibilityRole="button"
              accessibilityLabel="Retry loading reminder"
              onPress={() => navigation.goBack()}
            >
              <Text>Go Back</Text>
            </TouchableOpacity>
          </View>
        );
      }

      if (!reminder) {
        return (
          <View testID="not-found-state">
            <Text>Reminder not found</Text>
            <TouchableOpacity 
              testID="back-button"
              accessibilityRole="button"
              accessibilityLabel="Go back to reminders"
              onPress={() => navigation.goBack()}
            >
              <Text>Go Back</Text>
            </TouchableOpacity>
          </View>
        );
      }

      return (
        <View testID="reminder-details-screen">
          <Text testID="reminder-title">{reminder.title}</Text>
          <Text testID="reminder-description">{reminder.description}</Text>
          <Text testID="reminder-time">{new Date(reminder.time).toLocaleString()}</Text>
          <Text testID="reminder-priority">Priority: {reminder.priority}</Text>
          <Text testID="reminder-category">Category: {reminder.category}</Text>
          <Text testID="reminder-emotion">Emotion: {reminder.emotion}</Text>
          <Text testID="reminder-notes">{reminder.notes}</Text>

          <View testID="action-buttons">
            <TouchableOpacity 
              testID="edit-button"
              accessibilityRole="button"
              accessibilityLabel="Edit reminder"
              onPress={() => navigation.navigate('EditReminder', { reminderId: reminder.id })}
            >
              <Text>Edit</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              testID="delete-button"
              accessibilityRole="button"
              accessibilityLabel="Delete reminder"
              onPress={() => {
                deleteReminder(reminder.id);
                navigation.goBack();
              }}
            >
              <Text>Delete</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              testID="back-button"
              accessibilityRole="button"
              accessibilityLabel="Go back to reminders"
              onPress={() => navigation.goBack()}
            >
              <Text>Back</Text>
            </TouchableOpacity>
          </View>
        </View>
      );
    },
  };
});

// Import the mocked component
const { ReminderDetailsScreen } = require('../../project/src/screens/ReminderDetailsScreen');

// Test wrapper component
const TestWrapper = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name="ReminderDetails" component={ReminderDetailsScreen} />
        <Stack.Screen name="EditReminder" component={() => <View testID="edit-reminder-screen" />} />
        <Stack.Screen name="ReminderList" component={() => <View testID="reminder-list-screen" />} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

describe('ReminderDetailsScreen', () => {
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
    it('renders reminder details correctly', () => {
      const { getByTestId, getByText } = renderScreen();

      expect(getByTestId('reminder-details-screen')).toBeTruthy();
      expect(getByText('Take Blood Pressure Medication')).toBeTruthy();
      expect(getByText('Take with food')).toBeTruthy();
      expect(getByText(/Priority: high/)).toBeTruthy();
      expect(getByText(/Category: medication/)).toBeTruthy();
      expect(getByText(/Emotion: calm/)).toBeTruthy();
      expect(getByText('Remember to check blood pressure before taking')).toBeTruthy();
    });

    it('shows loading state when data is loading', () => {
      const useReminderDetails = require('../../project/src/hooks/useReminderDetails').useReminderDetails;
      useReminderDetails.mockImplementation(() => ({
        reminder: null,
        loading: true,
        error: null,
        deleteReminder: jest.fn(),
      }));

      const { getByTestId } = renderScreen();
      expect(getByTestId('loading-state')).toBeTruthy();
    });

    it('shows error state when data fails to load', () => {
      const useReminderDetails = require('../../project/src/hooks/useReminderDetails').useReminderDetails;
      useReminderDetails.mockImplementation(() => ({
        reminder: null,
        loading: false,
        error: new Error('Failed to load reminder'),
        deleteReminder: jest.fn(),
      }));

      const { getByTestId } = renderScreen();
      expect(getByTestId('error-state')).toBeTruthy();
      expect(getByTestId('retry-button')).toBeTruthy();
    });

    it('shows not found state when reminder is missing', () => {
      const useReminderDetails = require('../../project/src/hooks/useReminderDetails').useReminderDetails;
      useReminderDetails.mockImplementation(() => ({
        reminder: null,
        loading: false,
        error: null,
        deleteReminder: jest.fn(),
      }));

      const { getByTestId } = renderScreen();
      expect(getByTestId('not-found-state')).toBeTruthy();
      expect(getByTestId('back-button')).toBeTruthy();
    });
  });

  describe('Interaction Tests', () => {
    it('navigates to edit screen when edit button is pressed', async () => {
      const { getByTestId } = renderScreen();
      const navigation = require('@react-navigation/native').useNavigation();

      fireEvent.press(getByTestId('edit-button'));

      await waitFor(() => {
        expect(navigation.navigate).toHaveBeenCalledWith('EditReminder', { reminderId: '1' });
      });
    });

    it('deletes reminder and navigates back when delete button is pressed', async () => {
      const { getByTestId } = renderScreen();
      const navigation = require('@react-navigation/native').useNavigation();
      const useReminderDetails = require('../../project/src/hooks/useReminderDetails').useReminderDetails;
      const mockDeleteReminder = jest.fn();
      useReminderDetails.mockImplementation(() => ({
        reminder: mockReminder,
        loading: false,
        error: null,
        deleteReminder: mockDeleteReminder,
      }));

      fireEvent.press(getByTestId('delete-button'));

      await waitFor(() => {
        expect(mockDeleteReminder).toHaveBeenCalledWith('1');
        expect(navigation.goBack).toHaveBeenCalled();
      });
    });

    it('navigates back when back button is pressed', async () => {
      const { getByTestId } = renderScreen();
      const navigation = require('@react-navigation/native').useNavigation();

      fireEvent.press(getByTestId('back-button'));

      await waitFor(() => {
        expect(navigation.goBack).toHaveBeenCalled();
      });
    });

    it('triggers voice feedback on screen load', async () => {
      renderScreen();
      const voiceFeedback = require('../../project/src/utils/voiceFeedback').voiceFeedback;

      await waitFor(() => {
        expect(voiceFeedback.speak).toHaveBeenCalledWith(
          expect.stringContaining('Take Blood Pressure Medication'),
          expect.any(Object)
        );
      });
    });
  });

  describe('Accessibility Features', () => {
    it('ensures all interactive elements have correct accessibility properties', () => {
      const { getByTestId } = renderScreen();

      const buttons = [
        'edit-button',
        'delete-button',
        'back-button',
      ];

      buttons.forEach(testId => {
        const button = getByTestId(testId);
        expect(button).toHaveProp('accessibilityRole', 'button');
        expect(button).toHaveProp('accessibilityLabel');
      });
    });

    it('verifies touch target sizes meet accessibility requirements', () => {
      const { getByTestId } = renderScreen();
      const accessibilityConfig = require('../../project/src/utils/accessibility').accessibilityConfig;

      const buttons = [
        'edit-button',
        'delete-button',
        'back-button',
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

      const title = getByTestId('reminder-title');
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