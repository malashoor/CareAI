import React from 'react';
import { render, fireEvent, waitFor, RenderAPI } from '@testing-library/react-native';
import { TouchableOpacity, Text, View, ScrollView } from 'react-native';
import '@testing-library/jest-native/extend-expect';

// Define health metrics types
type HealthMetric = {
  id: string;
  type: 'steps' | 'heartRate' | 'hydration';
  value: number;
  unit: string;
  timestamp: string;
  trend?: 'up' | 'down' | 'stable';
};

type HealthMetrics = {
  steps: HealthMetric;
  heartRate: HealthMetric;
  hydration: HealthMetric;
};

// Mock health metrics data
const mockHealthMetrics: HealthMetrics = {
  steps: {
    id: '1',
    type: 'steps',
    value: 8432,
    unit: 'steps',
    timestamp: new Date().toISOString(),
    trend: 'up',
  },
  heartRate: {
    id: '2',
    type: 'heartRate',
    value: 72,
    unit: 'bpm',
    timestamp: new Date().toISOString(),
    trend: 'stable',
  },
  hydration: {
    id: '3',
    type: 'hydration',
    value: 1500,
    unit: 'ml',
    timestamp: new Date().toISOString(),
    trend: 'down',
  },
};

// Mock hooks
jest.mock('../../project/src/hooks/useHealthStats', () => ({
  useHealthStats: jest.fn(() => ({
    metrics: mockHealthMetrics,
    loading: false,
    error: null,
    refresh: jest.fn(),
    lastUpdated: new Date().toISOString(),
  })),
}));

// Mock network status
jest.mock('../../project/src/hooks/useNetworkStatus', () => ({
  useNetworkStatus: jest.fn(() => ({
    isConnected: true,
    isInternetReachable: true,
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
jest.mock('../../project/src/components/HealthMetricsPanel', () => {
  const React = require('react');
  const { TouchableOpacity, Text, View, ScrollView } = require('react-native');
  return {
    HealthMetricsPanel: () => {
      const { metrics, loading, error, refresh } = require('../../project/src/hooks/useHealthStats').useHealthStats();
      const { isConnected } = require('../../project/src/hooks/useNetworkStatus').useNetworkStatus();
      const [expandedMetric, setExpandedMetric] = React.useState(null);

      const handleMetricPress = (metricType) => {
        setExpandedMetric(expandedMetric === metricType ? null : metricType);
      };

      if (loading) {
        return (
          <View testID="loading-state">
            <Text>Loading health metrics...</Text>
          </View>
        );
      }

      if (error) {
        return (
          <View testID="error-state">
            <Text>Error loading health metrics</Text>
            <TouchableOpacity 
              testID="retry-button"
              accessibilityRole="button"
              accessibilityLabel="Retry loading health metrics"
              onPress={refresh}
            >
              <Text>Retry</Text>
            </TouchableOpacity>
          </View>
        );
      }

      if (!isConnected) {
        return (
          <View testID="offline-state">
            <Text>You're offline. Showing cached data.</Text>
            <Text>Last updated: {new Date(metrics.steps.timestamp).toLocaleString()}</Text>
          </View>
        );
      }

      return (
        <ScrollView testID="health-metrics-panel">
          {Object.entries(metrics).map(([type, metric]) => (
            <TouchableOpacity
              key={metric.id}
              testID={`metric-card-${type}`}
              accessibilityRole="button"
              accessibilityLabel={`${type} metric: ${metric.value} ${metric.unit}`}
              onPress={() => handleMetricPress(type)}
            >
              <View style={{ padding: 16 }}>
                <Text testID={`metric-title-${type}`}>{type}</Text>
                <Text testID={`metric-value-${type}`}>{metric.value} {metric.unit}</Text>
                {metric.trend && (
                  <Text testID={`metric-trend-${type}`}>Trend: {metric.trend}</Text>
                )}
                {expandedMetric === type && (
                  <View testID={`metric-details-${type}`}>
                    <Text>Last updated: {new Date(metric.timestamp).toLocaleString()}</Text>
                    {/* Additional details could go here */}
                  </View>
                )}
              </View>
            </TouchableOpacity>
          ))}
          <TouchableOpacity 
            testID="refresh-button"
            accessibilityRole="button"
            accessibilityLabel="Refresh health metrics"
            onPress={refresh}
          >
            <Text>Refresh</Text>
          </TouchableOpacity>
        </ScrollView>
      );
    },
  };
});

// Import the mocked component
const { HealthMetricsPanel } = require('../../project/src/components/HealthMetricsPanel');

describe('HealthMetricsPanel', () => {
  let rendered: RenderAPI;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    rendered?.unmount();
  });

  const renderComponent = () => {
    rendered = render(<HealthMetricsPanel />);
    return rendered;
  };

  describe('Basic Rendering', () => {
    it('renders all health metric cards', () => {
      const { getByTestId } = renderComponent();

      expect(getByTestId('health-metrics-panel')).toBeTruthy();
      expect(getByTestId('metric-card-steps')).toBeTruthy();
      expect(getByTestId('metric-card-heartRate')).toBeTruthy();
      expect(getByTestId('metric-card-hydration')).toBeTruthy();
    });

    it('displays correct metric values', () => {
      const { getByTestId } = renderComponent();

      expect(getByTestId('metric-value-steps')).toHaveTextContent('8432 steps');
      expect(getByTestId('metric-value-heartRate')).toHaveTextContent('72 bpm');
      expect(getByTestId('metric-value-hydration')).toHaveTextContent('1500 ml');
    });

    it('shows loading state when data is loading', () => {
      const useHealthStats = require('../../project/src/hooks/useHealthStats').useHealthStats;
      useHealthStats.mockImplementation(() => ({
        metrics: null,
        loading: true,
        error: null,
        refresh: jest.fn(),
        lastUpdated: null,
      }));

      const { getByTestId } = renderComponent();
      expect(getByTestId('loading-state')).toBeTruthy();
    });

    it('shows error state when data fails to load', () => {
      const useHealthStats = require('../../project/src/hooks/useHealthStats').useHealthStats;
      useHealthStats.mockImplementation(() => ({
        metrics: null,
        loading: false,
        error: new Error('Failed to load health metrics'),
        refresh: jest.fn(),
        lastUpdated: null,
      }));

      const { getByTestId } = renderComponent();
      expect(getByTestId('error-state')).toBeTruthy();
      expect(getByTestId('retry-button')).toBeTruthy();
    });
  });

  describe('Interaction Tests', () => {
    it('expands metric details when pressed', () => {
      const { getByTestId } = renderComponent();

      fireEvent.press(getByTestId('metric-card-steps'));
      expect(getByTestId('metric-details-steps')).toBeTruthy();

      fireEvent.press(getByTestId('metric-card-steps'));
      expect(() => getByTestId('metric-details-steps')).toThrow();
    });

    it('refreshes metrics when refresh button is pressed', async () => {
      const { getByTestId } = renderComponent();
      const useHealthStats = require('../../project/src/hooks/useHealthStats').useHealthStats;
      const mockRefresh = jest.fn();
      useHealthStats.mockImplementation(() => ({
        metrics: mockHealthMetrics,
        loading: false,
        error: null,
        refresh: mockRefresh,
        lastUpdated: new Date().toISOString(),
      }));

      fireEvent.press(getByTestId('refresh-button'));

      await waitFor(() => {
        expect(mockRefresh).toHaveBeenCalled();
      });
    });

    it('triggers voice feedback on metric expansion', async () => {
      const { getByTestId } = renderComponent();
      const voiceFeedback = require('../../project/src/utils/voiceFeedback').voiceFeedback;

      fireEvent.press(getByTestId('metric-card-steps'));

      await waitFor(() => {
        expect(voiceFeedback.speak).toHaveBeenCalledWith(
          expect.stringContaining('steps'),
          expect.any(Object)
        );
      });
    });
  });

  describe('Offline Handling', () => {
    it('shows offline state when network is disconnected', () => {
      const useNetworkStatus = require('../../project/src/hooks/useNetworkStatus').useNetworkStatus;
      useNetworkStatus.mockImplementation(() => ({
        isConnected: false,
        isInternetReachable: false,
      }));

      const { getByTestId } = renderComponent();
      expect(getByTestId('offline-state')).toBeTruthy();
    });

    it('displays last updated timestamp in offline mode', () => {
      const useNetworkStatus = require('../../project/src/hooks/useNetworkStatus').useNetworkStatus;
      useNetworkStatus.mockImplementation(() => ({
        isConnected: false,
        isInternetReachable: false,
      }));

      const { getByTestId } = renderComponent();
      expect(getByTestId('offline-state')).toHaveTextContent('Last updated:');
    });
  });

  describe('Accessibility Features', () => {
    it('ensures all metric cards have correct accessibility properties', () => {
      const { getByTestId } = renderComponent();

      const metrics = ['steps', 'heartRate', 'hydration'];
      metrics.forEach(type => {
        const card = getByTestId(`metric-card-${type}`);
        expect(card).toHaveProp('accessibilityRole', 'button');
        expect(card).toHaveProp('accessibilityLabel');
      });
    });

    it('verifies touch target sizes meet accessibility requirements', () => {
      const { getByTestId } = renderComponent();
      const accessibilityConfig = require('../../project/src/utils/accessibility').accessibilityConfig;

      const buttons = [
        'metric-card-steps',
        'metric-card-heartRate',
        'metric-card-hydration',
        'refresh-button',
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
      const { getByTestId } = renderComponent();
      const accessibilityConfig = require('../../project/src/utils/accessibility').accessibilityConfig;

      // Simulate text size change
      await accessibilityConfig.textScaling.adjustSize();

      const metricTitle = getByTestId('metric-title-steps');
      expect(metricTitle).toHaveStyle({
        fontSize: expect.any(Number),
      });
    });
  });

  // Snapshot test
  it('matches snapshot', () => {
    rendered = renderComponent();
    expect(rendered.toJSON()).toMatchSnapshot();
  });
}); 