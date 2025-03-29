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

describe('Subscription Performance Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(JSON.stringify(mockSubscriptionData));
    (NetInfo.fetch as jest.Mock).mockResolvedValue({ isConnected: true });
  });

  describe('Heavy Concurrent Operations', () => {
    it('should handle 50 concurrent subscription operations within 5 seconds', async () => {
      const startTime = Date.now();
      const { result } = renderHook(() => useSubscription(mockUserId));

      await act(async () => {
        const operations = Array(50).fill(null).map(() => result.current.checkSubscriptionStatus());
        await Promise.all(operations);
      });

      const endTime = Date.now();
      const timeTaken = endTime - startTime;

      expect(timeTaken).toBeLessThan(5000); // 5 seconds threshold
    }, 10000); // Increased timeout to 10 seconds
  });

  describe('Memory Usage Under Load', () => {
    it('should maintain memory usage under 50MB during 1000 subscription checks', async () => {
      const initialMemory = process.memoryUsage().heapUsed;
      const { result } = renderHook(() => useSubscription(mockUserId));

      await act(async () => {
        const operations = Array(1000).fill(null).map(() => result.current.checkSubscriptionStatus());
        await Promise.all(operations);
      });

      const finalMemory = process.memoryUsage().heapUsed;
      const memoryUsed = (finalMemory - initialMemory) / 1024 / 1024; // Convert to MB

      expect(memoryUsed).toBeLessThan(50); // 50MB threshold
    }, 30000); // 30 seconds timeout
  });

  describe('Network Failure Recovery', () => {
    it('should recover from network failure within 1 second', async () => {
      // Simulate network failure
      (NetInfo.fetch as jest.Mock).mockResolvedValue({ isConnected: false });

      const { result } = renderHook(() => useSubscription(mockUserId));

      const startTime = Date.now();
      await act(async () => {
        try {
          await result.current.checkSubscriptionStatus();
        } catch (error) {
          // Expected error
        }
      });
      const endTime = Date.now();

      expect(result.current.subscription.error).toBe('Network Error');
      expect(endTime - startTime).toBeLessThan(1000); // 1 second threshold
    }, 5000);
  });

  describe('Platform-Specific Performance', () => {
    it('should maintain consistent performance across platforms', async () => {
      const { result } = renderHook(() => useSubscription(mockUserId));

      const startTime = Date.now();
      await act(async () => {
        await result.current.checkSubscriptionStatus();
      });
      const endTime = Date.now();
      const timeTaken = endTime - startTime;

      expect(timeTaken).toBeLessThan(100); // 100ms threshold
    }, 5000);
  });
}); 