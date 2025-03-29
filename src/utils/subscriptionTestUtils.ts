import { renderHook } from '@testing-library/react-hooks';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';
import { Platform } from 'react-native';
import { SUBSCRIPTION_PLANS } from '../hooks/useSubscription';

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  setItem: jest.fn(),
  getItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
}));

// Mock NetInfo
jest.mock('@react-native-community/netinfo', () => ({
  fetch: jest.fn(),
}));

export const mockSubscriptionData = {
  currentPlan: SUBSCRIPTION_PLANS.premium,
  status: 'active' as const,
  loading: false,
  error: null,
  nextBillingDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
  trial: false,
  lastSync: new Date().toISOString(),
  offlineChanges: false,
};

export const createTestScenarios = (hook: any) => [
  {
    name: 'State Persistence After Restart',
    description: 'Test if subscription state persists after app restart',
    setup: async () => {
      await AsyncStorage.setItem('@subscription_state', JSON.stringify(mockSubscriptionData));
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(JSON.stringify(mockSubscriptionData));
    },
    cleanup: async () => {
      await AsyncStorage.clear();
      jest.clearAllMocks();
    },
    test: async () => {
      const { result, waitForNextUpdate } = renderHook(() => hook('test-user'));
      await waitForNextUpdate();
      expect(result.current.subscription).toEqual(mockSubscriptionData);
    },
  },
  {
    name: 'Network Disconnection During Operation',
    description: 'Test subscription operations during network disconnection',
    setup: async () => {
      (NetInfo.fetch as jest.Mock).mockResolvedValue({ isConnected: false });
    },
    cleanup: async () => {
      jest.clearAllMocks();
    },
    test: async () => {
      const { result } = renderHook(() => hook('test-user'));
      await expect(result.current.checkSubscriptionStatus()).rejects.toThrow('Network Error');
    },
  },
];

export const createPerformanceScenarios = (hook: any) => [
  {
    name: 'Heavy Concurrent Operations',
    description: 'Test performance under heavy concurrent operations',
    setup: async () => {
      (NetInfo.fetch as jest.Mock).mockResolvedValue({ isConnected: true });
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(JSON.stringify(mockSubscriptionData));
    },
    cleanup: async () => {
      jest.clearAllMocks();
    },
    test: async () => {
      const { result, waitForNextUpdate } = renderHook(() => hook('test-user'));
      await waitForNextUpdate();
      const operations = Array(50).fill(null).map(() => result.current.checkSubscriptionStatus());
      await Promise.all(operations);
      expect(result.current.subscription.error).toBeNull();
    },
  },
];

export const createDeviceSpecificScenarios = (hook: any) => [
  {
    name: 'App Lifecycle Transitions',
    description: 'Test subscription state during app lifecycle transitions',
    platform: 'all' as const,
    setup: async () => {
      await AsyncStorage.setItem('@subscription_state', JSON.stringify(mockSubscriptionData));
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(JSON.stringify(mockSubscriptionData));
    },
    cleanup: async () => {
      await AsyncStorage.clear();
      jest.clearAllMocks();
    },
    test: async () => {
      const { result, waitForNextUpdate } = renderHook(() => hook('test-user'));
      await waitForNextUpdate();
      expect(result.current.subscription).toEqual(mockSubscriptionData);
    },
  },
]; 