import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ViewStyle, TextStyle, ScrollView, TextInput, TouchableOpacity } from 'react-native';
import { theme } from '@/theme';
import { useAuth } from '@/hooks/useAuth';
import { createInsuranceClaim, getInsuranceProviders, InsuranceClaim, InsuranceProvider, InsuranceClaimType } from '@/services/pharmacyInsurance';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Picker, PickerProps } from '@react-native-picker/picker';

interface NewInsuranceClaimScreenProps {
  navigation: any;
}

export default function NewInsuranceClaimScreen({ navigation }: NewInsuranceClaimScreenProps) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | undefined>();
  const [showSubmissionDate, setShowSubmissionDate] = useState(false);
  const [providers, setProviders] = useState<InsuranceProvider[]>([]);

  const [formData, setFormData] = useState({
    provider_id: '',
    claim_number: '',
    claim_type: 'medical' as InsuranceClaim['claim_type'],
    amount: '',
    submission_date: new Date(),
    notes: '',
  });

  useEffect(() => {
    loadProviders();
  }, []);

  const loadProviders = async () => {
    try {
      const data = await getInsuranceProviders('SA'); // Default to Saudi Arabia
      setProviders(data);
      if (data.length > 0) {
        setFormData(prev => ({ ...prev, provider_id: data[0].id }));
      }
    } catch (error) {
      console.error('Error loading providers:', error);
    }
  };

  const handleSubmit = async () => {
    if (!user) return;
    if (!formData.claim_number || !formData.provider_id) {
      setError('Claim number and provider are required');
      return;
    }

    try {
      setLoading(true);
      setError(undefined);

      const claim: Omit<InsuranceClaim, 'id' | 'user_id' | 'created_at' | 'updated_at'> = {
        provider_id: formData.provider_id,
        claim_number: formData.claim_number,
        claim_type: formData.claim_type,
        amount: formData.amount ? parseFloat(formData.amount) : undefined,
        submission_date: formData.submission_date,
        status: 'pending',
        notes: formData.notes || undefined,
      };

      const result = await createInsuranceClaim(user.id, claim);
      if (result) {
        navigation.goBack();
      } else {
        setError('Failed to create claim');
      }
    } catch (error) {
      console.error('Error creating claim:', error);
      setError('An error occurred while creating the claim');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
          accessibilityLabel="Go back"
        >
          <Ionicons name="arrow-back" size={24} color={theme.colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.title as TextStyle}>New Insurance Claim</Text>
      </View>

      <View style={styles.form}>
        <View style={styles.inputGroup}>
          <Text style={styles.label as TextStyle}>Insurance Provider *</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={formData.provider_id}
              onValueChange={(value: string) => setFormData({ ...formData, provider_id: value })}
              style={styles.picker as PickerProps['style']}
            >
              {providers.map((provider) => (
                <Picker.Item
                  key={provider.id}
                  label={provider.name}
                  value={provider.id}
                />
              ))}
            </Picker>
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label as TextStyle}>Claim Type *</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={formData.claim_type}
              onValueChange={(value: InsuranceClaimType) => setFormData({ ...formData, claim_type: value })}
              style={styles.picker as PickerProps['style']}
            >
              <Picker.Item label="Medical" value="medical" />
              <Picker.Item label="Pharmacy" value="pharmacy" />
              <Picker.Item label="Dental" value="dental" />
              <Picker.Item label="Vision" value="vision" />
            </Picker>
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label as TextStyle}>Claim Number *</Text>
          <TextInput
            style={styles.input as TextStyle}
            value={formData.claim_number}
            onChangeText={(text) => setFormData({ ...formData, claim_number: text })}
            placeholder="Enter claim number"
            accessibilityLabel="Claim number input"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label as TextStyle}>Amount</Text>
          <TextInput
            style={styles.input as TextStyle}
            value={formData.amount}
            onChangeText={(text) => setFormData({ ...formData, amount: text })}
            placeholder="Enter amount"
            keyboardType="decimal-pad"
            accessibilityLabel="Amount input"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label as TextStyle}>Submission Date</Text>
          <TouchableOpacity
            style={styles.dateButton}
            onPress={() => setShowSubmissionDate(true)}
            accessibilityLabel="Select submission date"
          >
            <Text style={styles.dateButtonText as TextStyle}>
              {formData.submission_date.toLocaleDateString()}
            </Text>
            <Ionicons name="calendar" size={20} color={theme.colors.primary.default} />
          </TouchableOpacity>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label as TextStyle}>Notes</Text>
          <TextInput
            style={[styles.input as TextStyle, styles.textArea as TextStyle]}
            value={formData.notes}
            onChangeText={(text) => setFormData({ ...formData, notes: text })}
            placeholder="Enter any additional notes"
            multiline
            numberOfLines={4}
            textAlignVertical="top"
            accessibilityLabel="Notes input"
          />
        </View>

        {error && (
          <Text style={styles.errorText as TextStyle}>{error}</Text>
        )}

        <TouchableOpacity
          style={[styles.submitButton, loading && styles.submitButtonDisabled]}
          onPress={handleSubmit}
          disabled={loading}
          accessibilityLabel="Submit claim"
        >
          <Text style={styles.submitButtonText as TextStyle}>
            {loading ? 'Submitting...' : 'Submit Claim'}
          </Text>
        </TouchableOpacity>
      </View>

      {showSubmissionDate && (
        <DateTimePicker
          value={formData.submission_date}
          mode="date"
          onChange={(event, date) => {
            setShowSubmissionDate(false);
            if (date) {
              setFormData({ ...formData, submission_date: date });
            }
          }}
        />
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background.primary,
  } as ViewStyle,
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.text.secondary,
  } as ViewStyle,
  backButton: {
    marginRight: 16,
  } as ViewStyle,
  title: {
    fontSize: 20,
    fontFamily: theme.typography.families.bold,
    color: theme.colors.text.primary,
  } as TextStyle,
  form: {
    padding: 16,
  } as ViewStyle,
  inputGroup: {
    marginBottom: 16,
  } as ViewStyle,
  label: {
    fontSize: 16,
    fontFamily: theme.typography.families.medium,
    color: theme.colors.text.primary,
    marginBottom: 8,
  } as TextStyle,
  pickerContainer: {
    borderWidth: 1,
    borderColor: theme.colors.status.info,
    borderRadius: 8,
    backgroundColor: theme.colors.background.primary,
  } as ViewStyle,
  picker: {
    height: 48,
    color: theme.colors.text.primary,
  },
  input: {
    height: 48,
    borderWidth: 1,
    borderColor: theme.colors.status.info,
    borderRadius: 8,
    paddingHorizontal: 16,
    fontSize: 16,
    fontFamily: theme.typography.families.regular,
    color: theme.colors.text.primary,
    backgroundColor: theme.colors.background.primary,
  } as TextStyle,
  textArea: {
    height: 120,
    paddingTop: 12,
    paddingBottom: 12,
  } as TextStyle,
  dateButton: {
    height: 48,
    borderWidth: 1,
    borderColor: theme.colors.status.info,
    borderRadius: 8,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  } as ViewStyle,
  dateButtonText: {
    fontSize: 16,
    fontFamily: theme.typography.families.regular,
    color: theme.colors.text.primary,
  } as TextStyle,
  errorText: {
    fontSize: 14,
    fontFamily: theme.typography.families.regular,
    color: theme.colors.status.error,
    marginBottom: 16,
  } as TextStyle,
  submitButton: {
    backgroundColor: theme.colors.primary.default,
    height: 48,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  } as ViewStyle,
  submitButtonDisabled: {
    opacity: 0.5,
  } as ViewStyle,
  submitButtonText: {
    fontSize: 16,
    fontFamily: theme.typography.families.medium,
    color: theme.colors.background.primary,
  } as TextStyle,
}); 