import NetInfo from '@react-native-community/netinfo';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

export const STORAGE_KEY = '@subscription_state';

export interface TestScenario {
  name: string;
  description: string;
  setup: () => Promise<void>;
  test: () => Promise<void>;
  cleanup: () => Promise<void>;
  platform?: 'ios' | 'android' | 'all';
}

export const createTestScenarios = (useSubscription: any) => {
  const scenarios: TestScenario[] = [
    {
      name: 'State Persistence After Restart',
      description: 'Test if subscription state persists after app restart',
      setup: async () => {
        // Clear any existing state
        await AsyncStorage.removeItem(STORAGE_KEY);
      },
      test: async () => {
        const { startTrial, getSubscriptionStatus } = useSubscription('test-user');
        await startTrial('premium');
        const status = getSubscriptionStatus();
        if (!status.isTrial || !status.isActive) {
          throw new Error('Trial not started correctly');
        }
      },
      cleanup: async () => {
        await AsyncStorage.removeItem(STORAGE_KEY);
      },
    },
    {
      name: 'Network Disconnection During Operation',
      description: 'Test subscription operations during network disconnection',
      setup: async () => {
        // Mock network disconnection
        jest.spyOn(NetInfo, 'fetch').mockResolvedValue({ isConnected: false } as any);
      },
      test: async () => {
        const { startTrial, error } = useSubscription('test-user');
        try {
          await startTrial('premium');
          throw new Error('Should have failed due to network disconnection');
        } catch (e) {
          if (!error?.includes('No internet connection')) {
            throw new Error('Expected offline error message');
          }
        }
      },
      cleanup: async () => {
        jest.restoreAllMocks();
      },
    },
    {
      name: 'Trial Period Expiration',
      description: 'Test behavior when trial period expires',
      setup: async () => {
        // Set up a trial that's about to expire
        const trialEndDate = new Date(Date.now() - 13 * 24 * 60 * 60 * 1000); // 13 days ago
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify({
          currentPlan: { id: 'premium', name: 'Premium', price: 19.99, interval: 'monthly', features: [] },
          status: 'active',
          trial: true,
          nextBillingDate: trialEndDate.toISOString(),
        }));
      },
      test: async () => {
        const { getSubscriptionStatus } = useSubscription('test-user');
        const status = getSubscriptionStatus();
        if (status.isTrial || status.isActive) {
          throw new Error('Trial should have expired');
        }
      },
      cleanup: async () => {
        await AsyncStorage.removeItem(STORAGE_KEY);
      },
    },
    {
      name: 'Plan Upgrade/Downgrade',
      description: 'Test upgrading and downgrading subscription plans',
      setup: async () => {
        // Set up an active subscription
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify({
          currentPlan: { id: 'premium', name: 'Premium', price: 19.99, interval: 'monthly', features: [] },
          status: 'active',
          trial: false,
          nextBillingDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        }));
      },
      test: async () => {
        const { upgradePlan, getSubscriptionStatus } = useSubscription('test-user');
        await upgradePlan('family');
        let status = getSubscriptionStatus();
        if (status.currentPlan?.id !== 'family') {
          throw new Error('Plan upgrade failed');
        }
        await upgradePlan('premium');
        status = getSubscriptionStatus();
        if (status.currentPlan?.id !== 'premium') {
          throw new Error('Plan downgrade failed');
        }
      },
      cleanup: async () => {
        await AsyncStorage.removeItem(STORAGE_KEY);
      },
    },
    {
      name: 'Subscription Cancellation and Reactivation',
      description: 'Test subscription cancellation and reactivation flow',
      setup: async () => {
        // Set up an active subscription
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify({
          currentPlan: { id: 'premium', name: 'Premium', price: 19.99, interval: 'monthly', features: [] },
          status: 'active',
          trial: false,
          nextBillingDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        }));
      },
      test: async () => {
        const { cancelSubscription, reactivateSubscription, getSubscriptionStatus } = useSubscription('test-user');
        await cancelSubscription();
        let status = getSubscriptionStatus();
        if (!status.isCancelled) {
          throw new Error('Subscription cancellation failed');
        }
        await reactivateSubscription();
        status = getSubscriptionStatus();
        if (!status.isActive) {
          throw new Error('Subscription reactivation failed');
        }
      },
      cleanup: async () => {
        await AsyncStorage.removeItem(STORAGE_KEY);
      },
    },
    {
      name: 'Sync Management',
      description: 'Test sync behavior and offline changes tracking',
      setup: async () => {
        // Set up initial state
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify({
          currentPlan: { id: 'premium', name: 'Premium', price: 19.99, interval: 'monthly', features: [] },
          status: 'active',
          trial: false,
          nextBillingDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          offlineChanges: false,
        }));
      },
      test: async () => {
        const { syncWithServer, getSubscriptionStatus } = useSubscription('test-user');
        // Mock network disconnection
        jest.spyOn(NetInfo, 'fetch').mockResolvedValue({ isConnected: false } as any);
        await syncWithServer();
        let status = getSubscriptionStatus();
        if (!status.hasOfflineChanges) {
          throw new Error('Offline changes not tracked');
        }
        // Mock network reconnection
        jest.spyOn(NetInfo, 'fetch').mockResolvedValue({ isConnected: true } as any);
        await syncWithServer();
        status = getSubscriptionStatus();
        if (status.hasOfflineChanges) {
          throw new Error('Offline changes not cleared after sync');
        }
      },
      cleanup: async () => {
        jest.restoreAllMocks();
        await AsyncStorage.removeItem(STORAGE_KEY);
      },
    },
    {
      name: 'Extreme Network Conditions',
      description: 'Test behavior under poor network conditions',
      setup: async () => {
        // Set up network latency simulation
        jest.spyOn(NetInfo, 'fetch').mockImplementation(() => 
          new Promise(resolve => setTimeout(() => resolve({ isConnected: true } as any), 5000))
        );
      },
      test: async () => {
        const { startTrial, error } = useSubscription('test-user');
        try {
          await startTrial('premium');
          throw new Error('Should have failed due to timeout');
        } catch (e) {
          if (!error?.includes('timeout')) {
            throw new Error('Expected timeout error');
          }
        }
      },
      cleanup: async () => {
        jest.restoreAllMocks();
      },
    },
    {
      name: 'Long Running Subscription',
      description: 'Test behavior of long-running subscriptions',
      setup: async () => {
        // Set up a subscription that's been active for a long time
        const longAgo = new Date(Date.now() - 365 * 24 * 60 * 60 * 1000); // 1 year ago
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify({
          currentPlan: { id: 'premium', name: 'Premium', price: 19.99, interval: 'monthly', features: [] },
          status: 'active',
          trial: false,
          nextBillingDate: longAgo.toISOString(),
        }));
      },
      test: async () => {
        const { getSubscriptionStatus } = useSubscription('test-user');
        const status = getSubscriptionStatus();
        if (status.isActive) {
          throw new Error('Long-running subscription should have expired');
        }
      },
      cleanup: async () => {
        await AsyncStorage.removeItem(STORAGE_KEY);
      },
    },
  ];

  return scenarios;
};

export const createPerformanceScenarios = (useSubscription: any) => {
  const scenarios: TestScenario[] = [
    {
      name: 'Heavy Concurrent Operations',
      description: 'Test performance under heavy concurrent operations',
      setup: async () => {
        await AsyncStorage.removeItem(STORAGE_KEY);
      },
      test: async () => {
        const startTime = Date.now();
        const operations = Array(50).fill(null).map(() => ({
          startTrial: useSubscription('test-user').startTrial('premium'),
          upgradePlan: useSubscription('test-user').upgradePlan('family'),
          cancelSubscription: useSubscription('test-user').cancelSubscription(),
        }));

        await Promise.all(operations.flat());
        const endTime = Date.now();
        
        if (endTime - startTime > 5000) { // 5 seconds threshold
          throw new Error('Performance threshold exceeded for concurrent operations');
        }
      },
      cleanup: async () => {
        await AsyncStorage.removeItem(STORAGE_KEY);
      },
    },
    {
      name: 'Memory Usage Under Load',
      description: 'Test memory usage during prolonged subscription operations',
      setup: async () => {
        await AsyncStorage.removeItem(STORAGE_KEY);
      },
      test: async () => {
        const initialMemory = process.memoryUsage().heapUsed;
        const operations = Array(1000).fill(null).map(() => 
          useSubscription('test-user').getSubscriptionStatus()
        );

        await Promise.all(operations);
        const finalMemory = process.memoryUsage().heapUsed;
        const memoryIncrease = finalMemory - initialMemory;

        if (memoryIncrease > 50 * 1024 * 1024) { // 50MB threshold
          throw new Error('Memory usage exceeded threshold');
        }
      },
      cleanup: async () => {
        await AsyncStorage.removeItem(STORAGE_KEY);
      },
    },
    {
      name: 'Network Failure Recovery',
      description: 'Test app responsiveness during network failures',
      setup: async () => {
        await AsyncStorage.removeItem(STORAGE_KEY);
      },
      test: async () => {
        const startTime = Date.now();
        const { startTrial, error } = useSubscription('test-user');

        // Simulate network failure
        jest.spyOn(NetInfo, 'fetch').mockResolvedValue({ isConnected: false } as any);
        
        try {
          await startTrial('premium');
          throw new Error('Should have failed');
        } catch (e) {
          const errorTime = Date.now();
          if (errorTime - startTime > 1000) { // 1 second threshold
            throw new Error('Network failure response time exceeded threshold');
          }
        }
      },
      cleanup: async () => {
        jest.restoreAllMocks();
        await AsyncStorage.removeItem(STORAGE_KEY);
      },
    },
  ];

  return scenarios;
};

export const createDeviceSpecificScenarios = (useSubscription: any) => {
  const scenarios: TestScenario[] = [
    {
      name: 'App Lifecycle Transitions',
      description: 'Test subscription state during app lifecycle transitions',
      platform: 'all',
      setup: async () => {
        await AsyncStorage.removeItem(STORAGE_KEY);
      },
      test: async () => {
        const { startTrial, getSubscriptionStatus } = useSubscription('test-user');
        await startTrial('premium');

        // Simulate app background
        const backgroundStatus = getSubscriptionStatus();
        if (!backgroundStatus.isActive) {
          throw new Error('Subscription state lost during background transition');
        }

        // Simulate app foreground
        const foregroundStatus = getSubscriptionStatus();
        if (!foregroundStatus.isActive) {
          throw new Error('Subscription state lost during foreground transition');
        }
      },
      cleanup: async () => {
        await AsyncStorage.removeItem(STORAGE_KEY);
      },
    },
    {
      name: 'Device Time Changes',
      description: 'Test subscription behavior during device time changes',
      platform: 'all',
      setup: async () => {
        await AsyncStorage.removeItem(STORAGE_KEY);
      },
      test: async () => {
        const { startTrial, getSubscriptionStatus } = useSubscription('test-user');
        await startTrial('premium');

        // Simulate time change
        const originalDate = global.Date;
        const futureDate = new Date(Date.now() + 15 * 24 * 60 * 60 * 1000); // 15 days ahead
        global.Date = class extends Date {
          constructor() {
            super();
            return futureDate;
          }
        } as any;

        const status = getSubscriptionStatus();
        if (status.isTrial || status.isActive) {
          throw new Error('Subscription not expired after time change');
        }

        // Restore original Date
        global.Date = originalDate;
      },
      cleanup: async () => {
        await AsyncStorage.removeItem(STORAGE_KEY);
      },
    },
    {
      name: 'Multiple Device Sync',
      description: 'Test subscription sync across multiple devices',
      platform: 'all',
      setup: async () => {
        await AsyncStorage.removeItem(STORAGE_KEY);
      },
      test: async () => {
        const device1 = useSubscription('test-user');
        const device2 = useSubscription('test-user');

        await device1.startTrial('premium');
        await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate network delay
        await device2.syncWithServer();

        const device2Status = device2.getSubscriptionStatus();
        if (!device2Status.isActive || !device2Status.isTrial) {
          throw new Error('Subscription state not synced across devices');
        }
      },
      cleanup: async () => {
        await AsyncStorage.removeItem(STORAGE_KEY);
      },
    },
    {
      name: 'App Update During Subscription',
      description: 'Test subscription behavior during app updates',
      platform: 'all',
      setup: async () => {
        await AsyncStorage.removeItem(STORAGE_KEY);
      },
      test: async () => {
        const { startTrial, getSubscriptionStatus } = useSubscription('test-user');
        await startTrial('premium');

        // Simulate app update
        const preUpdateStatus = getSubscriptionStatus();
        await AsyncStorage.removeItem(STORAGE_KEY);
        const postUpdateStatus = getSubscriptionStatus();

        if (postUpdateStatus.isActive !== preUpdateStatus.isActive) {
          throw new Error('Subscription state changed during app update');
        }
      },
      cleanup: async () => {
        await AsyncStorage.removeItem(STORAGE_KEY);
      },
    },
    {
      name: 'Platform-Specific Behavior',
      description: 'Test platform-specific subscription behavior',
      platform: Platform.OS as 'ios' | 'android',
      setup: async () => {
        await AsyncStorage.removeItem(STORAGE_KEY);
      },
      test: async () => {
        const { startTrial, getSubscriptionStatus } = useSubscription('test-user');
        await startTrial('premium');

        const status = getSubscriptionStatus();
        if (Platform.OS === 'ios' && !status.isActive) {
          throw new Error('iOS subscription state not maintained');
        }
        if (Platform.OS === 'android' && !status.isActive) {
          throw new Error('Android subscription state not maintained');
        }
      },
      cleanup: async () => {
        await AsyncStorage.removeItem(STORAGE_KEY);
      },
    },
  ];

  return scenarios;
}; 