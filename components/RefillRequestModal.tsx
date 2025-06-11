import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  Platform
} from 'react-native';
import { MapPin, Package, Calendar, AlertTriangle } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRefills } from '@/hooks/useRefills';
import { useDeliveryLocations } from '@/hooks/useDeliveryLocations';

interface Props {
  visible: boolean;
  onClose: () => void;
  userId: string;
  medicationId: string;
  medicationName: string;
  remainingDays: number;
}

export default function RefillRequestModal({
  visible,
  onClose,
  userId,
  medicationId,
  medicationName,
  remainingDays,
}: Props) {
  const { requestRefill } = useRefills(userId);
  const { locations, defaultLocation } = useDeliveryLocations(userId);
  const [selectedLocation, setSelectedLocation] = useState(defaultLocation?.id || '');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!selectedLocation) return;

    const location = locations.find(l => l.id === selectedLocation);
    if (!location) return;

    setIsSubmitting(true);
    try {
      await requestRefill(medicationId, remainingDays, location.address);
      onClose();
    } catch (error) {
      console.error('Error requesting refill:', error);
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
          <Text style={styles.title}>Request Medication Refill</Text>

          <View style={styles.medicationInfo}>
            <Package color="#007AFF" size={24} />
            <View style={styles.medicationDetails}>
              <Text style={styles.medicationName}>{medicationName}</Text>
              <Text style={styles.daysRemaining}>
                {remainingDays} days remaining
              </Text>
            </View>
          </View>

          {remainingDays <= 3 && (
            <View style={styles.warningBox}>
              <AlertTriangle color="#FF3B30" size={20} />
              <Text style={styles.warningText}>
                Low medication supply! Refill needed soon.
              </Text>
            </View>
          )}

          <Text style={styles.sectionTitle}>Delivery Location</Text>
          <ScrollView style={styles.locationsList}>
            {locations.map((location) => (
              <TouchableOpacity
                key={location.id}
                style={[
                  styles.locationCard,
                  selectedLocation === location.id && styles.selectedLocation,
                ]}
                onPress={() => setSelectedLocation(location.id)}>
                <MapPin
                  color={selectedLocation === location.id ? '#FFFFFF' : '#666666'}
                  size={20}
                />
                <View style={styles.locationDetails}>
                  <Text
                    style={[
                      styles.locationAddress,
                      selectedLocation === location.id && styles.selectedText,
                    ]}>
                    {location.address.street}
                  </Text>
                  <Text
                    style={[
                      styles.locationCity,
                      selectedLocation === location.id && styles.selectedText,
                    ]}>
                    {location.address.city}, {location.address.state} {location.address.zipCode}
                  </Text>
                </View>
                {location.is_default && (
                  <View style={styles.defaultBadge}>
                    <Text style={styles.defaultText}>Default</Text>
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </ScrollView>

          <View style={styles.deliveryInfo}>
            <Calendar color="#34C759" size={20} />
            <Text style={styles.deliveryText}>
              Estimated delivery: 2-3 business days
            </Text>
          </View>

          <View style={styles.actions}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={onClose}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.submitButton}
              onPress={handleSubmit}
              disabled={!selectedLocation || isSubmitting}>
              <LinearGradient
                colors={['#34C759', '#32D74B']}
                style={styles.submitGradient}>
                <Text style={styles.submitText}>
                  {isSubmitting ? 'Requesting...' : 'Request Refill'}
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
  medicationInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F8F8',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  medicationDetails: {
    marginLeft: 12,
  },
  medicationName: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#000000',
  },
  daysRemaining: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#666666',
    marginTop: 4,
  },
  warningBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFE5E5',
    padding: 12,
    borderRadius: 12,
    marginBottom: 20,
  },
  warningText: {
    flex: 1,
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#FF3B30',
    marginLeft: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#000000',
    marginBottom: 12,
  },
  locationsList: {
    maxHeight: 200,
    marginBottom: 20,
  },
  locationCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F8F8',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
  },
  selectedLocation: {
    backgroundColor: '#007AFF',
  },
  locationDetails: {
    flex: 1,
    marginLeft: 12,
  },
  locationAddress: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#000000',
  },
  locationCity: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#666666',
    marginTop: 4,
  },
  selectedText: {
    color: '#FFFFFF',
  },
  defaultBadge: {
    backgroundColor: '#E3F2FF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  defaultText: {
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
    color: '#007AFF',
  },
  deliveryInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F7FF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
  },
  deliveryText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#000000',
    marginLeft: 12,
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
  submitButton: {
    flex: 1,
    borderRadius: 12,
    overflow: 'hidden',
  },
  submitGradient: {
    padding: 16,
    alignItems: 'center',
  },
  submitText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
  },
});