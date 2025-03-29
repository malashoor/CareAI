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
  status: 'active' | 'inactive' | 'cancelled' | 'expired' | 'error';
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
  none: null,
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

  const loadStoredState = useCallback(async () => {
    try {
      const storedState = await AsyncStorage.getItem(`${STORAGE_KEY}_${userId}`);
      if (storedState) {
        const parsedState = JSON.parse(storedState);
        setState(parsedState);
      }
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: 'Storage error',
        status: 'error'
      }));
    }
  }, [userId]);

  useEffect(() => {
    loadStoredState();
  }, [loadStoredState]);

  const checkSubscriptionStatus = useCallback(async () => {
    try {
      validateUserId(userId);
      setState(prev => ({ ...prev, loading: true, error: null }));

      const isConnected = await checkConnectivity();
      if (!isConnected) {
        setState(prev => ({
          ...prev,
          loading: false,
          error: 'Network Error',
          offlineChanges: true,
          status: 'error'
        }));
        throw new Error('Network Error');
      }

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 100));

      // Check if subscription is expired
      const now = new Date();
      const nextBillingDate = new Date(state.nextBillingDate || '');
      const isExpired = nextBillingDate < now;

      setState(prev => ({
        ...prev,
        loading: false,
        error: null,
        status: isExpired ? 'expired' : prev.status,
        offlineChanges: false
      }));

      return {
        isActive: state.status === 'active',
        currentPlan: state.currentPlan,
        error: null
      };
    } catch (error) {
      const subscriptionError = handleSubscriptionError(error);
      setState(prev => ({
        ...prev,
        loading: false,
        error: subscriptionError.message,
        status: 'error'
      }));
      throw subscriptionError;
    }
  }, [userId, state.status, state.currentPlan, state.nextBillingDate]);

  const updateSubscription = useCallback(async (subscriptionData: Partial<SubscriptionState>) => {
    try {
      validateUserId(userId);
      setState(prev => ({ ...prev, loading: true, error: null }));
      
      if (!subscriptionData) {
        throw new Error('Invalid subscription data');
      }

      const isConnected = await checkConnectivity();
      if (!isConnected) {
        setState(prev => ({
          ...prev,
          loading: false,
          error: 'Network Error',
          offlineChanges: true,
          status: 'error'
        }));
        throw new Error('Network Error');
      }

      const newState = {
        ...state,
        ...subscriptionData,
        loading: false,
        error: null,
        lastSync: new Date().toISOString()
      };

      await AsyncStorage.setItem(`${STORAGE_KEY}_${userId}`, JSON.stringify(newState));
      setState(newState);

      return newState;
    } catch (error) {
      const subscriptionError = handleSubscriptionError(error);
      setState(prev => ({
        ...prev,
        loading: false,
        error: subscriptionError.message,
        status: 'error'
      }));
      throw subscriptionError;
    }
  }, [userId, state]);

  const cancelSubscription = useCallback(async () => {
    try {
      validateUserId(userId);
      setState(prev => ({ ...prev, loading: true, error: null }));
      
      const isConnected = await checkConnectivity();
      if (!isConnected) {
        setState(prev => ({
          ...prev,
          loading: false,
          error: 'Network Error',
          offlineChanges: true,
          status: 'error'
        }));
        throw new Error('Network Error');
      }

      const newState = {
        ...state,
        status: 'cancelled',
        loading: false,
        error: null,
        lastSync: new Date().toISOString()
      };

      await AsyncStorage.setItem(`${STORAGE_KEY}_${userId}`, JSON.stringify(newState));
      setState(newState);

      return newState;
    } catch (error) {
      const subscriptionError = handleSubscriptionError(error);
      setState(prev => ({
        ...prev,
        loading: false,
        error: subscriptionError.message,
        status: 'error'
      }));
      throw subscriptionError;
    }
  }, [userId, state]);

  const renewSubscription = useCallback(async () => {
    try {
      validateUserId(userId);
      setState(prev => ({ ...prev, loading: true, error: null }));
      
      const isConnected = await checkConnectivity();
      if (!isConnected) {
        setState(prev => ({
          ...prev,
          loading: false,
          error: 'Network Error',
          offlineChanges: true,
          status: 'error'
        }));
        throw new Error('Network Error');
      }

      const newState = {
        ...state,
        status: 'active',
        loading: false,
        error: null,
        lastSync: new Date().toISOString(),
        nextBillingDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
      };

      await AsyncStorage.setItem(`${STORAGE_KEY}_${userId}`, JSON.stringify(newState));
      setState(newState);

      return newState;
    } catch (error) {
      const subscriptionError = handleSubscriptionError(error);
      setState(prev => ({
        ...prev,
        loading: false,
        error: subscriptionError.message,
        status: 'error'
      }));
      throw subscriptionError;
    }
  }, [userId, state]);

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