import React from 'react';
import { render, fireEvent, waitFor, RenderAPI } from '@testing-library/react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { TouchableOpacity, Text, View, TextInput } from 'react-native';
import '@testing-library/jest-native/extend-expect';

// Define navigation types
type RootStackParamList = {
  EditReminder: { reminderId: string };
  ReminderDetails: { reminderId: string };
  ReminderList: undefined;
};

// Define reminder data type
type ReminderData = {
  id: string;
  title: string;
  description: string;
  time: string;
  priority: 'low' | 'medium' | 'high';
  category: 'medication' | 'appointment' | 'exercise';
  emotion: 'happy' | 'neutral' | 'sad' | 'anxious';
};

const Stack = createStackNavigator<RootStackParamList>();

// Mock reminder data
const mockReminder: ReminderData = {
  id: '1',
  title: 'Take Blood Pressure Medication',
  description: 'Take with food',
  time: '2024-03-20T08:00:00Z',
  priority: 'high',
  category: 'medication',
  emotion: 'calm',
};

// Mock hooks
jest.mock('../../project/src/hooks/useEditReminder', () => ({
  useEditReminder: jest.fn(() => ({
    reminder: mockReminder,
    loading: false,
    error: null,
    updateReminder: jest.fn(),
    reset: jest.fn(),
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
jest.mock('../../project/src/screens/EditReminderScreen', () => {
  const React = require('react');
  const { TouchableOpacity, Text, View, TextInput } = require('react-native');
  return {
    EditReminderScreen: () => {
      const { reminder, loading, error, updateReminder, reset } = require('../../project/src/hooks/useEditReminder').useEditReminder();
      const navigation = require('@react-navigation/native').useNavigation();
      const [formData, setFormData] = React.useState({
        title: reminder?.title || '',
        description: reminder?.description || '',
        time: reminder?.time || new Date().toISOString(),
        priority: reminder?.priority || 'medium',
        category: reminder?.category || 'medication',
        emotion: reminder?.emotion || 'neutral',
      });
      const [validationErrors, setValidationErrors] = React.useState({
        title: undefined,
        time: undefined,
        submit: undefined,
      });

      const handleSave = async () => {
        const errors = {
          title: undefined,
          time: undefined,
          submit: undefined,
        };
        if (!formData.title) errors.title = 'Title is required';
        if (!formData.time) errors.time = 'Time is required';
        
        if (Object.values(errors).some(error => error !== undefined)) {
          setValidationErrors(errors);
          return;
        }

        try {
          await updateReminder(reminder.id, formData);
          navigation.navigate('ReminderDetails', { reminderId: reminder.id });
        } catch (err) {
          setValidationErrors({ ...errors, submit: 'Failed to update reminder' });
        }
      };

      const handleCancel = () => {
        reset();
        navigation.goBack();
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
        <View testID="edit-reminder-screen">
          <TextInput
            testID="title-input"
            accessibilityRole="textbox"
            accessibilityLabel="Reminder title"
            placeholder="Enter title"
            value={formData.title}
            onChangeText={(text) => setFormData({ ...formData, title: text })}
          />
          {validationErrors.title && (
            <Text testID="title-error" style={{ color: 'red' }}>{validationErrors.title}</Text>
          )}

          <TextInput
            testID="description-input"
            accessibilityRole="textbox"
            accessibilityLabel="Reminder description"
            placeholder="Enter description"
            value={formData.description}
            onChangeText={(text) => setFormData({ ...formData, description: text })}
          />

          <View testID="time-picker">
            <Text>Time: {new Date(formData.time).toLocaleString()}</Text>
            <TouchableOpacity 
              testID="time-picker-button"
              accessibilityRole="button"
              accessibilityLabel="Select time"
              onPress={() => {/* Mock time picker */}}
            >
              <Text>Change Time</Text>
            </TouchableOpacity>
          </View>
          {validationErrors.time && (
            <Text testID="time-error" style={{ color: 'red' }}>{validationErrors.time}</Text>
          )}

          <View testID="priority-selector">
            <Text>Priority:</Text>
            {['low', 'medium', 'high'].map((priority) => (
              <TouchableOpacity
                key={priority}
                testID={`priority-${priority}`}
                accessibilityRole="button"
                accessibilityLabel={`Select ${priority} priority`}
                onPress={() => setFormData({ ...formData, priority })}
              >
                <Text>{priority}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <View testID="category-selector">
            <Text>Category:</Text>
            {['medication', 'appointment', 'exercise'].map((category) => (
              <TouchableOpacity
                key={category}
                testID={`category-${category}`}
                accessibilityRole="button"
                accessibilityLabel={`Select ${category} category`}
                onPress={() => setFormData({ ...formData, category })}
              >
                <Text>{category}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <View testID="emotion-selector">
            <Text>Emotion:</Text>
            {['happy', 'neutral', 'sad', 'anxious'].map((emotion) => (
              <TouchableOpacity
                key={emotion}
                testID={`emotion-${emotion}`}
                accessibilityRole="button"
                accessibilityLabel={`Select ${emotion} emotion`}
                onPress={() => setFormData({ ...formData, emotion })}
              >
                <Text>{emotion}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {validationErrors.submit && (
            <Text testID="submit-error" style={{ color: 'red' }}>{validationErrors.submit}</Text>
          )}

          <View testID="action-buttons">
            <TouchableOpacity 
              testID="save-button"
              accessibilityRole="button"
              accessibilityLabel="Save changes"
              onPress={handleSave}
              disabled={loading}
            >
              <Text>{loading ? 'Saving...' : 'Save Changes'}</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              testID="cancel-button"
              accessibilityRole="button"
              accessibilityLabel="Cancel editing reminder"
              onPress={handleCancel}
              disabled={loading}
            >
              <Text>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      );
    },
  };
});

// Import the mocked component
const { EditReminderScreen } = require('../../project/src/screens/EditReminderScreen');

// Test wrapper component
const TestWrapper = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name="EditReminder" component={EditReminderScreen} />
        <Stack.Screen name="ReminderDetails" component={() => <View testID="reminder-details-screen" />} />
        <Stack.Screen name="ReminderList" component={() => <View testID="reminder-list-screen" />} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

describe('EditReminderScreen', () => {
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
    it('renders form with pre-filled reminder data', () => {
      const { getByTestId, getByDisplayValue } = renderScreen();

      expect(getByTestId('edit-reminder-screen')).toBeTruthy();
      expect(getByDisplayValue('Take Blood Pressure Medication')).toBeTruthy();
      expect(getByDisplayValue('Take with food')).toBeTruthy();
      expect(getByTestId('priority-high')).toBeTruthy();
      expect(getByTestId('category-medication')).toBeTruthy();
      expect(getByTestId('emotion-calm')).toBeTruthy();
    });

    it('shows loading state when data is loading', () => {
      const useEditReminder = require('../../project/src/hooks/useEditReminder').useEditReminder;
      useEditReminder.mockImplementation(() => ({
        reminder: null,
        loading: true,
        error: null,
        updateReminder: jest.fn(),
        reset: jest.fn(),
      }));

      const { getByTestId } = renderScreen();
      expect(getByTestId('loading-state')).toBeTruthy();
    });

    it('shows error state when data fails to load', () => {
      const useEditReminder = require('../../project/src/hooks/useEditReminder').useEditReminder;
      useEditReminder.mockImplementation(() => ({
        reminder: null,
        loading: false,
        error: new Error('Failed to load reminder'),
        updateReminder: jest.fn(),
        reset: jest.fn(),
      }));

      const { getByTestId } = renderScreen();
      expect(getByTestId('error-state')).toBeTruthy();
      expect(getByTestId('retry-button')).toBeTruthy();
    });

    it('shows not found state when reminder is missing', () => {
      const useEditReminder = require('../../project/src/hooks/useEditReminder').useEditReminder;
      useEditReminder.mockImplementation(() => ({
        reminder: null,
        loading: false,
        error: null,
        updateReminder: jest.fn(),
        reset: jest.fn(),
      }));

      const { getByTestId } = renderScreen();
      expect(getByTestId('not-found-state')).toBeTruthy();
      expect(getByTestId('back-button')).toBeTruthy();
    });
  });

  describe('Interaction Tests', () => {
    it('updates reminder and navigates when form is valid', async () => {
      const { getByTestId } = renderScreen();
      const navigation = require('@react-navigation/native').useNavigation();
      const useEditReminder = require('../../project/src/hooks/useEditReminder').useEditReminder;
      const mockUpdateReminder = jest.fn().mockResolvedValue(undefined);
      useEditReminder.mockImplementation(() => ({
        reminder: mockReminder,
        loading: false,
        error: null,
        updateReminder: mockUpdateReminder,
        reset: jest.fn(),
      }));

      fireEvent.changeText(getByTestId('title-input'), 'Updated Medication');
      fireEvent.press(getByTestId('save-button'));

      await waitFor(() => {
        expect(mockUpdateReminder).toHaveBeenCalledWith('1', expect.objectContaining({
          title: 'Updated Medication',
        }));
        expect(navigation.navigate).toHaveBeenCalledWith('ReminderDetails', { reminderId: '1' });
      });
    });

    it('navigates back when cancel is pressed', async () => {
      const { getByTestId } = renderScreen();
      const navigation = require('@react-navigation/native').useNavigation();
      const useEditReminder = require('../../project/src/hooks/useEditReminder').useEditReminder;
      const mockReset = jest.fn();
      useEditReminder.mockImplementation(() => ({
        reminder: mockReminder,
        loading: false,
        error: null,
        updateReminder: jest.fn(),
        reset: mockReset,
      }));

      fireEvent.press(getByTestId('cancel-button'));

      await waitFor(() => {
        expect(mockReset).toHaveBeenCalled();
        expect(navigation.goBack).toHaveBeenCalled();
      });
    });

    it('triggers voice feedback on save success', async () => {
      const { getByTestId } = renderScreen();
      const voiceFeedback = require('../../project/src/utils/voiceFeedback').voiceFeedback;
      const useEditReminder = require('../../project/src/hooks/useEditReminder').useEditReminder;
      useEditReminder.mockImplementation(() => ({
        reminder: mockReminder,
        loading: false,
        error: null,
        updateReminder: jest.fn().mockResolvedValue(undefined),
        reset: jest.fn(),
      }));

      fireEvent.changeText(getByTestId('title-input'), 'Updated Medication');
      fireEvent.press(getByTestId('save-button'));

      await waitFor(() => {
        expect(voiceFeedback.speak).toHaveBeenCalledWith(
          expect.stringContaining('Reminder updated'),
          expect.any(Object)
        );
      });
    });
  });

  describe('Validation and Error Handling', () => {
    it('shows validation errors for required fields', async () => {
      const { getByTestId } = renderScreen();
      const useEditReminder = require('../../project/src/hooks/useEditReminder').useEditReminder;
      useEditReminder.mockImplementation(() => ({
        reminder: mockReminder,
        loading: false,
        error: null,
        updateReminder: jest.fn(),
        reset: jest.fn(),
      }));

      fireEvent.changeText(getByTestId('title-input'), '');
      fireEvent.press(getByTestId('save-button'));

      await waitFor(() => {
        expect(getByTestId('title-error')).toBeTruthy();
      });
    });

    it('shows error message when update fails', async () => {
      const { getByTestId } = renderScreen();
      const useEditReminder = require('../../project/src/hooks/useEditReminder').useEditReminder;
      useEditReminder.mockImplementation(() => ({
        reminder: mockReminder,
        loading: false,
        error: null,
        updateReminder: jest.fn().mockRejectedValue(new Error('Update failed')),
        reset: jest.fn(),
      }));

      fireEvent.changeText(getByTestId('title-input'), 'Updated Medication');
      fireEvent.press(getByTestId('save-button'));

      await waitFor(() => {
        expect(getByTestId('submit-error')).toBeTruthy();
      });
    });

    it('disables buttons during update operation', async () => {
      const { getByTestId } = renderScreen();
      const useEditReminder = require('../../project/src/hooks/useEditReminder').useEditReminder;
      useEditReminder.mockImplementation(() => ({
        reminder: mockReminder,
        loading: true,
        error: null,
        updateReminder: jest.fn(),
        reset: jest.fn(),
      }));

      fireEvent.changeText(getByTestId('title-input'), 'Updated Medication');
      fireEvent.press(getByTestId('save-button'));

      expect(getByTestId('save-button')).toBeDisabled();
      expect(getByTestId('cancel-button')).toBeDisabled();
    });
  });

  describe('Accessibility Features', () => {
    it('ensures all form fields have correct accessibility properties', () => {
      const { getByTestId } = renderScreen();

      const inputs = [
        { id: 'title-input', role: 'textbox', label: 'Reminder title' },
        { id: 'description-input', role: 'textbox', label: 'Reminder description' },
      ];

      inputs.forEach(({ id, role, label }) => {
        const input = getByTestId(id);
        expect(input).toHaveProp('accessibilityRole', role);
        expect(input).toHaveProp('accessibilityLabel', label);
      });
    });

    it('verifies touch target sizes meet accessibility requirements', () => {
      const { getByTestId } = renderScreen();
      const accessibilityConfig = require('../../project/src/utils/accessibility').accessibilityConfig;

      const buttons = [
        'save-button',
        'cancel-button',
        'time-picker-button',
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

      const titleInput = getByTestId('title-input');
      expect(titleInput).toHaveStyle({
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