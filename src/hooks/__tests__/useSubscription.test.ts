import { renderHook, act } from '@testing-library/react-hooks';
import { useSubscription } from '../useSubscription';
import { createTestScenarios, createPerformanceScenarios, createDeviceSpecificScenarios } from '../../utils/subscriptionTestUtils';
import { Platform } from 'react-native';

describe('useSubscription', () => {
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
        await act(async () => {
          await scenario.test();
        });
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
          await act(async () => {
            await scenario.test();
          });
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
            await act(async () => {
              await scenario.test();
            });
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
        await result.current.startTrial('premium');
        await result.current.upgradePlan('family');
        await result.current.cancelSubscription();
        await result.current.reactivateSubscription();
      });

      const status = result.current.getSubscriptionStatus();
      expect(status.isActive).toBe(true);
      expect(status.currentPlan?.id).toBe('family');
    });

    it('should handle multiple concurrent operations', async () => {
      const { result } = renderHook(() => useSubscription('test-user'));
      
      await act(async () => {
        const operations = [
          result.current.startTrial('premium'),
          result.current.upgradePlan('family'),
          result.current.cancelSubscription(),
        ];

        await Promise.all(operations);
      });

      const status = result.current.getSubscriptionStatus();
      expect(status.isCancelled).toBe(true);
    });

    it('should handle invalid user IDs', async () => {
      const { result } = renderHook(() => useSubscription(''));
      
      await act(async () => {
        try {
          await result.current.startTrial('premium');
          throw new Error('Should have failed with invalid user ID');
        } catch (error) {
          expect(error.message).toBe('User ID is required');
        }
      });
    });

    it('should handle storage errors gracefully', async () => {
      // Mock AsyncStorage to throw an error
      jest.spyOn(AsyncStorage, 'setItem').mockRejectedValueOnce(new Error('Storage error'));
      
      const { result } = renderHook(() => useSubscription('test-user'));
      
      await act(async () => {
        try {
          await result.current.startTrial('premium');
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
        const operation = result.current.startTrial('premium');
        
        // Simulate network disconnection during operation
        jest.spyOn(NetInfo, 'fetch').mockResolvedValueOnce({ isConnected: false } as any);
        
        try {
          await operation;
          throw new Error('Should have failed with network error');
        } catch (error) {
          expect(error.message).toContain('No internet connection');
        }
      });
    });
  });
}); 