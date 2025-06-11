import React from 'react';
import { ScrollView, StyleSheet, Switch, Text, TextStyle, View, ViewStyle } from 'react-native';
import { useAuth } from '../hooks/useAuth';
import { theme } from '../theme';

interface NotificationPreference {
  id: string;
  label: string;
  description: string;
  enabled: boolean;
  roles: string[];
}

const DEFAULT_PREFERENCES: NotificationPreference[] = [
  {
    id: 'refill_status',
    label: 'Refill Status Updates',
    description: 'Get notified when your refill request status changes',
    enabled: true,
    roles: ['patient', 'pharmacist'],
  },
  {
    id: 'refill_reminder',
    label: 'Refill Reminders',
    description: 'Receive reminders when your medication needs to be refilled',
    enabled: true,
    roles: ['patient'],
  },
  {
    id: 'claim_status',
    label: 'Claim Status Updates',
    description: 'Get notified when your insurance claim status changes',
    enabled: true,
    roles: ['patient', 'insurance_agent'],
  },
  {
    id: 'claim_approval',
    label: 'Claim Approval Requests',
    description: 'Receive notifications for pending claim approvals',
    enabled: true,
    roles: ['insurance_agent'],
  },
  {
    id: 'payment_reminder',
    label: 'Payment Reminders',
    description: 'Get notified about upcoming payments or payment issues',
    enabled: true,
    roles: ['patient'],
  },
  {
    id: 'prescription_expiry',
    label: 'Prescription Expiry Alerts',
    description: 'Receive alerts when your prescription is about to expire',
    enabled: true,
    roles: ['patient', 'pharmacist'],
  },
  {
    id: 'insurance_renewal',
    label: 'Insurance Renewal Reminders',
    description: 'Get notified about upcoming insurance policy renewals',
    enabled: true,
    roles: ['patient', 'insurance_agent'],
  },
  {
    id: 'medication_interaction',
    label: 'Medication Interaction Alerts',
    description: 'Receive alerts about potential medication interactions',
    enabled: true,
    roles: ['patient', 'pharmacist'],
  },
];

export default function NotificationPreferencesScreen() {
  const { user } = useAuth();
  const [preferences, setPreferences] = React.useState<NotificationPreference[]>(DEFAULT_PREFERENCES);

  const togglePreference = (id: string) => {
    setPreferences(prev =>
      prev.map(pref =>
        pref.id === id ? { ...pref, enabled: !pref.enabled } : pref
      )
    );
  };

  const filteredPreferences = preferences.filter(pref =>
    pref.roles.includes(user?.role || 'patient')
  );

  const renderPreference = (preference: NotificationPreference) => (
    <View key={preference.id} style={styles.preferenceItem}>
      <View style={styles.preferenceContent}>
        <Text style={styles.preferenceLabel as TextStyle}>{preference.label}</Text>
        <Text style={styles.preferenceDescription as TextStyle}>
          {preference.description}
        </Text>
      </View>
      <Switch
        value={preference.enabled}
        onValueChange={() => togglePreference(preference.id)}
        trackColor={{ false: theme.colors.text.secondary, true: theme.colors.primary.default }}
        thumbColor={theme.colors.background.primary}
      />
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title as TextStyle}>Notification Preferences</Text>
        <Text style={styles.subtitle as TextStyle}>
          Manage your notification settings
        </Text>
      </View>

      <ScrollView style={styles.content}>
        {filteredPreferences.map(renderPreference)}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background.primary,
  } as ViewStyle,
  header: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.text.secondary,
  } as ViewStyle,
  title: {
    fontSize: 24,
    fontFamily: theme.typography.families.bold,
    color: theme.colors.text.primary,
    marginBottom: 8,
  } as TextStyle,
  subtitle: {
    fontSize: 16,
    fontFamily: theme.typography.families.regular,
    color: theme.colors.text.secondary,
  } as TextStyle,
  content: {
    flex: 1,
    padding: 16,
  } as ViewStyle,
  preferenceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: theme.colors.background.secondary,
    borderRadius: 8,
    marginBottom: 12,
  } as ViewStyle,
  preferenceContent: {
    flex: 1,
    marginRight: 16,
  } as ViewStyle,
  preferenceLabel: {
    fontSize: 16,
    fontFamily: theme.typography.families.medium,
    color: theme.colors.text.primary,
    marginBottom: 4,
  } as TextStyle,
  preferenceDescription: {
    fontSize: 14,
    fontFamily: theme.typography.families.regular,
    color: theme.colors.text.secondary,
  } as TextStyle,
}); 