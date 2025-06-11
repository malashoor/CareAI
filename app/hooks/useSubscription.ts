import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useOfflineStorage } from './useOfflineStorage';

interface SubscriptionPlan {
  id: string;
  name: string;
  description: string;
  features: string[];
  price: {
    monthly: number;
    annual: number;
  };
}

export const SUBSCRIPTION_PLANS: Record<string, SubscriptionPlan> = {
  free: {
    id: 'free',
    name: 'Free',
    description: 'Basic health monitoring and medication tracking',
    features: [
      'Basic health monitoring',
      'Medication tracking',
      'Emergency alerts',
      'Voice messaging (limited)',
      'Community support'
    ],
    price: {
      monthly: 0,
      annual: 0
    }
  },
  premium: {
    id: 'premium',
    name: 'Premium',
    description: 'Advanced health analytics and medical advice',
    features: [
      'Everything in Free',
      'Advanced health analytics',
      'AI health insights',
      'Priority medical support',
      'Unlimited voice messaging',
      'Video consultations',
      'Personalized exercise plans',
      'Health data export'
    ],
    price: {
      monthly: 9.99,
      annual: 99.99
    }
  },
  family: {
    id: 'family',
    name: 'Family',
    description: 'Premium features for the whole family',
    features: [
      'Everything in Premium',
      'Up to 5 family members',
      'Family dashboard',
      'Shared medical records',
      'Care coordination',
      'Group activities',
      'Family chat',
      'Emergency notifications'
    ],
    price: {
      monthly: 19.99,
      annual: 199.99
    }
  },
  professional: {
    id: 'professional',
    name: 'Professional',
    description: 'Enterprise-grade features for healthcare providers',
    features: [
      'Everything in Premium',
      'Unlimited patients',
      'Advanced analytics dashboard',
      'ERP integration',
      'Custom branding',
      'Priority support',
      'API access',
      'HIPAA compliance',
      'Audit logs'
    ],
    price: {
      monthly: 49.99,
      annual: 499.99
    }
  }
};

export function useSubscription(userId: string) {
  const [subscription, setSubscription] = useState<any>(null);
  const [trial, setTrial] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { saveData, loadData, isOnline } = useOfflineStorage();

  useEffect(() => {
    loadSubscription();

    const subscription = supabase
      .channel('subscription_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'subscriptions',
          filter: `user_id=eq.${userId}`
        },
        () => {
          loadSubscription();
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [userId]);

  const loadSubscription = async () => {
    try {
      let subscriptionData;
      let trialData;

      if (isOnline) {
        // Load from Supabase when online
        const { data: subData } = await supabase
          .from('subscriptions')
          .select('*')
          .eq('user_id', userId)
          .eq('status', 'active')
          .single();

        const { data: tData } = await supabase
          .from('subscription_trials')
          .select('*')
          .eq('user_id', userId)
          .eq('converted_to_paid', false)
          .gt('end_date', new Date().toISOString())
          .single();

        subscriptionData = subData;
        trialData = tData;

        // Cache data for offline use
        await saveData(`subscription:${userId}`, subscriptionData);
        await saveData(`trial:${userId}`, trialData);
      } else {
        // Load from offline storage
        subscriptionData = await loadData(`subscription:${userId}`);
        trialData = await loadData(`trial:${userId}`);
      }

      setSubscription(subscriptionData);
      setTrial(trialData);
    } catch (error) {
      console.error('Error loading subscription:', error);
    } finally {
      setLoading(false);
    }
  };

  const startTrial = async (planType: string) => {
    const trialEndDate = new Date();
    trialEndDate.setDate(trialEndDate.getDate() + 14); // 14-day trial

    const trialData = {
      user_id: userId,
      plan_type: planType,
      end_date: trialEndDate.toISOString()
    };

    if (isOnline) {
      const { data, error } = await supabase
        .from('subscription_trials')
        .insert(trialData)
        .select()
        .single();

      if (error) throw error;
      setTrial(data);
    }

    // Save locally regardless of online status
    await saveData(`trial:${userId}`, trialData);
    setTrial(trialData);
  };

  const subscribe = async (planType: string, billingPeriod: 'monthly' | 'annual') => {
    const plan = SUBSCRIPTION_PLANS[planType];
    if (!plan) throw new Error('Invalid plan type');

    const periodEnd = new Date();
    periodEnd.setMonth(
      periodEnd.getMonth() + (billingPeriod === 'annual' ? 12 : 1)
    );

    const subscriptionData = {
      user_id: userId,
      plan_type: planType,
      billing_period: billingPeriod,
      status: 'active',
      current_period_start: new Date().toISOString(),
      current_period_end: periodEnd.toISOString()
    };

    if (isOnline) {
      const { data, error } = await supabase
        .from('subscriptions')
        .insert(subscriptionData)
        .select()
        .single();

      if (error) throw error;

      if (trial) {
        await supabase
          .from('subscription_trials')
          .update({ converted_to_paid: true })
          .eq('id', trial.id);
      }

      setSubscription(data);
    }

    // Save locally regardless of online status
    await saveData(`subscription:${userId}`, subscriptionData);
    setSubscription(subscriptionData);

    if (trial) {
      const updatedTrial = { ...trial, converted_to_paid: true };
      await saveData(`trial:${userId}`, updatedTrial);
      setTrial(updatedTrial);
    }
  };

  const cancelSubscription = async () => {
    if (!subscription) return;

    const updatedSubscription = {
      ...subscription,
      cancel_at_period_end: true,
      updated_at: new Date().toISOString()
    };

    if (isOnline) {
      const { error } = await supabase
        .from('subscriptions')
        .update(updatedSubscription)
        .eq('id', subscription.id);

      if (error) throw error;
    }

    await saveData(`subscription:${userId}`, updatedSubscription);
    setSubscription(updatedSubscription);
  };

  return {
    subscription,
    trial,
    loading,
    startTrial,
    subscribe,
    cancelSubscription,
    isSubscribed: !!subscription,
    isTrialing: !!trial,
    plan: subscription ? SUBSCRIPTION_PLANS[subscription.plan_type] : null,
    features: subscription?.features_enabled || {},
    availablePlans: SUBSCRIPTION_PLANS
  };
}