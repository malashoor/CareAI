import { useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';

interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  interval: 'monthly' | 'yearly';
  features: string[];
}

interface SubscriptionState {
  currentPlan: SubscriptionPlan | null;
  status: 'active' | 'inactive' | 'cancelled' | 'expired';
  loading: boolean;
  error: string | null;
  nextBillingDate: string | null;
  trial: boolean;
  lastSync: string | null;
  offlineChanges: boolean;
}

interface SubscriptionError extends Error {
  code?: string;
  details?: string;
  isOffline?: boolean;
}

export const SUBSCRIPTION_PLANS = {
  premium: {
    id: 'premium',
    name: 'Premium',
    price: 19.99,
    interval: 'monthly' as const,
    features: [
      'Advanced fall detection',
      'Emergency contacts',
      'Daily activity tracking',
      'Location tracking',
      '24/7 emergency support',
      'Family dashboard',
    ],
  },
  family: {
    id: 'family',
    name: 'Family',
    price: 29.99,
    interval: 'monthly' as const,
    features: [
      'Everything in Premium',
      'Up to 5 family members',
      'Family activity tracking',
      'Shared emergency contacts',
      'Family health reports',
    ],
  },
  professional: {
    id: 'professional',
    name: 'Professional',
    price: 49.99,
    interval: 'monthly' as const,
    features: [
      'Everything in Family',
      'Unlimited family members',
      'Professional health reports',
      'API access',
      'Priority support',
      'Custom integrations',
    ],
  },
};

const STORAGE_KEY = '@subscription_state';
const SYNC_INTERVAL = 5 * 60 * 1000; // 5 minutes

const validateUserId = (userId: string): void => {
  if (!userId) {
    throw new Error('Invalid user ID');
  }
};

const handleSubscriptionError = (error: unknown): SubscriptionError => {
  if (error instanceof Error) {
    return error;
  }
  return new Error('An unexpected error occurred');
};

const checkConnectivity = async (): Promise<boolean> => {
  const netInfo = await NetInfo.fetch();
  return netInfo.isConnected ?? false;
};

export const useSubscription = (userId: string) => {
  const [state, setState] = useState<SubscriptionState>({
    currentPlan: null,
    status: 'inactive',
    loading: false,
    error: null,
    nextBillingDate: null,
    trial: false,
    lastSync: null,
    offlineChanges: false,
  });

  const checkSubscriptionStatus = useCallback(async () => {
    try {
      validateUserId(userId);
      const isConnected = await checkConnectivity();
      
      if (!isConnected) {
        throw new Error('Network Error');
      }

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 100));

      return {
        isActive: state.status === 'active',
        currentPlan: state.currentPlan,
        error: null
      };
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'An unexpected error occurred'
      }));
      throw error;
    }
  }, [userId, state.status, state.currentPlan]);

  const updateSubscription = useCallback(async (subscriptionData: Partial<SubscriptionState>) => {
    try {
      validateUserId(userId);
      
      if (!subscriptionData) {
        throw new Error('Invalid subscription data');
      }

      const isConnected = await checkConnectivity();
      if (!isConnected) {
        throw new Error('Network Error');
      }

      setState(prev => ({
        ...prev,
        ...subscriptionData,
        error: null
      }));

      return state;
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Invalid subscription data'
      }));
      throw error;
    }
  }, [userId]);

  const cancelSubscription = useCallback(async () => {
    try {
      validateUserId(userId);
      
      const isConnected = await checkConnectivity();
      if (!isConnected) {
        throw new Error('Network Error');
      }

      setState(prev => ({
        ...prev,
        status: 'cancelled',
        error: null
      }));

      return state;
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'An unexpected error occurred'
      }));
      throw error;
    }
  }, [userId]);

  const renewSubscription = useCallback(async () => {
    try {
      validateUserId(userId);
      
      const isConnected = await checkConnectivity();
      if (!isConnected) {
        throw new Error('Network Error');
      }

      setState(prev => ({
        ...prev,
        status: 'active',
        error: null,
        gracePeriodEnd: undefined
      }));

      return state;
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'An unexpected error occurred'
      }));
      throw error;
    }
  }, [userId]);

  return {
    subscription: state,
    error: state.error,
    loading: state.loading,
    checkSubscriptionStatus,
    updateSubscription,
    cancelSubscription,
    renewSubscription
  };
}; 