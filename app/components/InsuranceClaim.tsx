import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, TextStyle, TouchableOpacity, View, ViewStyle } from 'react-native';
import { theme } from '../theme';

interface InsuranceClaimProps {
  claimNumber: string;
  claimType: 'pharmacy' | 'medical' | 'dental' | 'vision';
  amount?: number;
  status: 'pending' | 'approved' | 'rejected' | 'paid';
  submissionDate?: Date;
  processedDate?: Date;
  onPress?: () => void;
  style?: ViewStyle;
}

export default function InsuranceClaim({
  claimNumber,
  claimType,
  amount,
  status,
  submissionDate,
  processedDate,
  onPress,
  style,
}: InsuranceClaimProps) {
  const getStatusColor = () => {
    switch (status) {
      case 'approved':
        return theme.colors.status.success;
      case 'rejected':
        return theme.colors.status.error;
      case 'paid':
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
      case 'paid':
        return 'checkmark-done-circle';
      default:
        return 'time';
    }
  };

  const getClaimTypeIcon = () => {
    switch (claimType) {
      case 'pharmacy':
        return 'medical';
      case 'medical':
        return 'fitness';
      case 'dental':
        return 'medical-outline';
      case 'vision':
        return 'eye';
    }
  };

  return (
    <TouchableOpacity
      style={[styles.container, style]}
      onPress={onPress}
      accessibilityLabel={`Insurance claim ${claimNumber}`}
      accessibilityHint={`Type: ${claimType}, Status: ${status}`}
    >
      <View style={styles.header}>
        <View style={styles.claimInfo}>
          <Ionicons name={getClaimTypeIcon()} size={24} color={theme.colors.primary.default} />
          <Text style={styles.claimNumber as TextStyle}>{claimNumber}</Text>
        </View>
        <Ionicons name={getStatusIcon()} size={24} color={getStatusColor()} />
      </View>

      <Text style={styles.claimType as TextStyle}>
        {claimType.charAt(0).toUpperCase() + claimType.slice(1)} Claim
      </Text>

      {amount && (
        <Text style={styles.amount as TextStyle}>
          {new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
          }).format(amount)}
        </Text>
      )}

      {(submissionDate || processedDate) && (
        <Text style={styles.date as TextStyle}>
          {submissionDate && processedDate
            ? `Submitted: ${submissionDate.toLocaleDateString()}, Processed: ${processedDate.toLocaleDateString()}`
            : submissionDate
            ? `Submitted: ${submissionDate.toLocaleDateString()}`
            : `Processed: ${processedDate?.toLocaleDateString()}`}
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
  claimInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 8,
  } as ViewStyle,
  claimNumber: {
    fontSize: 18,
    fontFamily: theme.typography.families.medium,
    color: theme.colors.text.primary,
    marginLeft: 8,
  } as TextStyle,
  claimType: {
    fontSize: 16,
    fontFamily: theme.typography.families.regular,
    color: theme.colors.text.secondary,
    marginBottom: 4,
  } as TextStyle,
  amount: {
    fontSize: 16,
    fontFamily: theme.typography.families.medium,
    color: theme.colors.primary.default,
    marginBottom: 4,
  } as TextStyle,
  date: {
    fontSize: 14,
    fontFamily: theme.typography.families.regular,
    color: theme.colors.text.secondary,
  } as TextStyle,
}); 