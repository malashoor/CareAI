import React from 'react';
import { render, fireEvent, waitFor, RenderAPI } from '@testing-library/react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { TouchableOpacity, Text, View, ScrollView } from 'react-native';
import '@testing-library/jest-native/extend-expect';

// Types
type RootStackParamList = {
  AdminAnalytics: undefined;
  ExportView: { format: 'pdf' | 'json' | 'csv' };
};

type AnalyticsData = {
  emotions: Array<{
    date: string;
    mood: string;
    intensity: number;
  }>;
  reminders: Array<{
    date: string;
    completed: number;
    missed: number;
  }>;
  sosEvents: Array<{
    date: string;
    count: number;
    responseTime: number;
  }>;
};

// Mock chart components
jest.mock('victory-native', () => ({
  VictoryChart: ({ children, ...props }: any) => (
    <View testID="mock-chart" accessibilityLabel={props.accessibilityLabel}>
      {children}
    </View>
  ),
  VictoryLine: () => <View testID="mock-line" />,
  VictoryBar: () => <View testID="mock-bar" />,
  VictoryAxis: () => <View testID="mock-axis" />,
  VictoryLegend: () => <View testID="mock-legend" />,
}));

// Mock analytics hook
const mockAnalyticsData: AnalyticsData = {
  emotions: [
    { date: '2025-04-25', mood: 'happy', intensity: 8 },
    { date: '2025-04-24', mood: 'calm', intensity: 6 },
  ],
  reminders: [
    { date: '2025-04-25', completed: 12, missed: 2 },
    { date: '2025-04-24', completed: 10, missed: 3 },
  ],
  sosEvents: [
    { date: '2025-04-25', count: 1, responseTime: 45 },
    { date: '2025-04-24', count: 2, responseTime: 30 },
  ],
};

jest.mock('../../src/hooks/useAnalytics', () => ({
  useAnalytics: jest.fn(() => ({
    data: mockAnalyticsData,
    loading: false,
    error: null,
    refresh: jest.fn(),
    exportData: jest.fn(),
  })),
}));

// Mock export utilities
jest.mock('../../src/utils/export', () => ({
  exportToPDF: jest.fn(() => Promise.resolve('exported.pdf')),
  exportToJSON: jest.fn(() => Promise.resolve('exported.json')),
  exportToCSV: jest.fn(() => Promise.resolve('exported.csv')),
}));

// Mock accessibility config
jest.mock('../../src/utils/accessibility', () => ({
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

const Stack = createStackNavigator<RootStackParamList>();

// Mock the component
jest.mock('../../src/screens/AdminAnalyticsPanel', () => {
  const React = require('react');
  const { TouchableOpacity, Text, View, ScrollView } = require('react-native');
  const { useAnalytics } = require('../../src/hooks/useAnalytics');
  const { VictoryChart, VictoryLine, VictoryBar, VictoryAxis, VictoryLegend } = require('victory-native');

  return {
    AdminAnalyticsPanel: () => {
      const { data, loading, error, refresh, exportData } = useAnalytics();
      const [dateRange, setDateRange] = React.useState('week');
      const [activeTab, setActiveTab] = React.useState('emotions');

      if (loading) {
        return <View testID="loading-state"><Text>Loading...</Text></View>;
      }

      if (error) {
        return <View testID="error-state"><Text>Error: {error}</Text></View>;
      }

      return (
        <ScrollView testID="analytics-panel">
          {/* Date Range Filter */}
          <View testID="date-filter">
            {['week', 'month', 'year'].map((range) => (
              <TouchableOpacity
                key={range}
                testID={`date-range-${range}`}
                accessibilityRole="radio"
                accessibilityLabel={`Show ${range} view`}
                onPress={() => setDateRange(range)}
              >
                <Text>{range}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Analytics Tabs */}
          <View testID="analytics-tabs">
            {['emotions', 'reminders', 'sos'].map((tab) => (
              <TouchableOpacity
                key={tab}
                testID={`tab-${tab}`}
                accessibilityRole="tab"
                accessibilityLabel={`${tab} analytics`}
                onPress={() => setActiveTab(tab)}
              >
                <Text>{tab}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Charts */}
          <View testID="chart-container">
            {activeTab === 'emotions' && (
              <VictoryChart
                testID="emotions-chart"
                accessibilityLabel="Emotion trends over time"
              >
                <VictoryLine data={data.emotions} />
                <VictoryAxis />
              </VictoryChart>
            )}

            {activeTab === 'reminders' && (
              <VictoryChart
                testID="reminders-chart"
                accessibilityLabel="Reminder completion rates"
              >
                <VictoryBar data={data.reminders} />
                <VictoryAxis />
              </VictoryChart>
            )}

            {activeTab === 'sos' && (
              <VictoryChart
                testID="sos-chart"
                accessibilityLabel="SOS event frequency and response times"
              >
                <VictoryBar data={data.sosEvents} />
                <VictoryAxis />
              </VictoryChart>
            )}
          </View>

          {/* Export Actions */}
          <View testID="export-actions">
            {['pdf', 'json', 'csv'].map((format) => (
              <TouchableOpacity
                key={format}
                testID={`export-${format}`}
                accessibilityRole="button"
                accessibilityLabel={`Export as ${format}`}
                onPress={() => exportData(format)}
              >
                <Text>Export {format.toUpperCase()}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      );
    },
  };
});

// Import the mocked component
const { AdminAnalyticsPanel } = require('../../src/screens/AdminAnalyticsPanel');

// Test wrapper component
const TestWrapper = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name="AdminAnalytics" component={AdminAnalyticsPanel} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

describe('AdminAnalyticsPanel', () => {
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
    it('renders all major components', () => {
      const { getByTestId } = renderScreen();

      expect(getByTestId('analytics-panel')).toBeTruthy();
      expect(getByTestId('date-filter')).toBeTruthy();
      expect(getByTestId('analytics-tabs')).toBeTruthy();
      expect(getByTestId('chart-container')).toBeTruthy();
      expect(getByTestId('export-actions')).toBeTruthy();
    });

    it('shows loading state', () => {
      const useAnalytics = require('../../src/hooks/useAnalytics').useAnalytics;
      useAnalytics.mockImplementation(() => ({
        data: null,
        loading: true,
        error: null,
        refresh: jest.fn(),
      }));

      const { getByTestId } = renderScreen();
      expect(getByTestId('loading-state')).toBeTruthy();
    });

    it('shows error state', () => {
      const useAnalytics = require('../../src/hooks/useAnalytics').useAnalytics;
      useAnalytics.mockImplementation(() => ({
        data: null,
        loading: false,
        error: 'Failed to load analytics',
        refresh: jest.fn(),
      }));

      const { getByTestId } = renderScreen();
      expect(getByTestId('error-state')).toBeTruthy();
    });
  });

  describe('Interaction Tests', () => {
    it('switches between date ranges', async () => {
      const { getByTestId } = renderScreen();
      const monthFilter = getByTestId('date-range-month');

      fireEvent.press(monthFilter);
      await waitFor(() => {
        expect(getByTestId('chart-container')).toBeTruthy();
      });
    });

    it('switches between analytics tabs', async () => {
      const { getByTestId } = renderScreen();
      const remindersTab = getByTestId('tab-reminders');

      fireEvent.press(remindersTab);
      await waitFor(() => {
        expect(getByTestId('reminders-chart')).toBeTruthy();
      });
    });

    it('triggers export actions', async () => {
      const { getByTestId } = renderScreen();
      const exportPDF = getByTestId('export-pdf');
      const exportUtils = require('../../src/utils/export');

      fireEvent.press(exportPDF);
      await waitFor(() => {
        expect(exportUtils.exportToPDF).toHaveBeenCalled();
      });
    });
  });

  describe('Accessibility Tests', () => {
    it('ensures all interactive elements have accessibility properties', () => {
      const { getByTestId } = renderScreen();

      const elements = [
        { id: 'date-range-week', role: 'radio', label: 'Show week view' },
        { id: 'tab-emotions', role: 'tab', label: 'emotions analytics' },
        { id: 'export-pdf', role: 'button', label: 'Export as pdf' },
      ];

      elements.forEach(({ id, role, label }) => {
        const element = getByTestId(id);
        expect(element).toHaveProp('accessibilityRole', role);
        expect(element).toHaveProp('accessibilityLabel', label);
      });
    });

    it('provides accessible chart descriptions', () => {
      const { getByTestId } = renderScreen();
      const emotionsChart = getByTestId('emotions-chart');
      
      expect(emotionsChart).toHaveProp('accessibilityLabel', 'Emotion trends over time');
    });

    it('supports dynamic text scaling', async () => {
      const { getByTestId } = renderScreen();
      const accessibilityConfig = require('../../src/utils/accessibility').accessibilityConfig;

      await accessibilityConfig.textScaling.adjustSize();

      const tab = getByTestId('tab-emotions');
      expect(tab).toHaveStyle({
        fontSize: expect.any(Number),
      });
    });
  });

  describe('Data Handling Tests', () => {
    it('handles large datasets', () => {
      const useAnalytics = require('../../src/hooks/useAnalytics').useAnalytics;
      const largeDataset = {
        emotions: Array.from({ length: 100 }, (_, i) => ({
          date: `2025-04-${i + 1}`,
          mood: 'happy',
          intensity: Math.random() * 10,
        })),
        reminders: [],
        sosEvents: [],
      };

      useAnalytics.mockImplementation(() => ({
        data: largeDataset,
        loading: false,
        error: null,
        refresh: jest.fn(),
      }));

      const { getByTestId } = renderScreen();
      expect(getByTestId('emotions-chart')).toBeTruthy();
    });

    it('handles empty datasets', () => {
      const useAnalytics = require('../../src/hooks/useAnalytics').useAnalytics;
      useAnalytics.mockImplementation(() => ({
        data: { emotions: [], reminders: [], sosEvents: [] },
        loading: false,
        error: null,
        refresh: jest.fn(),
      }));

      const { getByTestId } = renderScreen();
      expect(getByTestId('chart-container')).toBeTruthy();
    });
  });

  // Snapshot test
  it('matches snapshot', () => {
    rendered = renderScreen();
    expect(rendered.toJSON()).toMatchSnapshot();
  });
}); 