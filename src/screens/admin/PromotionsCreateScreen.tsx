import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Platform, Text } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { theme } from '../../theme';
import { AccessibleContainer } from '../../components/AccessibleContainer';
import { AccessibleInput } from '../../components/AccessibleInput';
import { AccessibleButton } from '../../components/AccessibleButton';
import { accessibility } from '../../utils/accessibility';
import { t } from '../../i18n';
import { AdminNavigationProp } from '../../types/navigation';
import DateTimePicker from '@react-native-community/datetimepicker';
import { FormErrorBoundary } from '../../components/FormErrorBoundary';

interface PromotionsCreateScreenProps {
  navigation: AdminNavigationProp;
}

export default function PromotionsCreateScreen({ navigation }: PromotionsCreateScreenProps) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    startDate: new Date(),
    endDate: new Date(),
    discountType: 'percentage' as 'percentage' | 'value',
    discountValue: '',
    maxUses: '',
    isActive: true,
  });

  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!formData.title.trim() || !formData.description.trim() || !formData.discountValue.trim()) {
      setError('Please fill in all required fields');
      return;
    }

    setIsSubmitting(true);
    try {
      // TODO: Implement API call to create promotion
      navigation.goBack();
    } catch (err) {
      setError('Failed to create promotion. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    navigation.goBack();
  };

  return (
    <FormErrorBoundary formName="PromotionsCreate">
      <AccessibleContainer
        style={styles.container}
        accessibilityLabel="Create Promotion Screen"
        accessibilityRole="main"
        accessibilityLiveRegion="polite"
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          {...accessibility.getAccessibilityProps({
            label: 'Create Promotion Form',
            role: 'form'
          })}
        >
          <View style={styles.header}>
            <AccessibleButton
              label={t('admin.promotions.form.cancel')}
              onPress={handleCancel}
              variant="outline"
              style={styles.backButton}
              {...accessibility.getAccessibilityProps({
                label: t('admin.promotions.form.cancel'),
                hint: 'Go back to promotions list',
                role: 'button'
              })}
            />
            <Text 
              style={styles.title}
              {...accessibility.getAccessibilityProps({
                label: t('admin.promotions.create'),
                role: 'header'
              })}
            >
              {t('admin.promotions.create')}
            </Text>
          </View>

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
            label={t('admin.promotions.form.title')}
            value={formData.title}
            onChangeText={(text) => setFormData({ ...formData, title: text })}
            placeholder="Enter promotion title"
            error={error && !formData.title.trim() ? 'Required field' : undefined}
            {...accessibility.getAccessibilityProps({
              label: t('admin.promotions.form.title'),
              hint: 'Enter the title of the promotion',
              role: 'textbox',
              state: { required: true }
            })}
          />

          <AccessibleInput
            label={t('admin.promotions.form.description')}
            value={formData.description}
            onChangeText={(text) => setFormData({ ...formData, description: text })}
            placeholder="Enter promotion description"
            multiline
            numberOfLines={4}
            error={error && !formData.description.trim() ? 'Required field' : undefined}
            {...accessibility.getAccessibilityProps({
              label: t('admin.promotions.form.description'),
              hint: 'Enter a description of the promotion',
              role: 'textbox',
              state: { required: true }
            })}
          />

          <View style={styles.dateContainer}>
            <AccessibleButton
              label={t('admin.promotions.form.startDate')}
              onPress={() => setShowStartDatePicker(true)}
              variant="outline"
              style={styles.dateButton}
              {...accessibility.getAccessibilityProps({
                label: t('admin.promotions.form.startDate'),
                hint: 'Select start date',
                role: 'button'
              })}
            >
              {formData.startDate.toLocaleDateString()}
            </AccessibleButton>

            {showStartDatePicker && (
              <DateTimePicker
                value={formData.startDate}
                mode="date"
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                onChange={(event, selectedDate) => {
                  setShowStartDatePicker(false);
                  if (selectedDate) {
                    setFormData({ ...formData, startDate: selectedDate });
                  }
                }}
              />
            )}
          </View>

          <View style={styles.dateContainer}>
            <AccessibleButton
              label={t('admin.promotions.form.endDate')}
              onPress={() => setShowEndDatePicker(true)}
              variant="outline"
              style={styles.dateButton}
              {...accessibility.getAccessibilityProps({
                label: t('admin.promotions.form.endDate'),
                hint: 'Select end date',
                role: 'button'
              })}
            >
              {formData.endDate.toLocaleDateString()}
            </AccessibleButton>

            {showEndDatePicker && (
              <DateTimePicker
                value={formData.endDate}
                mode="date"
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                onChange={(event, selectedDate) => {
                  setShowEndDatePicker(false);
                  if (selectedDate) {
                    setFormData({ ...formData, endDate: selectedDate });
                  }
                }}
              />
            )}
          </View>

          <View style={styles.discountContainer}>
            <AccessibleButton
              label={t('admin.promotions.form.discountType')}
              onPress={() => setFormData({ 
                ...formData, 
                discountType: formData.discountType === 'percentage' ? 'value' : 'percentage' 
              })}
              variant={formData.discountType === 'percentage' ? 'primary' : 'outline'}
              style={styles.discountTypeButton}
              {...accessibility.getAccessibilityProps({
                label: t('admin.promotions.form.discountType'),
                hint: 'Toggle between percentage and fixed value',
                role: 'button',
                state: { selected: formData.discountType === 'percentage' }
              })}
            >
              {formData.discountType === 'percentage' ? '%' : '$'}
            </AccessibleButton>

            <AccessibleInput
              label={t('admin.promotions.form.discountValue')}
              value={formData.discountValue}
              onChangeText={(text) => setFormData({ ...formData, discountValue: text })}
              placeholder={formData.discountType === 'percentage' ? 'Enter percentage' : 'Enter value'}
              keyboardType="numeric"
              error={error && !formData.discountValue.trim() ? 'Required field' : undefined}
              {...accessibility.getAccessibilityProps({
                label: t('admin.promotions.form.discountValue'),
                hint: formData.discountType === 'percentage' ? 'Enter discount percentage' : 'Enter discount value',
                role: 'textbox',
                state: { required: true }
              })}
            />
          </View>

          <AccessibleInput
            label={t('admin.promotions.form.maxUses')}
            value={formData.maxUses}
            onChangeText={(text) => setFormData({ ...formData, maxUses: text })}
            placeholder="Enter maximum uses (optional)"
            keyboardType="numeric"
            {...accessibility.getAccessibilityProps({
              label: t('admin.promotions.form.maxUses'),
              hint: 'Enter the maximum number of times this promotion can be used',
              role: 'textbox'
            })}
          />

          <View style={styles.buttonContainer}>
            <AccessibleButton
              label={t('admin.promotions.form.cancel')}
              onPress={handleCancel}
              variant="outline"
              disabled={isSubmitting}
              {...accessibility.getAccessibilityProps({
                label: t('admin.promotions.form.cancel'),
                hint: 'Cancel creating promotion',
                role: 'button',
                state: { disabled: isSubmitting }
              })}
            />
            <AccessibleButton
              label={t('admin.promotions.form.submit')}
              onPress={handleSubmit}
              variant="primary"
              disabled={isSubmitting}
              {...accessibility.getAccessibilityProps({
                label: t('admin.promotions.form.submit'),
                hint: 'Create new promotion',
                role: 'button',
                state: { disabled: isSubmitting }
              })}
            />
          </View>
        </ScrollView>
      </AccessibleContainer>
    </FormErrorBoundary>
  );
}

const styles = StyleSheet.create({
  backButton: {
    marginRight: theme.spacing.md,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: theme.spacing.lg,
  },
  container: {
    backgroundColor: theme.colors.background.primary,
    flex: 1,
  },
  content: {
    padding: theme.spacing.lg,
  },
  dateButton: {
    width: '100%',
  },
  dateContainer: {
    marginBottom: theme.spacing.md,
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
    backgroundColor: theme.colors.status.error + '20',
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing.lg,
    padding: theme.spacing.md,
  },
  errorText: {
    color: theme.colors.status.error,
    fontFamily: theme.typography.families.medium,
    fontSize: theme.typography.sizes.sm,
  },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    marginBottom: theme.spacing.lg,
  },
  scrollView: {
    flex: 1,
  },
  title: {
    color: theme.colors.text.primary,
    fontFamily: theme.typography.families.bold,
    fontSize: theme.typography.sizes.xl,
  },
}); 