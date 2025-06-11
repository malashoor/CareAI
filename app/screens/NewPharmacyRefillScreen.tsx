import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, TextStyle, TouchableOpacity, View, ViewStyle } from 'react-native';
import { useAuth } from '../hooks/useAuth';
import { createPharmacyRefill } from '../services/pharmacyInsurance';
import { theme } from '../theme';

interface NewPharmacyRefillScreenProps {
  navigation: any;
}

export default function NewPharmacyRefillScreen({ navigation }: NewPharmacyRefillScreenProps) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | undefined>();
  const [showStartDate, setShowStartDate] = useState(false);
  const [showEndDate, setShowEndDate] = useState(false);

  const [formData, setFormData] = useState({
    medication_name: '',
    dosage: '',
    frequency: '',
    start_date: new Date(),
    end_date: new Date(),
    notes: '',
  });

  const handleSubmit = async () => {
    if (!user) return;
    if (!formData.medication_name || !formData.dosage || !formData.frequency) {
      setError('Medication name, dosage, and frequency are required');
      return;
    }

    try {
      setLoading(true);
      setError(undefined);

      const refill = {
        medication_name: formData.medication_name,
        dosage: formData.dosage,
        frequency: formData.frequency,
        start_date: formData.start_date,
        end_date: formData.end_date,
        notes: formData.notes || undefined,
      };

      const result = await createPharmacyRefill(user.id, refill);
      if (result) {
        navigation.goBack();
      } else {
        setError('Failed to create refill');
      }
    } catch (error) {
      console.error('Error creating refill:', error);
      setError('An error occurred while creating the refill');
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
        <Text style={styles.title as TextStyle}>New Pharmacy Refill</Text>
      </View>

      <View style={styles.form}>
        <View style={styles.inputGroup}>
          <Text style={styles.label as TextStyle}>Medication Name *</Text>
          <TextInput
            style={styles.input as TextStyle}
            value={formData.medication_name}
            onChangeText={(text) => setFormData({ ...formData, medication_name: text })}
            placeholder="Enter medication name"
            accessibilityLabel="Medication name input"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label as TextStyle}>Dosage *</Text>
          <TextInput
            style={styles.input as TextStyle}
            value={formData.dosage}
            onChangeText={(text) => setFormData({ ...formData, dosage: text })}
            placeholder="Enter dosage (e.g., 50mg)"
            accessibilityLabel="Dosage input"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label as TextStyle}>Frequency *</Text>
          <TextInput
            style={styles.input as TextStyle}
            value={formData.frequency}
            onChangeText={(text) => setFormData({ ...formData, frequency: text })}
            placeholder="Enter frequency (e.g., twice daily)"
            accessibilityLabel="Frequency input"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label as TextStyle}>Start Date</Text>
          <TouchableOpacity
            style={styles.dateButton}
            onPress={() => setShowStartDate(true)}
            accessibilityLabel="Select start date"
          >
            <Text style={styles.dateButtonText as TextStyle}>
              {formData.start_date.toLocaleDateString()}
            </Text>
            <Ionicons name="calendar" size={20} color={theme.colors.primary.default} />
          </TouchableOpacity>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label as TextStyle}>End Date</Text>
          <TouchableOpacity
            style={styles.dateButton}
            onPress={() => setShowEndDate(true)}
            accessibilityLabel="Select end date"
          >
            <Text style={styles.dateButtonText as TextStyle}>
              {formData.end_date.toLocaleDateString()}
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
          accessibilityLabel="Submit refill"
        >
          <Text style={styles.submitButtonText as TextStyle}>
            {loading ? 'Submitting...' : 'Submit Refill'}
          </Text>
        </TouchableOpacity>
      </View>

      {showStartDate && (
        <DateTimePicker
          value={formData.start_date}
          mode="date"
          onChange={(event, date) => {
            setShowStartDate(false);
            if (date) {
              setFormData({ ...formData, start_date: date });
            }
          }}
        />
      )}

      {showEndDate && (
        <DateTimePicker
          value={formData.end_date}
          mode="date"
          onChange={(event, date) => {
            setShowEndDate(false);
            if (date) {
              setFormData({ ...formData, end_date: date });
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