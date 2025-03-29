import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TextInput,
  TouchableOpacity,
  Switch,
  ScrollView,
} from 'react-native';
import { MapPin } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useDeliveryLocations } from '@/hooks/useDeliveryLocations';

interface Props {
  visible: boolean;
  onClose: () => void;
  userId: string;
  editLocationId?: string;
}

export default function DeliveryLocationModal({
  visible,
  onClose,
  userId,
  editLocationId,
}: Props) {
  const { locations, addLocation, updateLocation } = useDeliveryLocations(userId);
  const editLocation = editLocationId
    ? locations.find(l => l.id === editLocationId)
    : null;

  const [address, setAddress] = useState({
    street: editLocation?.address.street || '',
    city: editLocation?.address.city || '',
    state: editLocation?.address.state || '',
    zipCode: editLocation?.address.zipCode || '',
    instructions: editLocation?.address.instructions || '',
  });
  const [isDefault, setIsDefault] = useState(editLocation?.is_default || false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!address.street || !address.city || !address.state || !address.zipCode) {
      return;
    }

    setIsSubmitting(true);
    try {
      if (editLocationId) {
        await updateLocation(editLocationId, address, isDefault);
      } else {
        await addLocation(address, isDefault);
      }
      onClose();
    } catch (error) {
      console.error('Error saving location:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}>
      <View style={styles.container}>
        <View style={styles.content}>
          <Text style={styles.title}>
            {editLocationId ? 'Edit Location' : 'Add New Location'}
          </Text>

          <ScrollView style={styles.form}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Street Address</Text>
              <TextInput
                style={styles.input}
                value={address.street}
                onChangeText={(text) => setAddress(prev => ({ ...prev, street: text }))}
                placeholder="Enter street address"
              />
            </View>

            <View style={styles.row}>
              <View style={[styles.inputGroup, { flex: 2 }]}>
                <Text style={styles.label}>City</Text>
                <TextInput
                  style={styles.input}
                  value={address.city}
                  onChangeText={(text) => setAddress(prev => ({ ...prev, city: text }))}
                  placeholder="Enter city"
                />
              </View>

              <View style={[styles.inputGroup, { flex: 1, marginLeft: 12 }]}>
                <Text style={styles.label}>State</Text>
                <TextInput
                  style={styles.input}
                  value={address.state}
                  onChangeText={(text) => setAddress(prev => ({ ...prev, state: text }))}
                  placeholder="State"
                  maxLength={2}
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>ZIP Code</Text>
              <TextInput
                style={styles.input}
                value={address.zipCode}
                onChangeText={(text) => setAddress(prev => ({ ...prev, zipCode: text }))}
                placeholder="Enter ZIP code"
                keyboardType="numeric"
                maxLength={5}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Delivery Instructions (Optional)</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={address.instructions}
                onChangeText={(text) => setAddress(prev => ({ ...prev, instructions: text }))}
                placeholder="Add any special delivery instructions"
                multiline
                numberOfLines={4}
              />
            </View>

            <View style={styles.defaultToggle}>
              <View style={styles.defaultLabel}>
                <MapPin color="#007AFF" size={20} />
                <Text style={styles.defaultText}>Set as default address</Text>
              </View>
              <Switch
                value={isDefault}
                onValueChange={setIsDefault}
                trackColor={{ false: '#D1D1D6', true: '#34C759' }}
              />
            </View>
          </ScrollView>

          <View style={styles.actions}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={onClose}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.saveButton}
              onPress={handleSubmit}
              disabled={isSubmitting}>
              <LinearGradient
                colors={['#007AFF', '#0055FF']}
                style={styles.saveGradient}>
                <Text style={styles.saveText}>
                  {isSubmitting ? 'Saving...' : 'Save Location'}
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  content: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 24,
    maxHeight: '80%',
  },
  title: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    color: '#000000',
    marginBottom: 20,
  },
  form: {
    marginBottom: 20,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#000000',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#F8F8F8',
    borderRadius: 12,
    padding: 12,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  row: {
    flexDirection: 'row',
  },
  defaultToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F0F7FF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
  },
  defaultLabel: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  defaultText: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#000000',
    marginLeft: 8,
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#F2F2F7',
    alignItems: 'center',
  },
  cancelText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#000000',
  },
  saveButton: {
    flex: 1,
    borderRadius: 12,
    overflow: 'hidden',
  },
  saveGradient: {
    padding: 16,
    alignItems: 'center',
  },
  saveText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
  },
});