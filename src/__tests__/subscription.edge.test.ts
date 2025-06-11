import { renderHook, act } from '@testing-library/react-hooks';
import { useSubscription, SUBSCRIPTION_PLANS } from '../hooks/useSubscription';
import AsyncStorage from '@react-native-async-storage/async-storage';
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

describe('Subscription Edge Cases', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(JSON.stringify(mockSubscriptionData));
    (NetInfo.fetch as jest.Mock).mockResolvedValue({ isConnected: true });
  });

  describe('Race Conditions', () => {
    it('should handle multiple rapid subscription status checks', async () => {
      const { result } = renderHook(() => useSubscription(mockUserId));

      await act(async () => {
        const promises = Array(10).fill(null).map(() => result.current.checkSubscriptionStatus());
        const results = await Promise.all(promises);
        // All results should be consistent
        expect(results.every(r => r.isActive === results[0].isActive)).toBe(true);
      });
    }, 5000);

    it('should handle concurrent subscription updates', async () => {
      const { result } = renderHook(() => useSubscription(mockUserId));

      await act(async () => {
        const updates = [
          { ...mockSubscriptionData, currentPlan: SUBSCRIPTION_PLANS.basic },
          { ...mockSubscriptionData, currentPlan: SUBSCRIPTION_PLANS.premium },
        ];

        const promises = updates.map(update => result.current.updateSubscription(update));
        await Promise.all(promises);
      });

      expect(result.current.subscription.currentPlan).toBeDefined();
    }, 5000);
  });

  describe('Invalid Data Handling', () => {
    it('should handle malformed subscription data', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue('invalid-json');

      const { result } = renderHook(() => useSubscription(mockUserId));

      await act(async () => {
        try {
          await result.current.checkSubscriptionStatus();
        } catch (error) {
          // Expected error
        }
      });

      expect(result.current.subscription.error).toBeDefined();
      expect(result.current.subscription.status).toBe('error');
    }, 5000);

    it('should handle missing subscription data', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);

      const { result } = renderHook(() => useSubscription(mockUserId));

      await act(async () => {
        await result.current.checkSubscriptionStatus();
      });

      expect(result.current.subscription.currentPlan).toBe(SUBSCRIPTION_PLANS.none);
      expect(result.current.subscription.status).toBe('inactive');
    }, 5000);
  });

  describe('Network Edge Cases', () => {
    it('should handle intermittent network connectivity', async () => {
      const { result } = renderHook(() => useSubscription(mockUserId));

      // Simulate network fluctuations
      (NetInfo.fetch as jest.Mock)
        .mockResolvedValueOnce({ isConnected: false })
        .mockResolvedValueOnce({ isConnected: true })
        .mockResolvedValueOnce({ isConnected: false });

      await act(async () => {
        try {
          await result.current.checkSubscriptionStatus();
        } catch (error) {
          // Expected error
        }
      });

      expect(result.current.subscription.offlineChanges).toBe(true);

      // Network restored
      (NetInfo.fetch as jest.Mock).mockResolvedValue({ isConnected: true });
      await act(async () => {
        await result.current.checkSubscriptionStatus();
      });

      expect(result.current.subscription.offlineChanges).toBe(false);
    }, 5000);

    it('should handle timeout errors', async () => {
      const { result } = renderHook(() => useSubscription(mockUserId));

      // Simulate timeout
      (AsyncStorage.getItem as jest.Mock).mockImplementation(() => 
        new Promise(resolve => setTimeout(resolve, 5000))
      );

      const startTime = Date.now();
      await act(async () => {
        try {
          await result.current.checkSubscriptionStatus();
        } catch (error) {
          // Expected error
        }
      });
      const timeTaken = Date.now() - startTime;

      expect(timeTaken).toBeLessThan(5000); // Should timeout before 5 seconds
      expect(result.current.subscription.error).toBeDefined();
    }, 10000);
  });

  describe('State Persistence', () => {
    it('should handle state persistence after multiple updates', async () => {
      const { result } = renderHook(() => useSubscription(mockUserId));

      const updates = Array(5).fill(null).map((_, i) => ({
        ...mockSubscriptionData,
        lastSync: new Date(Date.now() + i * 1000).toISOString(),
      }));

      for (const update of updates) {
        await act(async () => {
          await AsyncStorage.setItem(`subscription_${mockUserId}`, JSON.stringify(update));
          await result.current.checkSubscriptionStatus();
        });
      }

      const finalState = JSON.parse(await AsyncStorage.getItem(`subscription_${mockUserId}`) as string);
      expect(finalState.lastSync).toBe(updates[updates.length - 1].lastSync);
    }, 10000);
  });
}); 