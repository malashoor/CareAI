import { renderHook, act } from '@testing-library/react-hooks';
import { useSubscription } from '../hooks/useSubscription';
import { AppState, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

describe('Subscription Device-Specific Tests', () => {
  const mockUserId = 'test-user-123';
  const mockSubscriptionData = {
    isSubscribed: true,
    expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    plan: 'premium',
  };

  beforeEach(() => {
    jest.clearAllMocks();
    AsyncStorage.clear();
  });

  describe('App Lifecycle Transitions', () => {
    it('should persist subscription state during background/foreground transitions', async () => {
      const { result } = renderHook(() => useSubscription(mockUserId));
      
      // Set initial subscription state
      await act(async () => {
        await result.current.updateSubscription(mockSubscriptionData);
      });

      // Simulate app going to background
      await act(async () => {
        await new Promise(resolve => {
          AppState.emit('change', 'background');
          setTimeout(resolve, 100);
        });
      });

      // Simulate app coming to foreground
      await act(async () => {
        await new Promise(resolve => {
          AppState.emit('change', 'active');
          setTimeout(resolve, 100);
        });
      });

      // Verify subscription state is preserved
      expect(result.current.subscription).toEqual(mockSubscriptionData);
    });

    it('should handle app force close and restart', async () => {
      const { result } = renderHook(() => useSubscription(mockUserId));
      
      // Set initial subscription state
      await act(async () => {
        await result.current.updateSubscription(mockSubscriptionData);
      });

      // Simulate app force close
      await act(async () => {
        await AsyncStorage.setItem('APP_FORCE_CLOSED', 'true');
      });

      // Create new hook instance (simulating app restart)
      const { result: newResult } = renderHook(() => useSubscription(mockUserId));

      // Verify subscription state is restored
      expect(newResult.current.subscription).toEqual(mockSubscriptionData);
    });
  });

  describe('Device Time Changes', () => {
    it('should handle device time changes correctly', async () => {
      const { result } = renderHook(() => useSubscription(mockUserId));
      
      // Set subscription with specific expiry
      const expiryDate = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours from now
      await act(async () => {
        await result.current.updateSubscription({
          ...mockSubscriptionData,
          expiryDate,
        });
      });

      // Simulate device time change (forward 48 hours)
      const originalDate = global.Date;
      global.Date = class extends Date {
        constructor() {
          super();
          return new originalDate(Date.now() + 48 * 60 * 60 * 1000);
        }
      } as any;

      // Check subscription status
      await act(async () => {
        await result.current.checkSubscriptionStatus();
      });

      // Verify subscription is expired
      expect(result.current.subscription.isSubscribed).toBe(false);

      // Restore original Date
      global.Date = originalDate;
    });
  });

  describe('Multiple Device Sync', () => {
    it('should sync subscription state across multiple devices', async () => {
      const device1 = renderHook(() => useSubscription(mockUserId));
      const device2 = renderHook(() => useSubscription(mockUserId));

      // Update subscription on device 1
      await act(async () => {
        await device1.result.current.updateSubscription(mockSubscriptionData);
      });

      // Simulate sync delay
      await new Promise(resolve => setTimeout(resolve, 100));

      // Check subscription on device 2
      await act(async () => {
        await device2.result.current.checkSubscriptionStatus();
      });

      // Verify both devices have the same subscription state
      expect(device2.result.current.subscription).toEqual(device1.result.current.subscription);
    });
  });

  describe('App Update During Subscription', () => {
    it('should maintain subscription state during app updates', async () => {
      const { result } = renderHook(() => useSubscription(mockUserId));
      
      // Set initial subscription state
      await act(async () => {
        await result.current.updateSubscription(mockSubscriptionData);
      });

      // Simulate app update by clearing cache but preserving subscription data
      await AsyncStorage.multiRemove(['APP_CACHE']);
      
      // Create new hook instance (simulating app update)
      const { result: newResult } = renderHook(() => useSubscription(mockUserId));

      // Verify subscription state is preserved
      expect(newResult.current.subscription).toEqual(mockSubscriptionData);
    });
  });

  describe('Platform-Specific Behavior', () => {
    it('should handle platform-specific subscription behavior', async () => {
      const { result } = renderHook(() => useSubscription(mockUserId));
      
      // Set subscription with platform-specific data
      const platformData = {
        ...mockSubscriptionData,
        platform: Platform.OS,
        receipt: Platform.OS === 'ios' ? 'ios_receipt' : 'android_token',
      };

      await act(async () => {
        await result.current.updateSubscription(platformData);
      });

      // Verify platform-specific data is preserved
      expect(result.current.subscription.platform).toBe(Platform.OS);
      expect(result.current.subscription.receipt).toBe(
        Platform.OS === 'ios' ? 'ios_receipt' : 'android_token'
      );
    });
  });
}); 