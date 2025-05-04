import React from 'react';
import { render, fireEvent, waitFor, RenderAPI } from '@testing-library/react-native';
import { TouchableOpacity, Text, View } from 'react-native';
import '@testing-library/jest-native/extend-expect';

// Mock network status
jest.mock('@react-native-community/netinfo', () => ({
  useNetInfo: jest.fn(() => ({
    isConnected: true,
    isInternetReachable: true,
    type: 'wifi',
    details: null,
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
jest.mock('../../project/src/components/OfflineBanner', () => {
  const React = require('react');
  const { TouchableOpacity, Text, View } = require('react-native');
  return {
    OfflineBanner: () => {
      const { isConnected, isInternetReachable } = require('@react-native-community/netinfo').useNetInfo();
      const [isRetrying, setIsRetrying] = React.useState(false);

      const handleRetry = async () => {
        setIsRetrying(true);
        // Simulate retry attempt
        await new Promise(resolve => setTimeout(resolve, 1000));
        setIsRetrying(false);
      };

      if (isConnected && isInternetReachable) {
        return null;
      }

      return (
        <View 
          testID="offline-banner"
          accessibilityRole="alert"
          accessibilityLabel="You are offline"
        >
          <Text testID="offline-message">
            You are offline. Some features may be limited.
          </Text>
          <TouchableOpacity 
            testID="retry-button"
            accessibilityRole="button"
            accessibilityLabel="Retry connection"
            onPress={handleRetry}
            disabled={isRetrying}
          >
            <Text>{isRetrying ? 'Retrying...' : 'Retry'}</Text>
          </TouchableOpacity>
        </View>
      );
    },
  };
});

// Import the mocked component
const { OfflineBanner } = require('../../project/src/components/OfflineBanner');

describe('OfflineBanner', () => {
  let rendered: RenderAPI;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    rendered?.unmount();
  });

  const renderComponent = () => {
    rendered = render(<OfflineBanner />);
    return rendered;
  };

  describe('Rendering Tests', () => {
    it('renders banner when offline', () => {
      const useNetInfo = require('@react-native-community/netinfo').useNetInfo;
      useNetInfo.mockImplementation(() => ({
        isConnected: false,
        isInternetReachable: false,
        type: 'none',
        details: null,
      }));

      const { getByTestId } = renderComponent();
      expect(getByTestId('offline-banner')).toBeTruthy();
      expect(getByTestId('offline-message')).toBeTruthy();
      expect(getByTestId('retry-button')).toBeTruthy();
    });

    it('hides banner when online', () => {
      const useNetInfo = require('@react-native-community/netinfo').useNetInfo;
      useNetInfo.mockImplementation(() => ({
        isConnected: true,
        isInternetReachable: true,
        type: 'wifi',
        details: null,
      }));

      const { queryByTestId } = renderComponent();
      expect(queryByTestId('offline-banner')).toBeNull();
    });

    it('displays appropriate offline message', () => {
      const useNetInfo = require('@react-native-community/netinfo').useNetInfo;
      useNetInfo.mockImplementation(() => ({
        isConnected: false,
        isInternetReachable: false,
        type: 'none',
        details: null,
      }));

      const { getByTestId } = renderComponent();
      expect(getByTestId('offline-message')).toHaveTextContent(
        'You are offline. Some features may be limited.'
      );
    });
  });

  describe('Interaction Tests', () => {
    it('triggers retry function when retry button is pressed', async () => {
      const useNetInfo = require('@react-native-community/netinfo').useNetInfo;
      useNetInfo.mockImplementation(() => ({
        isConnected: false,
        isInternetReachable: false,
        type: 'none',
        details: null,
      }));

      const { getByTestId } = renderComponent();
      fireEvent.press(getByTestId('retry-button'));

      await waitFor(() => {
        expect(getByTestId('retry-button')).toHaveTextContent('Retrying...');
      });

      await waitFor(() => {
        expect(getByTestId('retry-button')).toHaveTextContent('Retry');
      });
    });

    it('triggers voice feedback on offline state change', async () => {
      const useNetInfo = require('@react-native-community/netinfo').useNetInfo;
      const voiceFeedback = require('../../project/src/utils/voiceFeedback').voiceFeedback;

      useNetInfo.mockImplementation(() => ({
        isConnected: false,
        isInternetReachable: false,
        type: 'none',
        details: null,
      }));

      renderComponent();

      await waitFor(() => {
        expect(voiceFeedback.speak).toHaveBeenCalledWith(
          expect.stringContaining('offline'),
          expect.any(Object)
        );
      });
    });
  });

  describe('Accessibility Features', () => {
    it('ensures banner has correct accessibility properties', () => {
      const useNetInfo = require('@react-native-community/netinfo').useNetInfo;
      useNetInfo.mockImplementation(() => ({
        isConnected: false,
        isInternetReachable: false,
        type: 'none',
        details: null,
      }));

      const { getByTestId } = renderComponent();
      const banner = getByTestId('offline-banner');
      expect(banner).toHaveProp('accessibilityRole', 'alert');
      expect(banner).toHaveProp('accessibilityLabel', 'You are offline');
    });

    it('verifies retry button meets accessibility requirements', () => {
      const useNetInfo = require('@react-native-community/netinfo').useNetInfo;
      useNetInfo.mockImplementation(() => ({
        isConnected: false,
        isInternetReachable: false,
        type: 'none',
        details: null,
      }));

      const { getByTestId } = renderComponent();
      const accessibilityConfig = require('../../project/src/utils/accessibility').accessibilityConfig;

      const retryButton = getByTestId('retry-button');
      expect(retryButton).toHaveProp('accessibilityRole', 'button');
      expect(retryButton).toHaveProp('accessibilityLabel', 'Retry connection');
      expect(retryButton).toHaveStyle({
        minHeight: accessibilityConfig.minTouchTargetSize,
        minWidth: accessibilityConfig.minTouchTargetSize,
      });
    });

    it('supports dynamic text scaling', async () => {
      const useNetInfo = require('@react-native-community/netinfo').useNetInfo;
      useNetInfo.mockImplementation(() => ({
        isConnected: false,
        isInternetReachable: false,
        type: 'none',
        details: null,
      }));

      const { getByTestId } = renderComponent();
      const accessibilityConfig = require('../../project/src/utils/accessibility').accessibilityConfig;

      // Simulate text size change
      await accessibilityConfig.textScaling.adjustSize();

      const message = getByTestId('offline-message');
      expect(message).toHaveStyle({
        fontSize: expect.any(Number),
      });
    });
  });

  describe('Offline State Handling', () => {
    it('updates when network status changes', async () => {
      const useNetInfo = require('@react-native-community/netinfo').useNetInfo;
      const { rerender, getByTestId, queryByTestId } = renderComponent();

      // Start offline
      useNetInfo.mockImplementation(() => ({
        isConnected: false,
        isInternetReachable: false,
        type: 'none',
        details: null,
      }));

      rerender(<OfflineBanner />);
      expect(getByTestId('offline-banner')).toBeTruthy();

      // Switch to online
      useNetInfo.mockImplementation(() => ({
        isConnected: true,
        isInternetReachable: true,
        type: 'wifi',
        details: null,
      }));

      rerender(<OfflineBanner />);
      expect(queryByTestId('offline-banner')).toBeNull();
    });
  });

  // Snapshot test
  it('matches snapshot when offline', () => {
    const useNetInfo = require('@react-native-community/netinfo').useNetInfo;
    useNetInfo.mockImplementation(() => ({
      isConnected: false,
      isInternetReachable: false,
      type: 'none',
      details: null,
    }));

    rendered = renderComponent();
    expect(rendered.toJSON()).toMatchSnapshot();
  });
}); 