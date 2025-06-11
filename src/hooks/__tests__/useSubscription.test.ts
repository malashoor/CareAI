import { renderHook, act } from '@testing-library/react-hooks';
import { useSubscription, SUBSCRIPTION_PLANS } from '../useSubscription';
import { createTestScenarios, createPerformanceScenarios, createDeviceSpecificScenarios, mockSubscriptionData } from '../../utils/subscriptionTestUtils';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';

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

describe('useSubscription', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // Basic scenarios
  const basicScenarios = createTestScenarios(useSubscription);
  basicScenarios.forEach(scenario => {
    describe(scenario.name, () => {
      beforeEach(async () => {
        await scenario.setup();
      });

      afterEach(async () => {
        await scenario.cleanup();
      });

      it(scenario.description, async () => {
        await scenario.test();
      });
    });
  });

  // Performance scenarios
  const performanceScenarios = createPerformanceScenarios(useSubscription);
  describe('Performance Tests', () => {
    performanceScenarios.forEach(scenario => {
      describe(scenario.name, () => {
        beforeEach(async () => {
          await scenario.setup();
        });

        afterEach(async () => {
          await scenario.cleanup();
        });

        it(scenario.description, async () => {
          await scenario.test();
        });
      });
    });
  });

  // Device-specific scenarios
  const deviceScenarios = createDeviceSpecificScenarios(useSubscription);
  describe('Device-Specific Tests', () => {
    deviceScenarios.forEach(scenario => {
      if (scenario.platform === 'all' || scenario.platform === Platform.OS) {
        describe(scenario.name, () => {
          beforeEach(async () => {
            await scenario.setup();
          });

          afterEach(async () => {
            await scenario.cleanup();
          });

          it(scenario.description, async () => {
            await scenario.test();
          });
        });
      }
    });
  });

  // Edge cases
  describe('Edge Cases', () => {
    it('should handle rapid state changes', async () => {
      const { result } = renderHook(() => useSubscription('test-user'));
      
      await act(async () => {
        await result.current.updateSubscription({
          currentPlan: SUBSCRIPTION_PLANS.premium,
          status: 'active',
          trial: true
        });
      });

      await act(async () => {
        await result.current.updateSubscription({
          currentPlan: SUBSCRIPTION_PLANS.family,
          status: 'active',
          trial: false
        });
      });

      await act(async () => {
        await result.current.cancelSubscription();
      });

      await act(async () => {
        await result.current.renewSubscription();
      });

      expect(result.current.subscription.status).toBe('active');
      expect(result.current.subscription.currentPlan?.id).toBe('family');
    });

    it('should handle multiple concurrent operations', async () => {
      const { result } = renderHook(() => useSubscription('test-user'));
      
      await act(async () => {
        const operations = [
          result.current.updateSubscription({
            currentPlan: SUBSCRIPTION_PLANS.premium,
            status: 'active',
            trial: true
          }),
          result.current.updateSubscription({
            currentPlan: SUBSCRIPTION_PLANS.family,
            status: 'active',
            trial: false
          }),
          result.current.cancelSubscription(),
        ];

        await Promise.all(operations);
      });

      expect(result.current.subscription.status).toBe('cancelled');
    });

    it('should handle invalid user IDs', async () => {
      const { result } = renderHook(() => useSubscription(''));
      
      await act(async () => {
        try {
          await result.current.updateSubscription({
            currentPlan: SUBSCRIPTION_PLANS.premium,
            status: 'active'
          });
          throw new Error('Should have failed with invalid user ID');
        } catch (error) {
          expect(error.message).toBe('Invalid user ID');
        }
      });
    });

    it('should handle storage errors gracefully', async () => {
      (AsyncStorage.setItem as jest.Mock).mockRejectedValueOnce(new Error('Storage error'));
      
      const { result } = renderHook(() => useSubscription('test-user'));
      
      await act(async () => {
        try {
          await result.current.updateSubscription({
            currentPlan: SUBSCRIPTION_PLANS.premium,
            status: 'active'
          });
          throw new Error('Should have failed with storage error');
        } catch (error) {
          expect(error.message).toBe('Storage error');
        }
      });
    });

    it('should handle network state changes during operations', async () => {
      const { result } = renderHook(() => useSubscription('test-user'));
      
      await act(async () => {
        // Start operation
        const operation = result.current.updateSubscription({
          currentPlan: SUBSCRIPTION_PLANS.premium,
          status: 'active'
        });
        
        // Simulate network disconnection during operation
        (NetInfo.fetch as jest.Mock).mockResolvedValueOnce({ isConnected: false });
        
        try {
          await operation;
          throw new Error('Should have failed with network error');
        } catch (error) {
          expect(error.message).toBe('Network Error');
        }
      });
    });
  });
}); 