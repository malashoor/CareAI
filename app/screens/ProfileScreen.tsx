import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ViewStyle, TextStyle, ScrollView } from 'react-native';
import { theme } from '@/theme';
import { useAuth } from '@/hooks/useAuth';
import NationalIdInput from '@/components/NationalIdInput';
import { updateNationalId, validateNationalId } from '@/services/nationalId';

export default function ProfileScreen() {
  const { user } = useAuth();
  const [nationalId, setNationalId] = useState('');
  const [country, setCountry] = useState('SA'); // Default to Saudi Arabia
  const [error, setError] = useState<string | undefined>();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // TODO: Load user's national ID if it exists
  }, []);

  const handleNationalIdChange = async (value: string) => {
    setNationalId(value);
    setError(undefined);

    if (value) {
      const isValid = await validateNationalId(value, country);
      if (!isValid) {
        setError('Please enter a valid National ID');
      }
    }
  };

  const handleSave = async () => {
    if (!user || !nationalId) return;

    try {
      setLoading(true);
      const isValid = await validateNationalId(nationalId, country);
      if (!isValid) {
        setError('Please enter a valid National ID');
        return;
      }

      const success = await updateNationalId(user.id, nationalId, country);
      if (!success) {
        setError('Failed to update National ID');
      }
    } catch (error) {
      console.error('Error saving national ID:', error);
      setError('An error occurred while saving');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle as TextStyle}>Personal Information</Text>
        
        {/* Existing profile fields */}
        
        <NationalIdInput
          value={nationalId}
          onChange={handleNationalIdChange}
          country={country}
          error={error}
          style={styles.input}
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background.primary,
  } as ViewStyle,
  section: {
    padding: 16,
  } as ViewStyle,
  sectionTitle: {
    fontSize: 20,
    fontFamily: theme.typography.families.bold,
    color: theme.colors.text.primary,
    marginBottom: 16,
  } as TextStyle,
  input: {
    marginBottom: 16,
  } as ViewStyle,
}); 