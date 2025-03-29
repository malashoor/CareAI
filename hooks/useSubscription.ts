import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

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
      'Appointment scheduling',
      'Voice messaging'
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
      'Appointment rescheduling',
      'Video consultations'
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
      'Emergency notifications',
      'Care coordination'
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
      'Priority support'
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
      // Load active subscription
      const { data: subscriptionData } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', userId)
        .eq('status', 'active')
        .single();

      setSubscription(subscriptionData);

      // Load trial if exists
      const { data: trialData } = await supabase
        .from('subscription_trials')
        .select('*')
        .eq('user_id', userId)
        .eq('converted_to_paid', false)
        .gt('end_date', new Date().toISOString())
        .single();

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

    const { data, error } = await supabase
      .from('subscription_trials')
      .insert({
        user_id: userId,
        plan_type: planType,
        end_date: trialEndDate.toISOString()
      })
      .select()
      .single();

    if (error) throw error;
    setTrial(data);
  };

  const subscribe = async (planType: string, billingPeriod: 'monthly' | 'annual') => {
    const plan = SUBSCRIPTION_PLANS[planType];
    if (!plan) throw new Error('Invalid plan type');

    const periodEnd = new Date();
    periodEnd.setMonth(
      periodEnd.getMonth() + (billingPeriod === 'annual' ? 12 : 1)
    );

    // In production, integrate with payment provider here
    const { data, error } = await supabase
      .from('subscriptions')
      .insert({
        user_id: userId,
        plan_type: planType,
        billing_period: billingPeriod,
        status: 'active',
        current_period_start: new Date().toISOString(),
        current_period_end: periodEnd.toISOString()
      })
      .select()
      .single();

    if (error) throw error;

    // If converting from trial, mark it as converted
    if (trial) {
      await supabase
        .from('subscription_trials')
        .update({ converted_to_paid: true })
        .eq('id', trial.id);
    }

    setSubscription(data);
  };

  const cancelSubscription = async () => {
    if (!subscription) return;

    const { error } = await supabase
      .from('subscriptions')
      .update({
        cancel_at_period_end: true,
        updated_at: new Date().toISOString()
      })
      .eq('id', subscription.id);

    if (error) throw error;

    await loadSubscription();
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
    features: subscription?.features_enabled || {}
  };
}