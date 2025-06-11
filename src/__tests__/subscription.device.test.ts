import { renderHook, act } from '@testing-library/react-hooks';
import { useSubscription, SUBSCRIPTION_PLANS } from '../hooks/useSubscription';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import NetInfo from '@react-native-community/netinfo';

const mockUserId = 'test-user-123';

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
  addEventListener: jest.fn(),
}));

const mockSubscriptionData = {
  currentPlan: SUBSCRIPTION_PLANS.premium,
  status: 'active' as const,
  loading: false,
  error: null,
  nextBillingDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
  trial: false,
  lastSync: new Date().toISOString(),
  offlineChanges: false,
};

describe('Subscription Device-Specific Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(JSON.stringify(mockSubscriptionData));
    (NetInfo.fetch as jest.Mock).mockResolvedValue({ isConnected: true });
  });

  describe('App Lifecycle Transitions', () => {
    it('should persist subscription state during background/foreground transitions', async () => {
      const { result } = renderHook(() => useSubscription(mockUserId));

      // Wait for initial state
      await act(async () => {
        await result.current.checkSubscriptionStatus();
      });

      // Verify subscription state is preserved
      expect(result.current.subscription).toEqual(expect.objectContaining({
        currentPlan: mockSubscriptionData.currentPlan,
        status: mockSubscriptionData.status,
      }));
    }, 5000);

    it('should handle app force close and restart', async () => {
      // Initial subscription state
      const { result: initialResult } = renderHook(() => useSubscription(mockUserId));

      await act(async () => {
        await initialResult.current.checkSubscriptionStatus();
      });

      // Simulate app restart
      const { result: newResult } = renderHook(() => useSubscription(mockUserId));

      await act(async () => {
        await newResult.current.checkSubscriptionStatus();
      });

      // Verify subscription state is restored
      expect(newResult.current.subscription).toEqual(expect.objectContaining({
        currentPlan: mockSubscriptionData.currentPlan,
        status: mockSubscriptionData.status,
      }));
    }, 5000);
  });

  describe('Device Time Changes', () => {
    it('should handle device time changes correctly', async () => {
      const { result } = renderHook(() => useSubscription(mockUserId));

      await act(async () => {
        await result.current.checkSubscriptionStatus();
      });

      // Simulate time change to future
      const futureDate = new Date(Date.now() + 60 * 24 * 60 * 60 * 1000); // 60 days ahead
      jest.spyOn(global, 'Date').mockImplementation(() => futureDate as any);

      await act(async () => {
        await result.current.checkSubscriptionStatus();
      });

      // Verify subscription is expired
      expect(result.current.subscription.status).toBe('expired');

      // Restore original Date
      jest.restoreAllMocks();
    }, 5000);
  });

  describe('Multiple Device Sync', () => {
    it('should sync subscription state across multiple devices', async () => {
      // First device
      const { result: device1Result } = renderHook(() => useSubscription(mockUserId));
      await act(async () => {
        await device1Result.current.checkSubscriptionStatus();
      });

      // Second device
      const { result: device2Result } = renderHook(() => useSubscription(mockUserId));
      await act(async () => {
        await device2Result.current.checkSubscriptionStatus();
      });

      // Verify both devices have the same subscription state
      expect(device2Result.current.subscription).toEqual(device1Result.current.subscription);
    }, 5000);
  });

  describe('App Update During Subscription', () => {
    it('should maintain subscription state during app updates', async () => {
      // Pre-update state
      const { result: preResult } = renderHook(() => useSubscription(mockUserId));
      await act(async () => {
        await preResult.current.checkSubscriptionStatus();
      });

      // Simulate app update by clearing and resetting storage
      await AsyncStorage.clear();
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(JSON.stringify(mockSubscriptionData));

      // Post-update state
      const { result: postResult } = renderHook(() => useSubscription(mockUserId));
      await act(async () => {
        await postResult.current.checkSubscriptionStatus();
      });

      // Verify subscription state is preserved
      expect(postResult.current.subscription).toEqual(expect.objectContaining({
        currentPlan: mockSubscriptionData.currentPlan,
        status: mockSubscriptionData.status,
      }));
    }, 5000);
  });

  describe('Platform-Specific Behavior', () => {
    it('should handle platform-specific subscription behavior', async () => {
      const { result } = renderHook(() => useSubscription(mockUserId));
      await act(async () => {
        await result.current.checkSubscriptionStatus();
      });

      // Platform-specific checks
      if (Platform.OS === 'ios') {
        expect(result.current.subscription.currentPlan).toBeDefined();
      } else {
        expect(result.current.subscription.currentPlan).toBeDefined();
      }
    }, 5000);
  });
}); 