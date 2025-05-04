import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useApiTracking } from '../hooks/useApiTracking';
import { withPerformanceTracking } from '../components/withPerformanceTracking';
import { sentryMonitoring } from '../services/sentryMonitoring';

function SOSScreen() {
  const [emergencyContacts, setEmergencyContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const { trackApiCall } = useApiTracking();

  useEffect(() => {
    const loadEmergencyContacts = async () => {
      try {
        // Start a span for emergency contact loading
        const span = sentryMonitoring.startSpan('SOSScreenLoad', 'Load Emergency Contacts');
        
        // Track API call performance
        const result = await trackApiCall('fetchEmergencyContacts', async () => {
          // Simulate API call
          await new Promise(resolve => setTimeout(resolve, 500));
          return [
            { id: 1, name: 'Emergency Services', phone: '911' },
            { id: 2, name: 'Family Doctor', phone: '123-456-7890' },
          ];
        });

        setEmergencyContacts(result);
        
        // Finish the span
        if (span) span.finish();
      } catch (error) {
        console.error('Error loading emergency contacts:', error);
      } finally {
        setLoading(false);
      }
    };

    loadEmergencyContacts();
  }, []);

  const handleSOS = async () => {
    try {
      // Start a span for SOS action
      const span = sentryMonitoring.startSpan('SOSScreenLoad', 'Trigger SOS');
      
      // Track API call performance
      await trackApiCall('triggerSOS', async () => {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        return { success: true };
      });

      Alert.alert(
        'SOS Triggered',
        'Emergency services have been notified. Help is on the way.',
        [{ text: 'OK' }]
      );
      
      // Finish the span
      if (span) span.finish();
    } catch (error) {
      console.error('Error triggering SOS:', error);
      Alert.alert('Error', 'Failed to trigger SOS. Please try again.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Emergency SOS</Text>
      
      {loading ? (
        <Text>Loading emergency contacts...</Text>
      ) : (
        <View style={styles.contactsContainer}>
          {emergencyContacts.map(contact => (
            <View key={contact.id} style={styles.contactItem}>
              <Text style={styles.contactName}>{contact.name}</Text>
              <Text style={styles.contactPhone}>{contact.phone}</Text>
            </View>
          ))}
        </View>
      )}
      
      <TouchableOpacity 
        style={styles.sosButton} 
        onPress={handleSOS}
      >
        <Text style={styles.sosButtonText}>SOS</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
  },
  contactsContainer: {
    marginBottom: 30,
  },
  contactItem: {
    padding: 15,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    marginBottom: 10,
  },
  contactName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  contactPhone: {
    fontSize: 14,
    color: '#666',
    marginTop: 5,
  },
  sosButton: {
    backgroundColor: '#FF3B30',
    padding: 20,
    borderRadius: 50,
    alignItems: 'center',
    marginTop: 'auto',
  },
  sosButtonText: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
  },
});

export default withPerformanceTracking(SOSScreen, 'SOSScreenLoad'); 