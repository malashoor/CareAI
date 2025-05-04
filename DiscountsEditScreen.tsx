import React from 'react';
import { View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { AccessibleInput } from '../components/AccessibleInput';
import { useAccessibility } from '../hooks/useAccessibility';

interface FormData {
  maxUses?: number;
  minPurchaseAmount?: number;
  maxDiscountAmount?: number;
}

export const DiscountsEditScreen: React.FC = () => {
  const { t } = useTranslation();
  const accessibility = useAccessibility();
  const [formData, setFormData] = React.useState<FormData>({});

  return (
    <View style={{ flex: 1 }}>
      <AccessibleInput
        label={t('admin.discounts.form.maxUses')}
        value={formData.maxUses?.toString()}
        onChangeText={(text) => setFormData({ ...formData, maxUses: parseInt(text) || 0 })}
        placeholder="Enter maximum uses"
        keyboardType="numeric"
        style={{ flex: 1 }}
        {...accessibility.getAccessibilityProps({
          label: t('admin.discounts.form.maxUses'),
          hint: 'Enter the maximum number of times this discount can be used',
          role: 'textbox'
        })}
      />

      <AccessibleInput
        label={t('admin.discounts.form.minPurchaseAmount')}
        value={formData.minPurchaseAmount?.toString()}
        onChangeText={(text) => setFormData({ ...formData, minPurchaseAmount: parseFloat(text) || 0 })}
        placeholder="Enter minimum purchase amount"
        keyboardType="decimal-pad"
        style={{ flex: 1 }}
        {...accessibility.getAccessibilityProps({
          label: t('admin.discounts.form.minPurchaseAmount'),
          hint: 'Enter the minimum purchase amount required',
          role: 'textbox'
        })}
      />

      <AccessibleInput
        label={t('admin.discounts.form.maxDiscountAmount')}
        value={formData.maxDiscountAmount?.toString()}
        onChangeText={(text) => setFormData({ ...formData, maxDiscountAmount: parseFloat(text) || 0 })}
        placeholder="Enter maximum discount amount"
        keyboardType="decimal-pad"
        style={{ flex: 1 }}
        {...accessibility.getAccessibilityProps({
          label: t('admin.discounts.form.maxDiscountAmount'),
          hint: 'Enter the maximum discount amount allowed',
          role: 'textbox'
        })}
      />
    </View>
  );
}; 