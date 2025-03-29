import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '@/lib/supabase';
import { PrivacyManager, ConsentPreferences, DataExportRequest, AccountDeletionRequest } from '@/lib/privacy';
import { ActivityTypes } from '@/lib/privacy';

export default function PrivacySettingsScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [preferences, setPreferences] = useState<ConsentPreferences | null>(null);
  const [exportRequest, setExportRequest] = useState<DataExportRequest | null>(null);
  const [deletionRequest, setDeletionRequest] = useState<AccountDeletionRequest | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [prefs, exportReq, deletionReq] = await Promise.all([
        PrivacyManager.getConsentPreferences(),
        getExportRequest(),
        getDeletionRequest(),
      ]);

      setPreferences(prefs);
      setExportRequest(exportReq);
      setDeletionRequest(deletionReq);
    } catch (error) {
      console.error('Error loading privacy data:', error);
      Alert.alert('Error', 'Failed to load privacy settings');
    } finally {
      setLoading(false);
    }
  };

  const getExportRequest = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data, error } = await supabase
      .from('data_export_requests')
      .select('*')
      .eq('user_id', user.id)
      .order('requested_at', { ascending: false })
      .limit(1)
      .single();

    if (error) return null;
    return data;
  };

  const getDeletionRequest = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data, error } = await supabase
      .from('account_deletion_requests')
      .select('*')
      .eq('user_id', user.id)
      .order('requested_at', { ascending: false })
      .limit(1)
      .single();

    if (error) return null;
    return data;
  };

  const handleConsentChange = async (key: keyof ConsentPreferences, value: boolean) => {
    if (!preferences) return;

    setSaving(true);
    try {
      await PrivacyManager.updateConsentPreferences({ [key]: value });
      setPreferences({ ...preferences, [key]: value });
      await PrivacyManager.logUserActivity(
        ActivityTypes.CONSENT_CHANGE,
        '/settings/privacy',
        { field: key, value }
      );
    } catch (error) {
      console.error('Error updating consent:', error);
      Alert.alert('Error', 'Failed to update privacy settings');
    } finally {
      setSaving(false);
    }
  };

  const handleExportRequest = async () => {
    try {
      const request = await PrivacyManager.requestDataExport();
      setExportRequest(request);
      await PrivacyManager.logUserActivity(
        ActivityTypes.EXPORT_REQUEST,
        '/settings/privacy',
        { request_id: request.id }
      );
      Alert.alert(
        'Export Requested',
        'Your data export will be ready within 24 hours. You will be notified when it\'s available.'
      );
    } catch (error) {
      console.error('Error requesting export:', error);
      Alert.alert('Error', 'Failed to request data export');
    }
  };

  const handleDownloadExport = async () => {
    if (!exportRequest?.file_path) return;

    try {
      await PrivacyManager.downloadExportedData(exportRequest.file_path);
      await PrivacyManager.logUserActivity(
        ActivityTypes.EXPORT_DOWNLOAD,
        '/settings/privacy',
        { request_id: exportRequest.id }
      );
    } catch (error) {
      console.error('Error downloading export:', error);
      Alert.alert('Error', 'Failed to download exported data');
    }
  };

  const handleDeleteAccount = async () => {
    Alert.alert(
      'Delete Account',
      'Are you sure you want to delete your account? This action cannot be undone after 30 days.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const request = await PrivacyManager.requestAccountDeletion();
              setDeletionRequest(request);
              await PrivacyManager.logUserActivity(
                ActivityTypes.ACCOUNT_DELETION_REQUEST,
                '/settings/privacy',
                { request_id: request.id }
              );
              Alert.alert(
                'Account Deletion Scheduled',
                'Your account will be deleted in 30 days. You can cancel this request at any time during this period.'
              );
            } catch (error) {
              console.error('Error requesting deletion:', error);
              Alert.alert('Error', 'Failed to request account deletion');
            }
          },
        },
      ]
    );
  };

  const handleCancelDeletion = async () => {
    try {
      await PrivacyManager.cancelAccountDeletion();
      setDeletionRequest(null);
      await PrivacyManager.logUserActivity(
        ActivityTypes.ACCOUNT_DELETION_CANCEL,
        '/settings/privacy',
        { request_id: deletionRequest?.id }
      );
      Alert.alert('Success', 'Account deletion request cancelled');
    } catch (error) {
      console.error('Error cancelling deletion:', error);
      Alert.alert('Error', 'Failed to cancel account deletion');
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Privacy Settings</Text>
        <Text style={styles.sectionDescription}>
          Manage your privacy preferences and data sharing settings
        </Text>

        <View style={styles.toggleContainer}>
          <View style={styles.toggleInfo}>
            <Text style={styles.toggleTitle}>Health Data Tracking</Text>
            <Text style={styles.toggleDescription}>
              Allow tracking of health metrics and activities
            </Text>
          </View>
          <Switch
            value={preferences?.health_data_tracking}
            onValueChange={(value) => handleConsentChange('health_data_tracking', value)}
          />
        </View>

        <View style={styles.toggleContainer}>
          <View style={styles.toggleInfo}>
            <Text style={styles.toggleTitle}>Location Tracking</Text>
            <Text style={styles.toggleDescription}>
              Enable location tracking for safety features
            </Text>
          </View>
          <Switch
            value={preferences?.location_tracking}
            onValueChange={(value) => handleConsentChange('location_tracking', value)}
          />
        </View>

        <View style={styles.toggleContainer}>
          <View style={styles.toggleInfo}>
            <Text style={styles.toggleTitle}>Voice Recording</Text>
            <Text style={styles.toggleDescription}>
              Allow voice commands and audio feedback
            </Text>
          </View>
          <Switch
            value={preferences?.voice_recording}
            onValueChange={(value) => handleConsentChange('voice_recording', value)}
          />
        </View>

        <View style={styles.toggleContainer}>
          <View style={styles.toggleInfo}>
            <Text style={styles.toggleTitle}>Share with Family</Text>
            <Text style={styles.toggleDescription}>
              Share your health data with approved family members
            </Text>
          </View>
          <Switch
            value={preferences?.sharing_with_family}
            onValueChange={(value) => handleConsentChange('sharing_with_family', value)}
          />
        </View>

        <View style={styles.toggleContainer}>
          <View style={styles.toggleInfo}>
            <Text style={styles.toggleTitle}>Share with Healthcare Providers</Text>
            <Text style={styles.toggleDescription}>
              Share your health data with approved medical professionals
            </Text>
          </View>
          <Switch
            value={preferences?.sharing_with_professionals}
            onValueChange={(value) => handleConsentChange('sharing_with_professionals', value)}
          />
        </View>

        <View style={styles.toggleContainer}>
          <View style={styles.toggleInfo}>
            <Text style={styles.toggleTitle}>Date of Birth Usage</Text>
            <Text style={styles.toggleDescription}>
              Allow using your birthdate to personalize your experience and health insights
            </Text>
          </View>
          <Switch
            value={preferences?.date_of_birth_use}
            onValueChange={(value) => handleConsentChange('date_of_birth_use', value)}
          />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Data Export</Text>
        <Text style={styles.sectionDescription}>
          Request a copy of all your personal data
        </Text>

        {exportRequest ? (
          <View style={styles.exportStatus}>
            <Text style={styles.exportStatusText}>
              Status: {exportRequest.status}
            </Text>
            {exportRequest.status === 'completed' && exportRequest.file_path && (
              <TouchableOpacity
                style={styles.button}
                onPress={handleDownloadExport}>
                <Text style={styles.buttonText}>Download Export</Text>
              </TouchableOpacity>
            )}
          </View>
        ) : (
          <TouchableOpacity
            style={styles.button}
            onPress={handleExportRequest}>
            <Text style={styles.buttonText}>Request Data Export</Text>
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Account Deletion</Text>
        <Text style={styles.sectionDescription}>
          Permanently delete your account and all associated data
        </Text>

        {deletionRequest ? (
          <View style={styles.deletionStatus}>
            <Text style={styles.deletionStatusText}>
              Account scheduled for deletion on{' '}
              {new Date(deletionRequest.scheduled_deletion_date).toLocaleDateString()}
            </Text>
            <TouchableOpacity
              style={[styles.button, styles.cancelButton]}
              onPress={handleCancelDeletion}>
              <Text style={styles.buttonText}>Cancel Deletion</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity
            style={[styles.button, styles.deleteButton]}
            onPress={handleDeleteAccount}>
            <Text style={styles.buttonText}>Delete Account</Text>
          </TouchableOpacity>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  section: {
    padding: 16,
    backgroundColor: '#FFFFFF',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 8,
  },
  sectionDescription: {
    fontSize: 16,
    color: '#8E8E93',
    marginBottom: 16,
  },
  toggleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  toggleInfo: {
    flex: 1,
    marginRight: 16,
  },
  toggleTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#000000',
    marginBottom: 4,
  },
  toggleDescription: {
    fontSize: 14,
    color: '#8E8E93',
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  cancelButton: {
    backgroundColor: '#FF9500',
  },
  deleteButton: {
    backgroundColor: '#FF3B30',
  },
  exportStatus: {
    backgroundColor: '#F2F2F7',
    padding: 16,
    borderRadius: 8,
  },
  exportStatusText: {
    fontSize: 16,
    color: '#000000',
    marginBottom: 16,
  },
  deletionStatus: {
    backgroundColor: '#F2F2F7',
    padding: 16,
    borderRadius: 8,
  },
  deletionStatusText: {
    fontSize: 16,
    color: '#000000',
    marginBottom: 16,
  },
}); 