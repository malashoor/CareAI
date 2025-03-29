import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ViewStyle, TextStyle, ScrollView, TouchableOpacity, TextInput, Alert, StyleProp } from 'react-native';
import { theme } from '@/theme';
import { useAuth } from '@/hooks/useAuth';
import { getInsuranceClaim, updateInsuranceClaim, InsuranceClaim, InsuranceClaimType, InsuranceClaimStatus } from '../services/pharmacyInsurance';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/theme';
import { Button } from '@/components/Button';

interface EditInsuranceClaimScreenProps {
  navigation: any;
  route: {
    params: {
      claimId: string;
      claim: InsuranceClaim;
    };
  };
}

export default function EditInsuranceClaimScreen({ navigation, route }: EditInsuranceClaimScreenProps) {
  const { claim: initialClaim } = route.params;
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | undefined>();
  const [claim, setClaim] = useState<InsuranceClaim>(initialClaim);
  const [formData, setFormData] = useState<Partial<InsuranceClaim>>({
    claimNumber: claim.claimNumber || '',
    serviceDate: claim.serviceDate || '',
    amount: claim.amount || 0,
    description: claim.description || '',
    notes: claim.notes || '',
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const theme = useTheme();

  useEffect(() => {
    loadClaim();
  }, []);

  const loadClaim = async () => {
    if (!user) return;
    try {
      setLoading(true);
      setError(undefined);
      const data = await getInsuranceClaim(route.params.claimId);
      if (data) {
        setClaim(data);
        setFormData({
          claimNumber: data.claimNumber,
          serviceDate: data.serviceDate,
          amount: data.amount,
          description: data.description,
          notes: data.notes,
        });
      }
    } catch (error) {
      console.error('Error loading claim:', error);
      setError('Failed to load claim details');
    } finally {
      setLoading(false);
    }
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};
    
    if (!formData.claimNumber.trim()) {
      errors.claimNumber = 'Claim number is required';
    }
    
    if (!formData.serviceDate.trim()) {
      errors.serviceDate = 'Service date is required';
    }
    
    if (!formData.amount || isNaN(Number(formData.amount)) || Number(formData.amount) <= 0) {
      errors.amount = 'Amount must be a positive number';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async () => {
    if (!user || !claim || !validateForm()) return;

    try {
      setSaving(true);
      setError(undefined);

      await updateInsuranceClaim(claim.id, formData);
      navigation.goBack();
    } catch (error) {
      console.error('Error updating claim:', error);
      setError('Failed to update claim');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    Alert.alert(
      'Discard Changes',
      'Are you sure you want to discard your changes?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Discard',
          style: 'destructive',
          onPress: () => navigation.goBack(),
        },
      ]
    );
  };

  const inputStyle: StyleProp<TextStyle> = {
    height: 40,
    borderWidth: 1,
    borderColor: theme.colors.text.secondary,
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 16,
    fontFamily: theme.typography.families.regular,
    color: theme.colors.text.primary,
    backgroundColor: theme.colors.background.secondary,
  };

  const textAreaStyle: StyleProp<TextStyle> = {
    ...inputStyle as TextStyle,
    height: 100,
    textAlignVertical: 'top',
    paddingTop: 12,
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            onPress={handleCancel}
            style={styles.backButton}
            accessibilityLabel="Go back"
          >
            <Ionicons name="arrow-back" size={24} color={theme.colors.text.primary} />
          </TouchableOpacity>
          <Text style={styles.title as TextStyle}>Loading...</Text>
        </View>
      </View>
    );
  }

  if (error || !claim) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            onPress={handleCancel}
            style={styles.backButton}
            accessibilityLabel="Go back"
          >
            <Ionicons name="arrow-back" size={24} color={theme.colors.text.primary} />
          </TouchableOpacity>
          <Text style={styles.title as TextStyle}>Error</Text>
        </View>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText as TextStyle}>
            {error || 'Failed to load claim details'}
          </Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={loadClaim}
            accessibilityLabel="Retry loading claim details"
          >
            <Text style={styles.retryButtonText as TextStyle}>Retry</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.colors.background.primary }]}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={handleCancel}
          style={styles.backButton}
          accessibilityLabel="Go back"
        >
          <Ionicons name="arrow-back" size={24} color={theme.colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.title as TextStyle}>Edit Claim</Text>
        <Button onPress={handleSubmit} title="Save Changes" />
      </View>

      <View style={styles.form}>
        <TextInput
          style={[styles.input as TextStyle, { backgroundColor: theme.colors.background.secondary }]}
          value={formData.claimNumber}
          onChangeText={(text) => setFormData({ ...formData, claimNumber: text })}
          placeholder="Claim Number"
          placeholderTextColor={theme.colors.text.light}
        />
        <TextInput
          style={[styles.input as TextStyle, { backgroundColor: theme.colors.background.secondary }]}
          value={formData.serviceDate}
          onChangeText={(text) => setFormData({ ...formData, serviceDate: text })}
          placeholder="Service Date"
          placeholderTextColor={theme.colors.text.light}
        />
        <TextInput
          style={[styles.input as TextStyle, { backgroundColor: theme.colors.background.secondary }]}
          value={formData.amount?.toString()}
          onChangeText={(text) => setFormData({ ...formData, amount: parseFloat(text) })}
          placeholder="Amount"
          keyboardType="numeric"
          placeholderTextColor={theme.colors.text.light}
        />
        <TextInput
          style={[styles.input as TextStyle, { backgroundColor: theme.colors.background.secondary }]}
          value={formData.description}
          onChangeText={(text) => setFormData({ ...formData, description: text })}
          placeholder="Description"
          placeholderTextColor={theme.colors.text.light}
        />
        <TextInput
          style={[styles.input as TextStyle, { backgroundColor: theme.colors.background.secondary }]}
          value={formData.notes}
          onChangeText={(text) => setFormData({ ...formData, notes: text })}
          placeholder="Notes"
          multiline
          placeholderTextColor={theme.colors.text.light}
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
    flex: 1,
  } as TextStyle,
  form: {
    padding: 16,
  } as ViewStyle,
  input: {
    height: 48,
    borderRadius: 8,
    paddingHorizontal: 16,
    marginBottom: 16,
    fontSize: 16,
  } as ViewStyle,
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  } as ViewStyle,
  errorText: {
    fontSize: 14,
    fontFamily: theme.typography.families.regular,
    color: theme.colors.status.error,
    marginTop: 4,
  } as TextStyle,
  retryButton: {
    backgroundColor: theme.colors.primary.default,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  } as ViewStyle,
  retryButtonText: {
    fontSize: 16,
    fontFamily: theme.typography.families.medium,
    color: theme.colors.background.primary,
  } as TextStyle,
}); 