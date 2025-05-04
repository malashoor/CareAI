import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, ActivityIndicator, Text, TextInput } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { theme } from '../../theme';
import { AccessibleContainer } from '../../components/AccessibleContainer';
import { AccessibleInput } from '../../components/AccessibleInput';
import { AccessibleButton } from '../../components/AccessibleButton';
import { accessibility } from '../../utils/accessibility';
import { t } from '../../i18n';
import { AdminNavigationProp, AdminStackParamList } from '../../types/navigation';
import { FormErrorBoundary } from '../../components/FormErrorBoundary';
import DateTimePicker from '@react-native-community/datetimepicker';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL || '',
  process.env.SUPABASE_ANON_KEY || ''
);

interface DiscountsEditScreenProps {
  navigation: AdminNavigationProp;
  route: RouteProp<AdminStackParamList, 'DiscountsEdit'>;
}

export default function DiscountsEditScreen({ navigation, route }: DiscountsEditScreenProps) {
  const { discountId } = route.params;

  const [formData, setFormData] = useState({
    code: '',
    description: '',
    discountType: 'percent' as 'percent' | 'fixed',
    value: '',
    expiresAt: null as Date | null,
    maxUses: '',
    appliesTo: 'all' as 'all' | 'basic' | 'premium' | 'family',
    minPurchaseAmount: '',
    maxDiscountAmount: '',
    isActive: true,
  });

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadDiscountData();
  }, [discountId]);

  const loadDiscountData = async () => {
    try {
      const { data, error } = await supabase
        .from('discount_codes')
        .select('*')
        .eq('id', discountId)
        .single();

      if (error) throw error;
      if (!data) throw new Error('Discount not found');

      setFormData({
        code: data.code,
        description: data.description || '',
        discountType: data.discount_type,
        value: data.value.toString(),
        expiresAt: data.expires_at ? new Date(data.expires_at) : null,
        maxUses: data.max_uses.toString(),
        appliesTo: data.applies_to,
        minPurchaseAmount: data.conditions?.minPurchaseAmount?.toString() || '',
        maxDiscountAmount: data.conditions?.maxDiscountAmount?.toString() || '',
        isActive: data.is_active,
      });
    } catch (err) {
      setError('Failed to load discount data');
      console.error('Error loading discount:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!formData.code.trim() || !formData.value.trim()) {
      setError('Please fill in all required fields');
      return;
    }

    setIsSubmitting(true);
    try {
      await supabase
        .from('discount_codes')
        .update({
          code: formData.code,
          discount_type: formData.discountType,
          value: Number(formData.value),
          expires_at: formData.expiresAt?.toISOString() || null,
          max_uses: Number(formData.maxUses) || 1000,
          applies_to: formData.appliesTo,
          description: formData.description,
          is_active: formData.isActive,
          conditions: {
            minPurchaseAmount: formData.minPurchaseAmount ? Number(formData.minPurchaseAmount) : null,
            maxDiscountAmount: formData.maxDiscountAmount ? Number(formData.maxDiscountAmount) : null,
          },
        })
        .eq('id', discountId);

      navigation.goBack();
    } catch (err) {
      setError('Failed to update discount code. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    navigation.goBack();
  };

  if (isLoading) {
    return (
      <AccessibleContainer style={styles.container}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </AccessibleContainer>
    );
  }

  return (
    <FormErrorBoundary formName="discountEdit">
      <AccessibleContainer
        style={styles.container}
        accessibilityLabel={t('admin.discounts.edit')}
        accessibilityRole="main"
      >
        <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
          {error && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          <AccessibleInput
            label={t('admin.discounts.form.code')}
            value={formData.code}
            onChangeText={(text) => setFormData({ ...formData, code: text })}
            placeholder="Enter discount code"
            error={error && !formData.code.trim() ? 'Required field' : undefined}
          />

          <AccessibleInput
            label={t('admin.discounts.form.description')}
            value={formData.description}
            onChangeText={(text) => setFormData({ ...formData, description: text })}
            placeholder="Enter discount description"
            multiline
            style={{ minHeight: 100 }}
          />

          <View style={styles.discountContainer}>
            <AccessibleButton
              title={formData.discountType === 'percent' ? '%' : '$'}
              onPress={() => setFormData({ 
                ...formData, 
                discountType: formData.discountType === 'percent' ? 'fixed' : 'percent' 
              })}
              variant="secondary"
              style={styles.discountTypeButton}
              accessibilityLabel={t('admin.discounts.form.discountType')}
              accessibilityHint="Toggle between percentage and fixed value"
            />

            <AccessibleInput
              label={t('admin.discounts.form.value')}
              value={formData.value}
              onChangeText={(text) => setFormData({ ...formData, value: text })}
              placeholder={formData.discountType === 'percent' ? 'Enter percentage' : 'Enter amount'}
              error={error && !formData.value.trim() ? 'Required field' : undefined}
              style={{ flex: 1 }}
            />
          </View>

          <View style={styles.dateContainer}>
            <AccessibleButton
              title={formData.expiresAt ? formData.expiresAt.toLocaleDateString() : t('admin.discounts.form.noExpiry')}
              onPress={() => setShowDatePicker(true)}
              variant="secondary"
              style={styles.dateButton}
              accessibilityLabel={t('admin.discounts.form.expiresAt')}
              accessibilityHint={formData.expiresAt ? 
                `Current expiry date: ${formData.expiresAt.toLocaleDateString()}. Tap to change.` : 
                'No expiry date set. Tap to set an expiry date.'}
              {...accessibility.getAccessibilityProps({
                label: t('admin.discounts.form.expiresAt'),
                hint: formData.expiresAt ? 
                  `Current expiry date: ${formData.expiresAt.toLocaleDateString()}. Tap to change.` : 
                  'No expiry date set. Tap to set an expiry date.',
                role: 'button'
              })}
            />
            {formData.expiresAt && (
              <AccessibleButton
                title={t('admin.discounts.form.clearExpiry')}
                onPress={() => setFormData({ ...formData, expiresAt: null })}
                variant="secondary"
                style={styles.clearDateButton}
                accessibilityLabel={t('admin.discounts.form.clearExpiry')}
                accessibilityHint="Remove expiry date"
                {...accessibility.getAccessibilityProps({
                  label: t('admin.discounts.form.clearExpiry'),
                  hint: 'Remove expiry date',
                  role: 'button'
                })}
              />
            )}
          </View>

          {showDatePicker && (
            <DateTimePicker
              value={formData.expiresAt || new Date()}
              mode="date"
              display="default"
              onChange={(event, selectedDate) => {
                setShowDatePicker(false);
                if (selectedDate) {
                  setFormData({ ...formData, expiresAt: selectedDate });
                }
              }}
              minimumDate={new Date()}
            />
          )}

          <AccessibleInput
            label={t('admin.discounts.form.maxUses')}
            value={formData.maxUses}
            onChangeText={(text) => setFormData({ ...formData, maxUses: text })}
            placeholder="Enter maximum uses (optional)"
            style={{ flex: 1 }}
          />

          <AccessibleInput
            label={t('admin.discounts.form.minPurchaseAmount')}
            value={formData.minPurchaseAmount}
            onChangeText={(text) => setFormData({ ...formData, minPurchaseAmount: text })}
            placeholder="Enter minimum purchase amount (optional)"
            style={{ flex: 1 }}
          />

          <AccessibleInput
            label={t('admin.discounts.form.maxDiscountAmount')}
            value={formData.maxDiscountAmount}
            onChangeText={(text) => setFormData({ ...formData, maxDiscountAmount: text })}
            placeholder="Enter maximum discount amount (optional)"
            style={{ flex: 1 }}
          />

          <View style={styles.buttonContainer}>
            <AccessibleButton
              title={t('admin.discounts.form.cancel')}
              onPress={handleCancel}
              variant="secondary"
              disabled={isSubmitting}
              accessibilityLabel={t('admin.discounts.form.cancel')}
              accessibilityHint="Cancel editing discount"
            />
            <AccessibleButton
              title={t('admin.discounts.form.update')}
              onPress={handleSubmit}
              variant="primary"
              disabled={isSubmitting}
              accessibilityLabel={t('admin.discounts.form.update')}
              accessibilityHint="Update discount"
            />
          </View>
        </ScrollView>
      </AccessibleContainer>
    </FormErrorBoundary>
  );
}

const styles = StyleSheet.create({
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: theme.spacing.lg,
  },
  container: {
    backgroundColor: theme.colors.background,
    flex: 1,
  },
  content: {
    padding: theme.spacing.lg,
  },
  dateContainer: {
    alignItems: 'center',
    flexDirection: 'row',
    marginBottom: theme.spacing.md,
  },
  dateButton: {
    flex: 1,
  },
  clearDateButton: {
    marginLeft: theme.spacing.sm,
  },
  discountContainer: {
    alignItems: 'center',
    flexDirection: 'row',
    marginBottom: theme.spacing.md,
  },
  discountTypeButton: {
    marginRight: theme.spacing.md,
    minWidth: 60,
  },
  errorContainer: {
    backgroundColor: theme.colors.error + '20',
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing.lg,
    padding: theme.spacing.md,
  },
  errorText: {
    color: theme.colors.error,
    fontFamily: theme.typography.label.fontFamily,
    fontSize: theme.typography.label.fontSize,
  },
  scrollView: {
    flex: 1,
  }
}); 