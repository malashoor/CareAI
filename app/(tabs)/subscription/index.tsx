import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import * as Speech from 'expo-speech';
import {
  Check,
  CreditCard,
  Crown,
  Shield,
  Sparkles,
  Star,
  Users,
  Volume2 as VolumeUp,
  X,
  Zap
} from 'lucide-react-native';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { useAuth } from '../../hooks/useAuth';
import { useLanguage } from '../../hooks/useLanguage';
import { SUBSCRIPTION_PLANS, useSubscription } from '../../hooks/useSubscription';

export default function SubscriptionScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { t } = useLanguage();
  const { 
    subscription, 
    trial, 
    loading,
    error,
    startTrial, 
    subscribe,
    isSubscribed,
    isTrialing,
    trialDaysRemaining,
    availablePlans
  } = useSubscription(user?.id || '');

  const [selectedPlan, setSelectedPlan] = useState<string>('premium');
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'annual'>('monthly');
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [paymentData, setPaymentData] = useState({
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    cardholderName: ''
  });

  useEffect(() => {
    if (isSubscribed && subscription) {
      const message = `You are currently subscribed to the ${subscription.plan_type} plan. Enjoy all the premium features!`;
      
      if (Platform.OS !== 'web') {
        Speech.speak(message, { rate: 0.8, pitch: 1.0 });
      }
    } else if (isTrialing && trial) {
      const message = `You have ${trialDaysRemaining} days remaining in your free trial. Upgrade anytime to continue enjoying premium features.`;
      
      if (Platform.OS !== 'web') {
        Speech.speak(message, { rate: 0.8, pitch: 1.0 });
      }
    }
  }, [isSubscribed, isTrialing, subscription, trial, trialDaysRemaining]);

  const plans = [
    {
      id: 'premium',
      name: 'Premium',
      price: SUBSCRIPTION_PLANS.premium.price,
      description: SUBSCRIPTION_PLANS.premium.description,
      color: ['#34C759', '#32D74B'],
      icon: Zap,
      features: SUBSCRIPTION_PLANS.premium.features,
      popular: true
    },
    {
      id: 'family',
      name: 'Family',
      price: SUBSCRIPTION_PLANS.family.price,
      description: SUBSCRIPTION_PLANS.family.description,
      color: ['#5856D6', '#5E5CE6'],
      icon: Users,
      features: SUBSCRIPTION_PLANS.family.features,
      popular: false
    },
    {
      id: 'professional',
      name: 'Professional',
      price: SUBSCRIPTION_PLANS.professional.price,
      description: SUBSCRIPTION_PLANS.professional.description,
      color: ['#007AFF', '#0055FF'],
      icon: Shield,
      features: SUBSCRIPTION_PLANS.professional.features,
      popular: false
    }
  ];

  const speakPlanDetails = async (plan: any) => {
    if (Platform.OS === 'web') return;

    const price = billingPeriod === 'monthly' ? plan.price.monthly : plan.price.annual;
    const message = `${plan.name} plan. ${price} dollars per ${billingPeriod === 'monthly' ? 'month' : 'year'}. ${plan.description}. Features include: ${plan.features.slice(0, 3).join(', ')}.`;
    
    try {
      await Speech.speak(message, { rate: 0.8, pitch: 1.0 });
    } catch (error) {
      console.error('Error speaking plan details:', error);
    }
  };

  const handleStartTrial = async () => {
    try {
      setProcessing(true);
      await startTrial(selectedPlan);
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      
      Alert.alert(
        'Trial Started!',
        `Your 14-day free trial for the ${SUBSCRIPTION_PLANS[selectedPlan].name} plan has started. Enjoy all premium features!`,
        [{ text: 'Great!', onPress: () => router.back() }]
      );
    } catch (error) {
      console.error('Error starting trial:', error);
      Alert.alert('Error', 'Failed to start trial. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  const handleSubscribe = () => {
    if (isTrialing || isSubscribed) {
      setShowPaymentModal(true);
    } else {
      setShowConfirmModal(true);
    }
  };

  const handlePayment = async () => {
    try {
      setProcessing(true);
      
      // Validate payment data
      if (!paymentData.cardNumber || !paymentData.expiryDate || !paymentData.cvv || !paymentData.cardholderName) {
        Alert.alert('Error', 'Please fill in all payment details.');
        return;
      }

      await subscribe(selectedPlan, billingPeriod, paymentData);
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      
      setShowPaymentModal(false);
      
      Alert.alert(
        'Subscription Successful!',
        `Welcome to CareAI ${SUBSCRIPTION_PLANS[selectedPlan].name}! Your subscription is now active.`,
        [{ text: 'Continue', onPress: () => router.back() }]
      );
    } catch (error: any) {
      console.error('Error processing payment:', error);
      Alert.alert('Payment Failed', error.message || 'Please check your payment details and try again.');
    } finally {
      setProcessing(false);
    }
  };

  const getSavingsPercentage = () => {
    const plan = SUBSCRIPTION_PLANS[selectedPlan];
    if (!plan) return 0;
    
    const monthlyTotal = plan.price.monthly * 12;
    const annualPrice = plan.price.annual;
    const savings = ((monthlyTotal - annualPrice) / monthlyTotal) * 100;
    
    return Math.round(savings);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Loading subscription details...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Choose Your Plan</Text>
        <Text style={styles.subtitle}>
          {isSubscribed 
            ? 'Manage your subscription' 
            : isTrialing 
              ? `${trialDaysRemaining} days left in trial`
              : 'Select the perfect care package for your needs'
          }
        </Text>
      </View>

      {isTrialing && (
        <View style={styles.trialBanner}>
          <LinearGradient
            colors={['#FF9500', '#FF7F00']}
            style={styles.trialGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}>
            <Crown color="#FFF" size={24} />
            <View style={styles.trialContent}>
              <Text style={styles.trialTitle}>Free Trial Active</Text>
              <Text style={styles.trialText}>
                {trialDaysRemaining} days remaining • Upgrade anytime
              </Text>
            </View>
          </LinearGradient>
        </View>
      )}

      {isSubscribed && subscription && (
        <View style={styles.currentPlanBanner}>
          <LinearGradient
            colors={['#34C759', '#32D74B']}
            style={styles.currentPlanGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}>
            <Sparkles color="#FFF" size={24} />
            <View style={styles.currentPlanContent}>
              <Text style={styles.currentPlanTitle}>Current Plan: {subscription.plan_type}</Text>
              <Text style={styles.currentPlanText}>
                Active until {new Date(subscription.current_period_end).toLocaleDateString()}
              </Text>
            </View>
          </LinearGradient>
        </View>
      )}

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
            <Text style={styles.savingsText}> (Save {getSavingsPercentage()}%)</Text>
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.plansContainer}>
        {plans.map((plan) => (
          <TouchableOpacity
            key={plan.id}
            style={[
              styles.planCard, 
              selectedPlan === plan.id && styles.selectedPlan,
              plan.popular && styles.popularPlan
            ]}
            onPress={() => setSelectedPlan(plan.id)}>
            
            {plan.popular && (
              <View style={styles.popularBadge}>
                <Star color="#FFF" size={12} />
                <Text style={styles.popularText}>Most Popular</Text>
              </View>
            )}

            <LinearGradient
              colors={plan.color}
              style={styles.planHeader}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}>
              <plan.icon color="#FFF" size={32} />
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

              <TouchableOpacity
                style={styles.speakButton}
                onPress={() => speakPlanDetails(plan)}>
                <VolumeUp color="#007AFF" size={20} />
                <Text style={styles.speakButtonText}>Hear Details</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.paymentSection}>
        <Text style={styles.paymentTitle}>Secure Payment</Text>
        <View style={styles.paymentMethods}>
          <Image
            source={{ uri: 'https://images.unsplash.com/photo-1607083206968-13611e3d76db?q=80&w=100&auto=format&fit=crop' }}
            style={styles.paymentIcon}
          />
          <Image
            source={{ uri: 'https://images.unsplash.com/photo-1607083206869-4c7672e72a8a?q=80&w=100&auto=format&fit=crop' }}
            style={styles.paymentIcon}
          />
          <Image
            source={{ uri: 'https://images.unsplash.com/photo-1607083207968-f3d49b5e6e5e?q=80&w=100&auto=format&fit=crop' }}
            style={styles.paymentIcon}
          />
        </View>

        <TouchableOpacity
          style={[styles.subscribeButton, processing && styles.subscribeButtonDisabled]}
          onPress={handleSubscribe}
          disabled={processing}>
          <LinearGradient
            colors={processing ? ['#999', '#999'] : ['#007AFF', '#0055FF']}
            style={styles.subscribeGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}>
            {processing ? (
              <ActivityIndicator color="#FFF" size="small" />
            ) : (
              <CreditCard color="#FFF" size={20} />
            )}
            <Text style={styles.subscribeText}>
              {processing 
                ? 'Processing...' 
                : isSubscribed 
                  ? 'Change Plan'
                  : isTrialing 
                    ? 'Upgrade Now' 
                    : 'Start Free Trial'
              }
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

      {/* Confirmation Modal */}
      <Modal
        visible={showConfirmModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowConfirmModal(false)}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Start Free Trial?</Text>
              <TouchableOpacity onPress={() => setShowConfirmModal(false)}>
                <X color="#666666" size={24} />
              </TouchableOpacity>
            </View>
            
            <View style={styles.modalBody}>
              <Text style={styles.confirmText}>
                Start your 14-day free trial for the {SUBSCRIPTION_PLANS[selectedPlan].name} plan.
                No payment required now.
              </Text>
              
              <View style={styles.trialFeatures}>
                <Text style={styles.trialFeaturesTitle}>What's included:</Text>
                {SUBSCRIPTION_PLANS[selectedPlan].features.slice(0, 4).map((feature, index) => (
                  <View key={index} style={styles.trialFeatureItem}>
                    <Check color="#34C759" size={16} />
                    <Text style={styles.trialFeatureText}>{feature}</Text>
                  </View>
                ))}
              </View>
            </View>
            
            <View style={styles.modalActions}>
              <TouchableOpacity 
                style={styles.cancelButton} 
                onPress={() => setShowConfirmModal(false)}>
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.confirmButton} 
                onPress={() => {
                  setShowConfirmModal(false);
                  handleStartTrial();
                }}>
                <LinearGradient
                  colors={['#34C759', '#32D74B']}
                  style={styles.confirmGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}>
                  <Text style={styles.confirmButtonText}>Start Trial</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Payment Modal */}
      <Modal
        visible={showPaymentModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowPaymentModal(false)}>
        <View style={styles.modalContainer}>
          <View style={styles.paymentModalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Payment Details</Text>
              <TouchableOpacity onPress={() => setShowPaymentModal(false)}>
                <X color="#666666" size={24} />
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.paymentForm}>
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Cardholder Name</Text>
                <TextInput
                  style={styles.formInput}
                  value={paymentData.cardholderName}
                  onChangeText={(text) => setPaymentData(prev => ({ ...prev, cardholderName: text }))}
                  placeholder="John Doe"
                  placeholderTextColor="#999"
                />
              </View>
              
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Card Number</Text>
                <TextInput
                  style={styles.formInput}
                  value={paymentData.cardNumber}
                  onChangeText={(text) => setPaymentData(prev => ({ ...prev, cardNumber: text }))}
                  placeholder="1234 5678 9012 3456"
                  placeholderTextColor="#999"
                  keyboardType="numeric"
                  maxLength={19}
                />
              </View>
              
              <View style={styles.formRow}>
                <View style={styles.formGroupHalf}>
                  <Text style={styles.formLabel}>Expiry Date</Text>
                  <TextInput
                    style={styles.formInput}
                    value={paymentData.expiryDate}
                    onChangeText={(text) => setPaymentData(prev => ({ ...prev, expiryDate: text }))}
                    placeholder="MM/YY"
                    placeholderTextColor="#999"
                    keyboardType="numeric"
                    maxLength={5}
                  />
                </View>
                
                <View style={styles.formGroupHalf}>
                  <Text style={styles.formLabel}>CVV</Text>
                  <TextInput
                    style={styles.formInput}
                    value={paymentData.cvv}
                    onChangeText={(text) => setPaymentData(prev => ({ ...prev, cvv: text }))}
                    placeholder="123"
                    placeholderTextColor="#999"
                    keyboardType="numeric"
                    maxLength={4}
                    secureTextEntry
                  />
                </View>
              </View>
              
              <View style={styles.orderSummary}>
                <Text style={styles.orderTitle}>Order Summary</Text>
                <View style={styles.orderRow}>
                  <Text style={styles.orderLabel}>{SUBSCRIPTION_PLANS[selectedPlan].name} Plan</Text>
                  <Text style={styles.orderValue}>
                    ${billingPeriod === 'monthly' 
                      ? SUBSCRIPTION_PLANS[selectedPlan].price.monthly 
                      : SUBSCRIPTION_PLANS[selectedPlan].price.annual
                    }
                  </Text>
                </View>
                <View style={styles.orderRow}>
                  <Text style={styles.orderLabel}>Billing Period</Text>
                  <Text style={styles.orderValue}>{billingPeriod}</Text>
                </View>
                <View style={[styles.orderRow, styles.orderTotal]}>
                  <Text style={styles.orderTotalLabel}>Total</Text>
                  <Text style={styles.orderTotalValue}>
                    ${billingPeriod === 'monthly' 
                      ? SUBSCRIPTION_PLANS[selectedPlan].price.monthly 
                      : SUBSCRIPTION_PLANS[selectedPlan].price.annual
                    }
                  </Text>
                </View>
              </View>
            </ScrollView>
            
            <View style={styles.modalActions}>
              <TouchableOpacity 
                style={styles.cancelButton} 
                onPress={() => setShowPaymentModal(false)}>
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.confirmButton, processing && styles.confirmButtonDisabled]} 
                onPress={handlePayment}
                disabled={processing}>
                <LinearGradient
                  colors={processing ? ['#999', '#999'] : ['#007AFF', '#0055FF']}
                  style={styles.confirmGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}>
                  {processing ? (
                    <ActivityIndicator color="#FFF" size="small" />
                  ) : (
                    <Text style={styles.confirmButtonText}>
                      Pay ${billingPeriod === 'monthly' 
                        ? SUBSCRIPTION_PLANS[selectedPlan].price.monthly 
                        : SUBSCRIPTION_PLANS[selectedPlan].price.annual
                      }
                    </Text>
                  )}
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F2F2F7',
  },
  loadingText: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#666666',
    marginTop: 16,
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
  trialBanner: {
    margin: 16,
    borderRadius: 12,
    overflow: 'hidden',
  },
  trialGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  trialContent: {
    marginLeft: 12,
    flex: 1,
  },
  trialTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
  },
  trialText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#FFFFFF',
    opacity: 0.9,
  },
  currentPlanBanner: {
    margin: 16,
    borderRadius: 12,
    overflow: 'hidden',
  },
  currentPlanGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  currentPlanContent: {
    marginLeft: 12,
    flex: 1,
  },
  currentPlanTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
  },
  currentPlanText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#FFFFFF',
    opacity: 0.9,
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
  popularPlan: {
    borderWidth: 2,
    borderColor: '#FF9500',
  },
  popularBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: '#FF9500',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    zIndex: 1,
  },
  popularText: {
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
    marginLeft: 4,
  },
  planHeader: {
    padding: 24,
    alignItems: 'center',
  },
  planName: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    color: '#FFFFFF',
    marginTop: 12,
  },
  planPrice: {
    fontSize: 36,
    fontFamily: 'Inter-Bold',
    color: '#FFFFFF',
    marginTop: 8,
  },
  perPeriod: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
  },
  planContent: {
    padding: 24,
  },
  planDescription: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#666666',
    marginBottom: 20,
    textAlign: 'center',
  },
  featuresContainer: {
    gap: 12,
    marginBottom: 20,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  featureText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#000000',
    flex: 1,
  },
  speakButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F8F8F8',
    padding: 12,
    borderRadius: 8,
    gap: 8,
  },
  speakButtonText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#007AFF',
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
    height: 32,
    borderRadius: 4,
  },
  subscribeButton: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  subscribeButtonDisabled: {
    opacity: 0.6,
  },
  subscribeGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    gap: 8,
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
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    margin: 32,
    maxWidth: 400,
    width: '100%',
  },
  paymentModalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    margin: 32,
    maxWidth: 400,
    width: '100%',
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  modalTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#000000',
  },
  modalBody: {
    padding: 20,
  },
  confirmText: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#666666',
    textAlign: 'center',
    marginBottom: 20,
  },
  trialFeatures: {
    backgroundColor: '#F8F8F8',
    padding: 16,
    borderRadius: 12,
  },
  trialFeaturesTitle: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#000000',
    marginBottom: 12,
  },
  trialFeatureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  trialFeatureText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#000000',
  },
  paymentForm: {
    padding: 20,
    maxHeight: 400,
  },
  formGroup: {
    marginBottom: 16,
  },
  formRow: {
    flexDirection: 'row',
    gap: 12,
  },
  formGroupHalf: {
    flex: 1,
    marginBottom: 16,
  },
  formLabel: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#000000',
    marginBottom: 8,
  },
  formInput: {
    borderWidth: 1,
    borderColor: '#E5E5EA',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#000000',
  },
  orderSummary: {
    backgroundColor: '#F8F8F8',
    padding: 16,
    borderRadius: 12,
    marginTop: 16,
  },
  orderTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#000000',
    marginBottom: 12,
  },
  orderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  orderLabel: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#666666',
  },
  orderValue: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#000000',
  },
  orderTotal: {
    borderTopWidth: 1,
    borderTopColor: '#E5E5EA',
    paddingTop: 8,
    marginTop: 8,
  },
  orderTotalLabel: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#000000',
  },
  orderTotalValue: {
    fontSize: 16,
    fontFamily: 'Inter-Bold',
    color: '#007AFF',
  },
  modalActions: {
    flexDirection: 'row',
    padding: 20,
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#F8F8F8',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#666666',
  },
  confirmButton: {
    flex: 1,
    borderRadius: 8,
    overflow: 'hidden',
  },
  confirmButtonDisabled: {
    opacity: 0.6,
  },
  confirmGradient: {
    padding: 16,
    alignItems: 'center',
  },
  confirmButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
  },
});