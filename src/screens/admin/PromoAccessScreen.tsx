import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import { promoAccessService } from '../../services/promoAccessService';
import { PromoAccess, PromoAccessReason } from '../../types/promoAccess';
import { useAuth } from '../../hooks/useAuth';
import { useSentryTracking } from '../../hooks/useSentryTracking';

export function PromoAccessScreen() {
  const { user } = useAuth();
  const { trackAction } = useSentryTracking('PromoAccessScreen');
  const [promoAccessList, setPromoAccessList] = useState<PromoAccess[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDatePicker, setShowDatePicker] = useState(false);

  // Form state
  const [userEmail, setUserEmail] = useState('');
  const [reason, setReason] = useState<PromoAccessReason>('family');
  const [expiryDate, setExpiryDate] = useState<Date | null>(null);
  const [notes, setNotes] = useState('');

  useEffect(() => {
    loadPromoAccess();
  }, []);

  const loadPromoAccess = async () => {
    try {
      const data = await promoAccessService.getAllPromoAccess();
      setPromoAccessList(data);
    } catch (error) {
      console.error('Error loading promo access:', error);
      Alert.alert('Error', 'Failed to load promo access list');
    } finally {
      setLoading(false);
    }
  };

  const handleGrantAccess = async () => {
    if (!userEmail) {
      Alert.alert('Error', 'Please enter a user email');
      return;
    }

    try {
      trackAction('grant_promo_access', { userEmail, reason });
      const result = await promoAccessService.grantPromoAccess(
        userEmail,
        reason,
        user?.id!,
        {
          expiresAt: expiryDate?.toISOString(),
          notes,
        }
      );

      if (result) {
        Alert.alert('Success', 'Promo access granted successfully');
        setUserEmail('');
        setReason('family');
        setExpiryDate(null);
        setNotes('');
        loadPromoAccess();
      } else {
        Alert.alert('Error', 'Failed to grant promo access');
      }
    } catch (error) {
      console.error('Error granting promo access:', error);
      Alert.alert('Error', 'Failed to grant promo access');
    }
  };

  const handleRevokeAccess = async (promoAccessId: string) => {
    try {
      trackAction('revoke_promo_access', { promoAccessId });
      const success = await promoAccessService.revokePromoAccess(
        promoAccessId,
        user?.id!
      );

      if (success) {
        Alert.alert('Success', 'Promo access revoked successfully');
        loadPromoAccess();
      } else {
        Alert.alert('Error', 'Failed to revoke promo access');
      }
    } catch (error) {
      console.error('Error revoking promo access:', error);
      Alert.alert('Error', 'Failed to revoke promo access');
    }
  };

  const handleExtendAccess = async (promoAccessId: string) => {
    if (!expiryDate) {
      Alert.alert('Error', 'Please select an expiry date');
      return;
    }

    try {
      trackAction('extend_promo_access', { promoAccessId, expiryDate });
      const success = await promoAccessService.extendPromoAccess(
        promoAccessId,
        expiryDate.toISOString(),
        user?.id!
      );

      if (success) {
        Alert.alert('Success', 'Promo access extended successfully');
        setExpiryDate(null);
        loadPromoAccess();
      } else {
        Alert.alert('Error', 'Failed to extend promo access');
      }
    } catch (error) {
      console.error('Error extending promo access:', error);
      Alert.alert('Error', 'Failed to extend promo access');
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Grant Promo Access</Text>
        <TextInput
          style={styles.input}
          placeholder="User Email"
          value={userEmail}
          onChangeText={setUserEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={reason}
            onValueChange={(value) => setReason(value as PromoAccessReason)}
            style={styles.picker}
          >
            <Picker.Item label="Family" value="family" />
            <Picker.Item label="Beta Tester" value="beta_tester" />
            <Picker.Item label="Influencer" value="influencer" />
            <Picker.Item label="Campaign" value="campaign" />
            <Picker.Item label="Close Friend" value="close_friend" />
          </Picker>
        </View>
        <TouchableOpacity
          style={styles.dateButton}
          onPress={() => setShowDatePicker(true)}
        >
          <Text style={styles.dateButtonText}>
            {expiryDate
              ? `Expires: ${expiryDate.toLocaleDateString()}`
              : 'Set Expiry Date (Optional)'}
          </Text>
        </TouchableOpacity>
        {showDatePicker && (
          <DateTimePicker
            value={expiryDate || new Date()}
            mode="date"
            display="default"
            onChange={(event, selectedDate) => {
              setShowDatePicker(false);
              if (selectedDate) {
                setExpiryDate(selectedDate);
              }
            }}
          />
        )}
        <TextInput
          style={[styles.input, styles.notesInput]}
          placeholder="Notes (Optional)"
          value={notes}
          onChangeText={setNotes}
          multiline
        />
        <TouchableOpacity style={styles.button} onPress={handleGrantAccess}>
          <Text style={styles.buttonText}>Grant Access</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Current Promo Access</Text>
        {loading ? (
          <Text>Loading...</Text>
        ) : (
          promoAccessList.map((access) => (
            <View key={access.id} style={styles.accessItem}>
              <Text style={styles.emailText}>{access.user_email}</Text>
              <Text style={styles.reasonText}>Reason: {access.reason}</Text>
              <Text style={styles.statusText}>Status: {access.status}</Text>
              {access.expires_at && (
                <Text style={styles.expiryText}>
                  Expires: {new Date(access.expires_at).toLocaleDateString()}
                </Text>
              )}
              {access.notes && (
                <Text style={styles.notesText}>Notes: {access.notes}</Text>
              )}
              <View style={styles.actionButtons}>
                {access.status === 'active' && (
                  <>
                    <TouchableOpacity
                      style={[styles.actionButton, styles.revokeButton]}
                      onPress={() => handleRevokeAccess(access.id)}
                    >
                      <Text style={styles.actionButtonText}>Revoke</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.actionButton, styles.extendButton]}
                      onPress={() => handleExtendAccess(access.id)}
                    >
                      <Text style={styles.actionButtonText}>Extend</Text>
                    </TouchableOpacity>
                  </>
                )}
              </View>
            </View>
          ))
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  section: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 10,
    marginBottom: 15,
    fontSize: 16,
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    marginBottom: 15,
  },
  picker: {
    height: 50,
  },
  dateButton: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 10,
    marginBottom: 15,
  },
  dateButtonText: {
    fontSize: 16,
    color: '#333',
  },
  notesInput: {
    height: 100,
    textAlignVertical: 'top',
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  accessItem: {
    padding: 15,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    marginBottom: 10,
  },
  emailText: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 5,
  },
  reasonText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  statusText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  expiryText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  notesText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 10,
  },
  actionButton: {
    padding: 8,
    borderRadius: 6,
    marginLeft: 10,
  },
  revokeButton: {
    backgroundColor: '#FF3B30',
  },
  extendButton: {
    backgroundColor: '#34C759',
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
}); 