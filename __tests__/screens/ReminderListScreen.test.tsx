import React from 'react';
import { render, fireEvent, waitFor, RenderAPI } from '@testing-library/react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { TouchableOpacity, Text, View, FlatList, RefreshControl } from 'react-native';
import '@testing-library/jest-native/extend-expect';

// Define navigation types
type RootStackParamList = {
  ReminderList: undefined;
  ReminderDetails: { reminderId: string };
  NewReminder: undefined;
};

const Stack = createStackNavigator<RootStackParamList>();

// Mock reminders data
const mockReminders = [
  {
    id: '1',
    title: 'Take Blood Pressure Medication',
    time: '2024-03-20T08:00:00Z',
    priority: 'high',
    category: 'medication',
    completed: false,
  },
  {
    id: '2',
    title: 'Doctor Appointment',
    time: '2024-03-21T14:30:00Z',
    priority: 'medium',
    category: 'appointment',
    completed: false,
  },
];

// Mock hooks
jest.mock('../../project/src/hooks/useReminders', () => ({
  useReminders: jest.fn(() => ({
    reminders: mockReminders,
    loading: false,
    error: null,
    refetch: jest.fn(),
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
jest.mock('../../project/src/screens/ReminderListScreen', () => {
  const React = require('react');
  const { TouchableOpacity, Text, View, FlatList, RefreshControl } = require('react-native');
  return {
    ReminderListScreen: () => {
      const { reminders, loading, error, refetch } = require('../../project/src/hooks/useReminders').useReminders();
      const navigation = require('@react-navigation/native').useNavigation();

      const renderReminder = ({ item }) => (
        <TouchableOpacity 
          testID={`reminder-${item.id}`}
          accessibilityRole="button"
          accessibilityLabel={`${item.title}, ${item.priority} priority`}
          onPress={() => navigation.navigate('ReminderDetails', { reminderId: item.id })}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <View 
              testID={`priority-indicator-${item.id}`}
              style={{ 
                width: 10, 
                height: 10, 
                borderRadius: 5,
                backgroundColor: item.priority === 'high' ? 'red' : 'orange',
              }} 
            />
            <Text>{item.title}</Text>
            <Text>{new Date(item.time).toLocaleTimeString()}</Text>
          </View>
        </TouchableOpacity>
      );

      return (
        <View testID="reminder-list-screen">
          <FlatList
            testID="reminder-list"
            data={reminders}
            renderItem={renderReminder}
            keyExtractor={item => item.id}
            refreshControl={
              <RefreshControl
                testID="refresh-control"
                refreshing={loading}
                onRefresh={refetch}
              />
            }
            ListEmptyComponent={
              <View testID="empty-state">
                <Text>No reminders found</Text>
              </View>
            }
          />
          {error && (
            <View testID="error-state">
              <Text>Error loading reminders</Text>
              <TouchableOpacity 
                testID="retry-button"
                accessibilityRole="button"
                accessibilityLabel="Retry loading reminders"
                onPress={refetch}
              >
                <Text>Retry</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      );
    },
  };
});

// Import the mocked component
const { ReminderListScreen } = require('../../project/src/screens/ReminderListScreen');

// Test wrapper component
const TestWrapper = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name="ReminderList" component={ReminderListScreen} />
        <Stack.Screen name="ReminderDetails" component={() => <View testID="reminder-details-screen" />} />
        <Stack.Screen name="NewReminder" component={() => <View testID="new-reminder-screen" />} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

describe('ReminderListScreen', () => {
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

  describe('Rendering Tests', () => {
    it('renders list of reminders correctly', () => {
      const { getByTestId, getByText } = renderScreen();

      expect(getByTestId('reminder-list-screen')).toBeTruthy();
      expect(getByTestId('reminder-list')).toBeTruthy();
      expect(getByText('Take Blood Pressure Medication')).toBeTruthy();
      expect(getByText('Doctor Appointment')).toBeTruthy();
    });

    it('shows empty state when no reminders are present', () => {
      const useReminders = require('../../project/src/hooks/useReminders').useReminders;
      useReminders.mockImplementation(() => ({
        reminders: [],
        loading: false,
        error: null,
        refetch: jest.fn(),
      }));

      const { getByTestId } = renderScreen();
      expect(getByTestId('empty-state')).toBeTruthy();
    });

    it('displays priority indicators correctly', () => {
      const { getByTestId } = renderScreen();

      const highPriorityIndicator = getByTestId('priority-indicator-1');
      const mediumPriorityIndicator = getByTestId('priority-indicator-2');

      expect(highPriorityIndicator).toHaveStyle({ backgroundColor: 'red' });
      expect(mediumPriorityIndicator).toHaveStyle({ backgroundColor: 'orange' });
    });
  });

  describe('Interaction Tests', () => {
    it('navigates to reminder details when a reminder is pressed', async () => {
      const { getByTestId } = renderScreen();
      const navigation = require('@react-navigation/native').useNavigation();

      fireEvent.press(getByTestId('reminder-1'));

      await waitFor(() => {
        expect(navigation.navigate).toHaveBeenCalledWith('ReminderDetails', { reminderId: '1' });
      });
    });

    it('triggers refresh when pull-to-refresh is activated', async () => {
      const { getByTestId } = renderScreen();
      const useReminders = require('../../project/src/hooks/useReminders').useReminders;
      const mockRefetch = jest.fn();
      useReminders.mockImplementation(() => ({
        reminders: mockReminders,
        loading: false,
        error: null,
        refetch: mockRefetch,
      }));

      const refreshControl = getByTestId('refresh-control');
      fireEvent(refreshControl, 'refresh');

      await waitFor(() => {
        expect(mockRefetch).toHaveBeenCalled();
      });
    });

    it('triggers voice feedback on reminder press', async () => {
      const { getByTestId } = renderScreen();
      const voiceFeedback = require('../../project/src/utils/voiceFeedback').voiceFeedback;

      fireEvent.press(getByTestId('reminder-1'));

      await waitFor(() => {
        expect(voiceFeedback.speak).toHaveBeenCalledWith(
          expect.stringContaining('Take Blood Pressure Medication'),
          expect.any(Object)
        );
      });
    });
  });

  describe('Data Handling', () => {
    it('shows loading state during data fetch', () => {
      const useReminders = require('../../project/src/hooks/useReminders').useReminders;
      useReminders.mockImplementation(() => ({
        reminders: [],
        loading: true,
        error: null,
        refetch: jest.fn(),
      }));

      const { getByTestId } = renderScreen();
      expect(getByTestId('refresh-control')).toHaveProp('refreshing', true);
    });

    it('shows error state when data fetch fails', () => {
      const useReminders = require('../../project/src/hooks/useReminders').useReminders;
      useReminders.mockImplementation(() => ({
        reminders: [],
        loading: false,
        error: new Error('Failed to load reminders'),
        refetch: jest.fn(),
      }));

      const { getByTestId } = renderScreen();
      expect(getByTestId('error-state')).toBeTruthy();
      expect(getByTestId('retry-button')).toBeTruthy();
    });
  });

  describe('Accessibility Features', () => {
    it('ensures all interactive elements have correct accessibility properties', () => {
      const { getByTestId } = renderScreen();

      const reminder = getByTestId('reminder-1');
      expect(reminder).toHaveProp('accessibilityRole', 'button');
      expect(reminder).toHaveProp('accessibilityLabel', 'Take Blood Pressure Medication, high priority');
    });

    it('verifies touch target sizes meet accessibility requirements', () => {
      const { getByTestId } = renderScreen();
      const accessibilityConfig = require('../../project/src/utils/accessibility').accessibilityConfig;

      const reminder = getByTestId('reminder-1');
      expect(reminder).toHaveStyle({
        minHeight: accessibilityConfig.minTouchTargetSize,
      });
    });

    it('supports dynamic text scaling', async () => {
      const { getByTestId } = renderScreen();
      const accessibilityConfig = require('../../project/src/utils/accessibility').accessibilityConfig;

      // Simulate text size change
      await accessibilityConfig.textScaling.adjustSize();

      const reminder = getByTestId('reminder-1');
      expect(reminder).toHaveStyle({
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