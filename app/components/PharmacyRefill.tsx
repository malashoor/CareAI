import React, { useState } from 'react';
import { View, Text, StyleSheet, ViewStyle, TextStyle, TouchableOpacity } from 'react-native';
import { theme } from '@/theme';
import { Ionicons } from '@expo/vector-icons';

interface PharmacyRefillProps {
  medicationName: string;
  dosage?: string;
  frequency?: string;
  startDate?: Date;
  endDate?: Date;
  status: 'pending' | 'approved' | 'rejected' | 'completed';
  onPress?: () => void;
  style?: ViewStyle;
}

export default function PharmacyRefill({
  medicationName,
  dosage,
  frequency,
  startDate,
  endDate,
  status,
  onPress,
  style,
}: PharmacyRefillProps) {
  const getStatusColor = () => {
    switch (status) {
      case 'approved':
        return theme.colors.status.success;
      case 'rejected':
        return theme.colors.status.error;
      case 'completed':
        return theme.colors.status.info;
      default:
        return theme.colors.status.warning;
    }
  };

  const getStatusIcon = () => {
    switch (status) {
      case 'approved':
        return 'checkmark-circle';
      case 'rejected':
        return 'close-circle';
      case 'completed':
        return 'checkmark-done-circle';
      default:
        return 'time';
    }
  };

  return (
    <TouchableOpacity
      style={[styles.container, style]}
      onPress={onPress}
      accessibilityLabel={`Pharmacy refill for ${medicationName}`}
      accessibilityHint={`Status: ${status}`}
    >
      <View style={styles.header}>
        <Text style={styles.medicationName as TextStyle}>{medicationName}</Text>
        <Ionicons name={getStatusIcon()} size={24} color={getStatusColor()} />
      </View>
      
      {(dosage || frequency) && (
        <Text style={styles.details as TextStyle}>
          {dosage && frequency ? `${dosage} - ${frequency}` : dosage || frequency}
        </Text>
      )}

      {(startDate || endDate) && (
        <Text style={styles.date as TextStyle}>
          {startDate && endDate
            ? `${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()}`
            : startDate
            ? `From ${startDate.toLocaleDateString()}`
            : `Until ${endDate?.toLocaleDateString()}`}
        </Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.background.primary,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: theme.colors.text.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  } as ViewStyle,
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  } as ViewStyle,
  medicationName: {
    fontSize: 18,
    fontFamily: theme.typography.families.medium,
    color: theme.colors.text.primary,
    flex: 1,
    marginRight: 8,
  } as TextStyle,
  details: {
    fontSize: 16,
    fontFamily: theme.typography.families.regular,
    color: theme.colors.text.secondary,
    marginBottom: 4,
  } as TextStyle,
  date: {
    fontSize: 14,
    fontFamily: theme.typography.families.regular,
    color: theme.colors.text.secondary,
  } as TextStyle,
}); 