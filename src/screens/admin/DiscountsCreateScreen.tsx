import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Text, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { theme } from '../../theme';
import { AccessibleContainer } from '../../components/AccessibleContainer';
import { AccessibleInput } from '../../components/AccessibleInput';
import { AccessibleButton } from '../../components/AccessibleButton';
import { accessibility } from '../../utils/accessibility';
import { t } from '../../i18n';
import { AdminNavigationProp } from '../../types/navigation';
import { FormErrorBoundary } from '../../components/FormErrorBoundary';
import DateTimePicker from '@react-native-community/datetimepicker';
import { createClient } from '@supabase/supabase-js';
import { AccessibleModal } from '../../components/AccessibleModal';

const supabase = createClient(
  process.env.SUPABASE_URL || '',
  process.env.SUPABASE_ANON_KEY || ''
);

interface DiscountsCreateScreenProps {
  navigation: AdminNavigationProp;
}

export default function DiscountsCreateScreen({ navigation }: DiscountsCreateScreenProps) {
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
  });

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const errors: Record<string, string> = {};

    if (!formData.code.trim()) {
      errors.code = t('admin.discounts.validation.codeRequired');
    } else if (formData.code.length < 3) {
      errors.code = t('admin.discounts.validation.codeTooShort');
    }

    if (!formData.value.trim()) {
      errors.value = t('admin.discounts.validation.valueRequired');
    } else {
      const value = Number(formData.value);
      if (isNaN(value)) {
        errors.value = t('admin.discounts.validation.invalidValue');
      } else if (formData.discountType === 'percent' && (value < 0 || value > 100)) {
        errors.value = t('admin.discounts.validation.invalidPercentage');
      } else if (formData.discountType === 'fixed' && value <= 0) {
        errors.value = t('admin.discounts.validation.invalidAmount');
      }
    }

    if (formData.maxUses && Number(formData.maxUses) <= 0) {
      errors.maxUses = t('admin.discounts.validation.invalidMaxUses');
    }

    if (formData.minPurchaseAmount && Number(formData.minPurchaseAmount) <= 0) {
      errors.minPurchaseAmount = t('admin.discounts.validation.invalidMinPurchase');
    }

    if (formData.maxDiscountAmount && Number(formData.maxDiscountAmount) <= 0) {
      errors.maxDiscountAmount = t('admin.discounts.validation.invalidMaxDiscount');
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    setShowConfirmModal(true);
  };

  const handleConfirmSubmit = async () => {
    setIsSubmitting(true);
    setShowConfirmModal(false);
    setError(null);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      await supabase.from('discount_codes').insert({
        code: formData.code,
        discount_type: formData.discountType,
        value: Number(formData.value),
        expires_at: formData.expiresAt?.toISOString() || null,
        max_uses: Number(formData.maxUses) || 1000,
        applies_to: formData.appliesTo,
        created_by: user.id,
        description: formData.description,
        conditions: {
          minPurchaseAmount: formData.minPurchaseAmount ? Number(formData.minPurchaseAmount) : null,
          maxDiscountAmount: formData.maxDiscountAmount ? Number(formData.maxDiscountAmount) : null,
        },
      });

      navigation.goBack();
    } catch (err) {
      setError(t('admin.discounts.createError'));
      console.error('Error creating discount:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    if (isSubmitting) return;
    navigation.goBack();
  };

  return (
    <FormErrorBoundary formName="discountCreate">
      <AccessibleContainer
        style={styles.container}
        accessibilityLabel={t('admin.discounts.create')}
        accessibilityRole="main"
      >
        <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
          {error && (
            <View style={styles.errorContainer}>
              <Text 
                style={styles.errorText}
                {...accessibility.getAccessibilityProps({
                  label: error,
                  role: 'alert'
                })}
              >
                {error}
              </Text>
            </View>
          )}

          <AccessibleInput
            label={t('admin.discounts.form.code')}
            value={formData.code}
            onChangeText={(text) => setFormData({ ...formData, code: text })}
            placeholder="Enter discount code"
            error={validationErrors.code}
            {...accessibility.getAccessibilityProps({
              label: t('admin.discounts.form.code'),
              hint: 'Enter the discount code',
              role: 'textbox',
              state: { required: true }
            })}
          />

          <AccessibleInput
            label={t('admin.discounts.form.description')}
            value={formData.description}
            onChangeText={(text) => setFormData({ ...formData, description: text })}
            placeholder="Enter discount description"
            multiline
            style={{ minHeight: 100 }}
            {...accessibility.getAccessibilityProps({
              label: t('admin.discounts.form.description'),
              hint: 'Enter a description of the discount',
              role: 'textbox'
            })}
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
              {...accessibility.getAccessibilityProps({
                label: t('admin.discounts.form.discountType'),
                hint: 'Toggle between percentage and fixed value',
                role: 'button',
                state: { selected: formData.discountType === 'percent' }
              })}
            />

            <AccessibleInput
              label={t('admin.discounts.form.value')}
              value={formData.value}
              onChangeText={(text) => setFormData({ ...formData, value: text })}
              placeholder={formData.discountType === 'percent' ? 'Enter percentage' : 'Enter amount'}
              error={validationErrors.value}
              style={{ flex: 1 }}
              {...accessibility.getAccessibilityProps({
                label: t('admin.discounts.form.value'),
                hint: formData.discountType === 'percent' ? 'Enter discount percentage' : 'Enter discount amount',
                role: 'textbox',
                state: { required: true }
              })}
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
                variant="text"
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
            keyboardType="numeric"
            error={validationErrors.maxUses}
            style={{ flex: 1 }}
            {...accessibility.getAccessibilityProps({
              label: t('admin.discounts.form.maxUses'),
              hint: 'Enter the maximum number of times this discount can be used',
              role: 'textbox'
            })}
          />

          <AccessibleInput
            label={t('admin.discounts.form.minPurchaseAmount')}
            value={formData.minPurchaseAmount}
            onChangeText={(text) => setFormData({ ...formData, minPurchaseAmount: text })}
            placeholder="Enter minimum purchase amount (optional)"
            keyboardType="numeric"
            error={validationErrors.minPurchaseAmount}
            style={{ flex: 1 }}
            {...accessibility.getAccessibilityProps({
              label: t('admin.discounts.form.minPurchaseAmount'),
              hint: 'Enter the minimum purchase amount',
              role: 'textbox'
            })}
          />

          <AccessibleInput
            label={t('admin.discounts.form.maxDiscountAmount')}
            value={formData.maxDiscountAmount}
            onChangeText={(text) => setFormData({ ...formData, maxDiscountAmount: text })}
            placeholder="Enter maximum discount amount (optional)"
            keyboardType="numeric"
            error={validationErrors.maxDiscountAmount}
            style={{ flex: 1 }}
            {...accessibility.getAccessibilityProps({
              label: t('admin.discounts.form.maxDiscountAmount'),
              hint: 'Enter the maximum discount amount',
              role: 'textbox'
            })}
          />

          <View style={styles.buttonContainer}>
            <AccessibleButton
              title={t('admin.discounts.form.cancel')}
              onPress={handleCancel}
              variant="secondary"
              disabled={isSubmitting}
              accessibilityLabel={t('admin.discounts.form.cancel')}
              accessibilityHint="Cancel creating discount"
              {...accessibility.getAccessibilityProps({
                label: t('admin.discounts.form.cancel'),
                hint: 'Cancel creating discount',
                role: 'button',
                state: { disabled: isSubmitting }
              })}
            />
            <AccessibleButton
              title={isSubmitting ? t('admin.discounts.form.submitting') : t('admin.discounts.form.submit')}
              onPress={handleSubmit}
              variant="primary"
              disabled={isSubmitting}
              accessibilityLabel={isSubmitting ? t('admin.discounts.form.submitting') : t('admin.discounts.form.submit')}
              accessibilityHint="Create new discount"
              {...accessibility.getAccessibilityProps({
                label: isSubmitting ? t('admin.discounts.form.submitting') : t('admin.discounts.form.submit'),
                hint: 'Create new discount',
                role: 'button',
                state: { disabled: isSubmitting }
              })}
            />
          </View>
        </ScrollView>

        <AccessibleModal
          visible={showConfirmModal}
          onDismiss={() => setShowConfirmModal(false)}
          title={t('admin.discounts.confirmCreate.title')}
          message={t('admin.discounts.confirmCreate.message')}
          confirmLabel={t('admin.discounts.confirmCreate.confirm')}
          cancelLabel={t('admin.discounts.confirmCreate.cancel')}
          onConfirm={handleConfirmSubmit}
          onCancel={() => setShowConfirmModal(false)}
        />
      </AccessibleContainer>
    </FormErrorBoundary>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.background,
    flex: 1,
  },
  content: {
    padding: theme.spacing.lg,
  },
  scrollView: {
    flex: 1,
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
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  dateButton: {
    flex: 1,
  },
  clearDateButton: {
    marginLeft: theme.spacing.sm,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: theme.spacing.lg,
  },
  errorContainer: {
    backgroundColor: theme.colors.error + '20',
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing.lg,
    padding: theme.spacing.md,
  },
  errorText: {
    color: theme.colors.error,
    fontFamily: theme.typography.body1.fontFamily,
    fontSize: theme.typography.body1.fontSize,
  },
}); 