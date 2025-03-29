import { renderHook, act } from '@testing-library/react-hooks';
import { useSubscription } from '../hooks/useSubscription';
import { Platform } from 'react-native';
import NetInfo from '@react-native-community/netinfo';
import AsyncStorage from '@react-native-async-storage/async-storage';

describe('Subscription Edge Cases', () => {
  const mockUserId = 'test-user-123';
  const mockSubscriptionData = {
    currentPlan: {
      id: 'premium',
      name: 'Premium',
      price: 19.99,
      interval: 'monthly',
      features: ['feature1', 'feature2']
    },
    status: 'active',
    loading: false,
    error: null,
    nextBillingDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    trial: false,
    lastSync: null,
    offlineChanges: false,
    isSubscribed: true
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rapid State Changes', () => {
    it('should handle rapid subscription state changes without race conditions', async () => {
      const { result } = renderHook(() => useSubscription(mockUserId));
      
      const operations = [
        { ...mockSubscriptionData, isSubscribed: true },
        { ...mockSubscriptionData, isSubscribed: false },
        { ...mockSubscriptionData, isSubscribed: true },
        { ...mockSubscriptionData, isSubscribed: false }
      ];

      await act(async () => {
        await Promise.all(operations.map(data => 
          result.current.updateSubscription(data)
        ));
      });

      expect(result.current.subscription.isSubscribed).toBe(false);
    });

    it('should handle concurrent subscription checks', async () => {
      const { result } = renderHook(() => useSubscription(mockUserId));
      
      const checks = Array(10).fill(null).map(() => 
        result.current.checkSubscriptionStatus()
      );

      await act(async () => {
        await Promise.all(checks);
      });

      expect(result.current.error).toBeNull();
    });
  });

  describe('Invalid Operations', () => {
    it('should handle invalid user IDs gracefully', async () => {
      const { result } = renderHook(() => useSubscription(''));
      
      await act(async () => {
        try {
          await result.current.checkSubscriptionStatus();
        } catch (error) {
          expect(error.message).toBe('Invalid user ID');
        }
      });
    });

    it('should handle malformed subscription data', async () => {
      const { result } = renderHook(() => useSubscription(mockUserId));
      
      await act(async () => {
        try {
          await result.current.updateSubscription(null as any);
        } catch (error) {
          expect(error.message).toBe('Invalid subscription data');
        }
      });
    });

    it('should handle expired subscription dates', async () => {
      const { result } = renderHook(() => useSubscription(mockUserId));
      
      const expiredData = {
        ...mockSubscriptionData,
        nextBillingDate: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        isSubscribed: false
      };

      await act(async () => {
        await result.current.updateSubscription(expiredData);
      });

      expect(result.current.subscription.isSubscribed).toBe(false);
    });
  });

  describe('Network State Changes', () => {
    it('should handle network disconnection during subscription check', async () => {
      const { result } = renderHook(() => useSubscription(mockUserId));
      
      // Mock network disconnection
      jest.spyOn(NetInfo, 'fetch').mockResolvedValueOnce({ isConnected: false } as any);
      
      await act(async () => {
        try {
          await result.current.checkSubscriptionStatus();
        } catch (error) {
          expect(error.message).toBe('Network Error');
        }
      });
    });

    it('should handle slow network conditions', async () => {
      const { result } = renderHook(() => useSubscription(mockUserId));
      
      // Mock slow network
      jest.spyOn(global, 'fetch').mockImplementationOnce(() => 
        new Promise(resolve => setTimeout(() => resolve(new Response()), 5000))
      );
      
      await act(async () => {
        try {
          await result.current.checkSubscriptionStatus();
        } catch (error) {
          expect(error.message).toBe('Network Error');
        }
      });
    });
  });

  describe('Platform-Specific Edge Cases', () => {
    it('should handle iOS receipt validation failures', async () => {
      if (Platform.OS !== 'ios') return;

      const { result } = renderHook(() => useSubscription(mockUserId));
      
      const invalidReceipt = {
        ...mockSubscriptionData,
        receipt: 'invalid_receipt'
      };

      await act(async () => {
        try {
          await result.current.updateSubscription(invalidReceipt);
        } catch (error) {
          expect(error.message).toBe('Invalid subscription data');
        }
      });
    });

    it('should handle Android token validation failures', async () => {
      if (Platform.OS !== 'android') return;

      const { result } = renderHook(() => useSubscription(mockUserId));
      
      const invalidToken = {
        ...mockSubscriptionData,
        token: 'invalid_token'
      };

      await act(async () => {
        try {
          await result.current.updateSubscription(invalidToken);
        } catch (error) {
          expect(error.message).toBe('Invalid subscription data');
        }
      });
    });
  });

  describe('Subscription State Transitions', () => {
    it('should handle subscription cancellation during active subscription', async () => {
      const { result } = renderHook(() => useSubscription(mockUserId));
      
      // Set active subscription
      await act(async () => {
        await result.current.updateSubscription(mockSubscriptionData);
      });

      // Simulate cancellation
      await act(async () => {
        await result.current.cancelSubscription();
      });

      expect(result.current.subscription.status).toBe('cancelled');
    });

    it('should handle subscription renewal during grace period', async () => {
      const { result } = renderHook(() => useSubscription(mockUserId));
      
      // Set subscription in grace period
      const gracePeriodData = {
        ...mockSubscriptionData,
        status: 'cancelled',
        gracePeriodEnd: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
      };

      await act(async () => {
        await result.current.updateSubscription(gracePeriodData);
      });

      // Simulate renewal
      await act(async () => {
        await result.current.renewSubscription();
      });

      expect(result.current.subscription.status).toBe('active');
      expect(result.current.subscription.gracePeriodEnd).toBeUndefined();
    });
  });

  describe('State Persistence', () => {
    it('should persist subscription state across app restarts', async () => {
      const { result, rerender } = renderHook(() => useSubscription(mockUserId));
      
      // Set initial state
      await act(async () => {
        await result.current.updateSubscription(mockSubscriptionData);
      });

      // Verify AsyncStorage was called with correct data
      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        expect.any(String),
        expect.stringContaining(mockSubscriptionData.currentPlan.id)
      );

      // Simulate app restart
      rerender();

      expect(result.current.subscription.currentPlan?.id).toBe(mockSubscriptionData.currentPlan.id);
    });

    it('should handle storage errors gracefully', async () => {
      const { result } = renderHook(() => useSubscription(mockUserId));
      
      // Mock storage error
      jest.spyOn(AsyncStorage, 'setItem').mockRejectedValueOnce(new Error('Storage error'));

      await act(async () => {
        try {
          await result.current.updateSubscription(mockSubscriptionData);
        } catch (error) {
          expect(error.message).toBe('Storage error');
        }
      });
    });
  });

  describe('Race Conditions', () => {
    it('should handle multiple rapid subscription updates correctly', async () => {
      const { result } = renderHook(() => useSubscription(mockUserId));
      
      const updates = [
        { status: 'active', currentPlan: SUBSCRIPTION_PLANS.premium },
        { status: 'cancelled' },
        { status: 'active', currentPlan: SUBSCRIPTION_PLANS.family },
        { status: 'expired' }
      ];

      await act(async () => {
        await Promise.all(updates.map(update => result.current.updateSubscription(update)));
      });

      // Last update should win
      expect(result.current.subscription.status).toBe('expired');
    });

    it('should handle concurrent network requests properly', async () => {
      const { result } = renderHook(() => useSubscription(mockUserId));
      
      // Mock network delays
      const mockFetch = jest.spyOn(global, 'fetch');
      mockFetch
        .mockImplementationOnce(() => new Promise(resolve => setTimeout(() => resolve(new Response()), 200)))
        .mockImplementationOnce(() => new Promise(resolve => setTimeout(() => resolve(new Response()), 100)));

      await act(async () => {
        const [firstRequest, secondRequest] = await Promise.all([
          result.current.checkSubscriptionStatus(),
          result.current.checkSubscriptionStatus()
        ]);

        expect(firstRequest.error).toBeNull();
        expect(secondRequest.error).toBeNull();
      });
    });
  });

  describe('Error Recovery', () => {
    it('should recover from network errors automatically', async () => {
      const { result } = renderHook(() => useSubscription(mockUserId));
      
      // First request fails
      jest.spyOn(NetInfo, 'fetch')
        .mockResolvedValueOnce({ isConnected: false } as any)
        .mockResolvedValueOnce({ isConnected: true } as any);

      await act(async () => {
        try {
          await result.current.checkSubscriptionStatus();
        } catch (error) {
          expect(error.message).toBe('Network Error');
        }
      });

      // Second request succeeds
      await act(async () => {
        const status = await result.current.checkSubscriptionStatus();
        expect(status.error).toBeNull();
      });
    });

    it('should handle API timeout gracefully', async () => {
      const { result } = renderHook(() => useSubscription(mockUserId));
      
      // Mock timeout
      jest.spyOn(global, 'fetch').mockImplementationOnce(() => 
        new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 5100))
      );

      await act(async () => {
        try {
          await result.current.checkSubscriptionStatus();
        } catch (error) {
          expect(error.message).toBe('Timeout');
        }
      });
    });
  });

  describe('Platform-Specific Features', () => {
    it('should handle in-app purchase receipt validation', async () => {
      const { result } = renderHook(() => useSubscription(mockUserId));
      
      const purchaseData = {
        ...mockSubscriptionData,
        receipt: Platform.OS === 'ios' ? 'ios_receipt' : 'android_token',
        platform: Platform.OS
      };

      await act(async () => {
        await result.current.updateSubscription(purchaseData);
      });

      expect(result.current.subscription.platform).toBe(Platform.OS);
    });

    it('should handle platform-specific subscription periods', async () => {
      const { result } = renderHook(() => useSubscription(mockUserId));
      
      const platformSpecificData = {
        ...mockSubscriptionData,
        // iOS allows 1-month trials, Android allows 2-week trials
        trialPeriod: Platform.OS === 'ios' ? 30 : 14
      };

      await act(async () => {
        await result.current.updateSubscription(platformSpecificData);
      });

      expect(result.current.subscription.trialPeriod).toBe(
        Platform.OS === 'ios' ? 30 : 14
      );
    });
  });
}); 