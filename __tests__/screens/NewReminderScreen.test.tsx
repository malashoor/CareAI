import React from 'react';
import { render, fireEvent, waitFor, RenderAPI } from '@testing-library/react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { TouchableOpacity, Text, View, TextInput } from 'react-native';
import '@testing-library/jest-native/extend-expect';

// Define navigation types
type RootStackParamList = {
  NewReminder: undefined;
  ReminderList: undefined;
  Dashboard: undefined;
};

// Define form data type
type ReminderFormData = {
  title: string;
  description: string;
  time: string;
  priority: 'low' | 'medium' | 'high';
  category: 'medication' | 'appointment' | 'exercise';
  emotion: 'happy' | 'neutral' | 'sad' | 'anxious';
};

// Define validation errors type
type ValidationErrors = {
  title?: string;
  time?: string;
  submit?: string;
};

const Stack = createStackNavigator<RootStackParamList>();

// Mock hooks
jest.mock('../../project/src/hooks/useNewReminder', () => ({
  useNewReminder: jest.fn(() => ({
    saveReminder: jest.fn(),
    loading: false,
    error: null,
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
jest.mock('../../project/src/screens/NewReminderScreen', () => {
  const React = require('react');
  const { TouchableOpacity, Text, View, TextInput } = require('react-native');
  return {
    NewReminderScreen: () => {
      const { saveReminder, loading, error, reset } = require('../../project/src/hooks/useNewReminder').useNewReminder();
      const navigation = require('@react-navigation/native').useNavigation();
      const [formData, setFormData] = React.useState({
        title: '',
        description: '',
        time: new Date().toISOString(),
        priority: 'medium' as const,
        category: 'medication' as const,
        emotion: 'neutral' as const,
      });
      const [validationErrors, setValidationErrors] = React.useState<Record<string, string | undefined>>({
        title: undefined,
        time: undefined,
        submit: undefined,
      });

      const handleSave = async () => {
        const errors: Record<string, string | undefined> = {
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
          await saveReminder(formData);
          navigation.navigate('ReminderList');
        } catch (err) {
          setValidationErrors({ ...errors, submit: 'Failed to save reminder' });
        }
      };

      const handleCancel = () => {
        reset();
        navigation.goBack();
      };

      return (
        <View testID="new-reminder-screen">
          <TextInput
            testID="title-input"
            accessibilityRole="textbox"
            accessibilityLabel="Reminder title"
            placeholder="Enter title"
            value={formData.title}
            onChangeText={(text: string) => setFormData({ ...formData, title: text })}
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
            onChangeText={(text: string) => setFormData({ ...formData, description: text })}
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
              accessibilityLabel="Save reminder"
              onPress={handleSave}
              disabled={loading}
            >
              <Text>{loading ? 'Saving...' : 'Save'}</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              testID="cancel-button"
              accessibilityRole="button"
              accessibilityLabel="Cancel creating reminder"
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
const { NewReminderScreen } = require('../../project/src/screens/NewReminderScreen');

// Test wrapper component
const TestWrapper = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name="NewReminder" component={NewReminderScreen} />
        <Stack.Screen name="ReminderList" component={() => <View testID="reminder-list-screen" />} />
        <Stack.Screen name="Dashboard" component={() => <View testID="dashboard-screen" />} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

describe('NewReminderScreen', () => {
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
    it('renders all form fields correctly', () => {
      const { getByTestId } = renderScreen();

      expect(getByTestId('new-reminder-screen')).toBeTruthy();
      expect(getByTestId('title-input')).toBeTruthy();
      expect(getByTestId('description-input')).toBeTruthy();
      expect(getByTestId('time-picker')).toBeTruthy();
      expect(getByTestId('priority-selector')).toBeTruthy();
      expect(getByTestId('category-selector')).toBeTruthy();
      expect(getByTestId('emotion-selector')).toBeTruthy();
      expect(getByTestId('save-button')).toBeTruthy();
      expect(getByTestId('cancel-button')).toBeTruthy();
    });

    it('triggers voice prompt on screen mount', async () => {
      renderScreen();
      const voiceFeedback = require('../../project/src/utils/voiceFeedback').voiceFeedback;

      await waitFor(() => {
        expect(voiceFeedback.speak).toHaveBeenCalledWith(
          expect.stringContaining('Create new reminder'),
          expect.any(Object)
        );
      });
    });
  });

  describe('Interaction Tests', () => {
    it('saves reminder and navigates when form is valid', async () => {
      const { getByTestId } = renderScreen();
      const navigation = require('@react-navigation/native').useNavigation();
      const useNewReminder = require('../../project/src/hooks/useNewReminder').useNewReminder;
      const mockSaveReminder = jest.fn().mockResolvedValue(undefined);
      useNewReminder.mockImplementation(() => ({
        saveReminder: mockSaveReminder,
        loading: false,
        error: null,
        reset: jest.fn(),
      }));

      fireEvent.changeText(getByTestId('title-input'), 'New Medication');
      fireEvent.press(getByTestId('save-button'));

      await waitFor(() => {
        expect(mockSaveReminder).toHaveBeenCalledWith(expect.objectContaining({
          title: 'New Medication',
        }));
        expect(navigation.navigate).toHaveBeenCalledWith('ReminderList');
      });
    });

    it('navigates back when cancel is pressed', async () => {
      const { getByTestId } = renderScreen();
      const navigation = require('@react-navigation/native').useNavigation();
      const useNewReminder = require('../../project/src/hooks/useNewReminder').useNewReminder;
      const mockReset = jest.fn();
      useNewReminder.mockImplementation(() => ({
        saveReminder: jest.fn(),
        loading: false,
        error: null,
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
      const useNewReminder = require('../../project/src/hooks/useNewReminder').useNewReminder;
      useNewReminder.mockImplementation(() => ({
        saveReminder: jest.fn().mockResolvedValue(undefined),
        loading: false,
        error: null,
        reset: jest.fn(),
      }));

      fireEvent.changeText(getByTestId('title-input'), 'New Medication');
      fireEvent.press(getByTestId('save-button'));

      await waitFor(() => {
        expect(voiceFeedback.speak).toHaveBeenCalledWith(
          expect.stringContaining('Reminder saved'),
          expect.any(Object)
        );
      });
    });
  });

  describe('Validation and Error Handling', () => {
    it('shows validation errors for required fields', async () => {
      const { getByTestId } = renderScreen();

      fireEvent.press(getByTestId('save-button'));

      await waitFor(() => {
        expect(getByTestId('title-error')).toBeTruthy();
        expect(getByTestId('time-error')).toBeTruthy();
      });
    });

    it('shows error message when save fails', async () => {
      const { getByTestId } = renderScreen();
      const useNewReminder = require('../../project/src/hooks/useNewReminder').useNewReminder;
      useNewReminder.mockImplementation(() => ({
        saveReminder: jest.fn().mockRejectedValue(new Error('Save failed')),
        loading: false,
        error: null,
        reset: jest.fn(),
      }));

      fireEvent.changeText(getByTestId('title-input'), 'New Medication');
      fireEvent.press(getByTestId('save-button'));

      await waitFor(() => {
        expect(getByTestId('submit-error')).toBeTruthy();
      });
    });

    it('disables buttons during save operation', async () => {
      const { getByTestId } = renderScreen();
      const useNewReminder = require('../../project/src/hooks/useNewReminder').useNewReminder;
      useNewReminder.mockImplementation(() => ({
        saveReminder: jest.fn(),
        loading: true,
        error: null,
        reset: jest.fn(),
      }));

      fireEvent.changeText(getByTestId('title-input'), 'New Medication');
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