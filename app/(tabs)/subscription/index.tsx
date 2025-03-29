import { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { Shield, Zap, Users, Check } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '@/hooks/useAuth';
import { useSubscription, SUBSCRIPTION_PLANS } from '@/hooks/useSubscription';

export default function SubscriptionScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { subscription, trial, startTrial } = useSubscription(user?.id!);
  const [selectedPlan, setSelectedPlan] = useState<string>('premium');
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'annual'>('monthly');

  const plans = [
    {
      id: 'premium',
      name: 'Premium Plan',
      price: SUBSCRIPTION_PLANS.premium.price,
      description: 'Advanced care and monitoring for peace of mind',
      color: ['#34C759', '#32D74B'],
      icon: Zap,
      features: SUBSCRIPTION_PLANS.premium.features
    },
    {
      id: 'family',
      name: 'Family Plan',
      price: SUBSCRIPTION_PLANS.family.price,
      description: 'Complete care solution for the whole family',
      color: ['#5856D6', '#5E5CE6'],
      icon: Users,
      features: SUBSCRIPTION_PLANS.family.features
    },
    {
      id: 'professional',
      name: 'Professional Plan',
      price: SUBSCRIPTION_PLANS.professional.price,
      description: 'Enterprise-grade features for healthcare providers',
      color: ['#007AFF', '#0055FF'],
      icon: Shield,
      features: SUBSCRIPTION_PLANS.professional.features
    }
  ];

  const handleSubscribe = async () => {
    if (!subscription && !trial) {
      await startTrial(selectedPlan);
    }
    router.push('/subscription/payment');
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Choose Your Plan</Text>
        <Text style={styles.subtitle}>Select the perfect care package for your needs</Text>
      </View>

      <View style={styles.billingToggle}>
        <TouchableOpacity
          style={[
            styles.billingOption,
            billingPeriod === 'monthly' && styles.billingSelected
          ]}
          onPress={() => setBillingPeriod('monthly')}>
          <Text style={[
            styles.billingText,
            billingPeriod === 'monthly' && styles.billingTextSelected
          ]}>Monthly</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.billingOption,
            billingPeriod === 'annual' && styles.billingSelected
          ]}
          onPress={() => setBillingPeriod('annual')}>
          <Text style={[
            styles.billingText,
            billingPeriod === 'annual' && styles.billingTextSelected
          ]}>
            Annual
            <Text style={styles.savingsText}> (Save 20%)</Text>
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.plansContainer}>
        {plans.map((plan) => (
          <TouchableOpacity
            key={plan.id}
            style={[styles.planCard, selectedPlan === plan.id && styles.selectedPlan]}
            onPress={() => setSelectedPlan(plan.id)}>
            <LinearGradient
              colors={plan.color}
              style={styles.planHeader}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}>
              <plan.icon color="#FFF" size={24} />
              <Text style={styles.planName}>{plan.name}</Text>
              <Text style={styles.planPrice}>
                ${billingPeriod === 'monthly' ? plan.price.monthly : plan.price.annual}
                <Text style={styles.perPeriod}>/{billingPeriod === 'monthly' ? 'mo' : 'yr'}</Text>
              </Text>
            </LinearGradient>

            <View style={styles.planContent}>
              <Text style={styles.planDescription}>{plan.description}</Text>
              <View style={styles.featuresContainer}>
                {plan.features.map((feature, index) => (
                  <View key={index} style={styles.featureItem}>
                    <Check color="#34C759" size={16} />
                    <Text style={styles.featureText}>{feature}</Text>
                  </View>
                ))}
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.paymentSection}>
        <Text style={styles.paymentTitle}>Secure Payment Options</Text>
        <View style={styles.paymentMethods}>
          <Image
            source={{ uri: 'https://images.unsplash.com/photo-1607083206968-13611e3d76db?q=80&w=100&auto=format&fit=crop' }}
            style={styles.paymentIcon}
          />
          <Image
            source={{ uri: 'https://images.unsplash.com/photo-1607083206869-4c7672e72a8a?q=80&w=100&auto=format&fit=crop' }}
            style={styles.paymentIcon}
          />
        </View>

        <TouchableOpacity
          style={styles.subscribeButton}
          onPress={handleSubscribe}>
          <LinearGradient
            colors={['#007AFF', '#0055FF']}
            style={styles.subscribeGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}>
            <Text style={styles.subscribeText}>
              {!subscription && !trial ? 'Start Free Trial' : 'Continue to Payment'}
            </Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>

      <View style={styles.guaranteeSection}>
        <Shield color="#34C759" size={24} />
        <Text style={styles.guaranteeTitle}>30-Day Money-Back Guarantee</Text>
        <Text style={styles.guaranteeText}>
          Try CareAI risk-free. If you're not completely satisfied, we'll refund your subscription
          within the first 30 days.
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  header: {
    padding: 24,
    paddingTop: 60,
    backgroundColor: '#FFFFFF',
  },
  title: {
    fontSize: 28,
    fontFamily: 'Inter-Bold',
    color: '#000000',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#666666',
  },
  billingToggle: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    padding: 16,
    marginTop: 1,
  },
  billingOption: {
    flex: 1,
    padding: 12,
    alignItems: 'center',
    borderRadius: 8,
    backgroundColor: '#F2F2F7',
  },
  billingSelected: {
    backgroundColor: '#007AFF',
  },
  billingText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#000000',
  },
  billingTextSelected: {
    color: '#FFFFFF',
  },
  savingsText: {
    fontSize: 14,
    color: '#34C759',
  },
  plansContainer: {
    padding: 16,
  },
  planCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginBottom: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  selectedPlan: {
    borderWidth: 2,
    borderColor: '#007AFF',
  },
  planHeader: {
    padding: 20,
    alignItems: 'center',
  },
  planName: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    color: '#FFFFFF',
    marginTop: 12,
  },
  planPrice: {
    fontSize: 32,
    fontFamily: 'Inter-Bold',
    color: '#FFFFFF',
    marginTop: 8,
  },
  perPeriod: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
  },
  planContent: {
    padding: 20,
  },
  planDescription: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#666666',
    marginBottom: 16,
  },
  featuresContainer: {
    gap: 12,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  featureText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#000000',
  },
  paymentSection: {
    padding: 20,
    backgroundColor: '#FFFFFF',
    marginTop: 16,
  },
  paymentTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#000000',
    marginBottom: 16,
  },
  paymentMethods: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  paymentIcon: {
    width: 48,
    height: 48,
    borderRadius: 8,
  },
  subscribeButton: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  subscribeGradient: {
    padding: 16,
    alignItems: 'center',
  },
  subscribeText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
  },
  guaranteeSection: {
    padding: 20,
    backgroundColor: '#F8F8F8',
    margin: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  guaranteeTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#000000',
    marginTop: 12,
    marginBottom: 8,
  },
  guaranteeText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#666666',
    textAlign: 'center',
    lineHeight: 20,
  },
});