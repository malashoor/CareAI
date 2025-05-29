import { useState, useEffect } from 'react';
import { Platform } from 'react-native';
import * as Speech from 'expo-speech';
import * as Haptics from 'expo-haptics';
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

interface Subscription {
  id: string;
  user_id: string;
  plan_type: string;
  billing_period: 'monthly' | 'annual';
  status: 'active' | 'cancelled' | 'expired' | 'trial';
  current_period_start: string;
  current_period_end: string;
  cancel_at_period_end?: boolean;
  created_at: string;
  updated_at: string;
}

interface Trial {
  id: string;
  user_id: string;
  plan_type: string;
  start_date: string;
  end_date: string;
  converted_to_paid: boolean;
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
      'Video consultations',
      'Fall detection alerts',
      'Emergency response'
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
      'Care coordination',
      'Group activities',
      'Family chat'
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
      'HIPAA compliance'
    ],
    price: {
      monthly: 49.99,
      annual: 499.99
    }
  }
};

export function useSubscription(userId: string) {
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [trial, setTrial] = useState<Trial | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (userId) {
      loadSubscription();
      loadTrial();
    }
  }, [userId]);

  const loadSubscription = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', userId)
        .eq('status', 'active')
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      setSubscription(data);
    } catch (error) {
      console.error('Error loading subscription:', error);
      setError('Failed to load subscription');
    } finally {
      setLoading(false);
    }
  };

  const loadTrial = async () => {
    try {
      const { data, error } = await supabase
        .from('subscription_trials')
        .select('*')
        .eq('user_id', userId)
        .eq('converted_to_paid', false)
        .gte('end_date', new Date().toISOString())
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      setTrial(data);
    } catch (error) {
      console.error('Error loading trial:', error);
    }
  };

  const startTrial = async (planType: string) => {
    try {
      const trialEndDate = new Date();
      trialEndDate.setDate(trialEndDate.getDate() + 14); // 14-day trial

      const { data, error } = await supabase
        .from('subscription_trials')
        .insert({
          user_id: userId,
          plan_type: planType,
          start_date: new Date().toISOString(),
          end_date: trialEndDate.toISOString(),
          converted_to_paid: false
        })
        .select()
        .single();

      if (error) throw error;

      setTrial(data);

      if (Platform.OS !== 'web') {
        await Speech.speak(`Started 14-day free trial for ${SUBSCRIPTION_PLANS[planType].name} plan.`, {
          rate: 0.8,
          pitch: 1.0
        });
      }

      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      return data;
    } catch (error) {
      console.error('Error starting trial:', error);
      throw error;
    }
  };

  const subscribe = async (planType: string, billingPeriod: 'monthly' | 'annual', paymentMethod?: any) => {
    try {
      const plan = SUBSCRIPTION_PLANS[planType];
      if (!plan) throw new Error('Invalid plan type');

      // Mock payment processing
      await mockPaymentProcessing(plan, billingPeriod, paymentMethod);

      const periodEnd = new Date();
      periodEnd.setMonth(
        periodEnd.getMonth() + (billingPeriod === 'annual' ? 12 : 1)
      );

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
        
        setTrial(null);
      }

      setSubscription(data);

      if (Platform.OS !== 'web') {
        await Speech.speak(`Successfully subscribed to ${plan.name} plan. Welcome to CareAI!`, {
          rate: 0.8,
          pitch: 1.0
        });
      }

      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      return data;
    } catch (error) {
      console.error('Error subscribing:', error);
      throw error;
    }
  };

  const cancelSubscription = async () => {
    try {
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

      if (Platform.OS !== 'web') {
        await Speech.speak('Subscription cancelled. You will continue to have access until the end of your billing period.', {
          rate: 0.8,
          pitch: 1.0
        });
      }

      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch (error) {
      console.error('Error cancelling subscription:', error);
      throw error;
    }
  };

  const updatePaymentMethod = async (paymentMethod: any) => {
    try {
      // Mock payment method update
      await mockPaymentMethodUpdate(paymentMethod);

      if (Platform.OS !== 'web') {
        await Speech.speak('Payment method updated successfully.', {
          rate: 0.8,
          pitch: 1.0
        });
      }

      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch (error) {
      console.error('Error updating payment method:', error);
      throw error;
    }
  };

  const mockPaymentProcessing = async (plan: SubscriptionPlan, billingPeriod: 'monthly' | 'annual', paymentMethod?: any) => {
    // Simulate payment processing delay
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Mock payment validation
    if (!paymentMethod || !paymentMethod.cardNumber) {
      throw new Error('Invalid payment method');
    }

    // Simulate random payment failures for demo
    if (Math.random() < 0.1) {
      throw new Error('Payment failed. Please try again.');
    }

    return {
      transactionId: `txn_${Date.now()}`,
      amount: plan.price[billingPeriod],
      currency: 'USD',
      status: 'completed'
    };
  };

  const mockPaymentMethodUpdate = async (paymentMethod: any) => {
    // Simulate payment method update delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    if (!paymentMethod || !paymentMethod.cardNumber) {
      throw new Error('Invalid payment method');
    }

    return {
      status: 'updated',
      last4: paymentMethod.cardNumber.slice(-4)
    };
  };

  const getTrialDaysRemaining = () => {
    if (!trial) return 0;
    
    const endDate = new Date(trial.end_date);
    const now = new Date();
    const diffTime = endDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return Math.max(0, diffDays);
  };

  const isTrialExpired = () => {
    if (!trial) return false;
    return new Date(trial.end_date) < new Date();
  };

  return {
    subscription,
    trial,
    loading,
    error,
    startTrial,
    subscribe,
    cancelSubscription,
    updatePaymentMethod,
    isSubscribed: !!subscription && subscription.status === 'active',
    isTrialing: !!trial && !trial.converted_to_paid && !isTrialExpired(),
    plan: subscription ? SUBSCRIPTION_PLANS[subscription.plan_type] : null,
    trialPlan: trial ? SUBSCRIPTION_PLANS[trial.plan_type] : null,
    trialDaysRemaining: getTrialDaysRemaining(),
    availablePlans: SUBSCRIPTION_PLANS
  };
}