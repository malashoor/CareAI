import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity } from 'react-native';
import { useApiTracking } from '../hooks/useApiTracking';
import { withPerformanceTracking } from '../components/withPerformanceTracking';
import { sentryMonitoring } from '../services/sentryMonitoring';

function NewReminderScreen() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const { trackApiCall } = useApiTracking();

  useEffect(() => {
    const initializeForm = async () => {
      try {
        // Start a span for form initialization
        const span = sentryMonitoring.startSpan('NewReminderScreenLoad', 'Initialize Form');
        
        // Simulate loading default values
        await new Promise(resolve => setTimeout(resolve, 300));
        setTitle('New Reminder');
        
        // Finish the span
        if (span) span.finish();
      } catch (error) {
        console.error('Error initializing form:', error);
      }
    };

    initializeForm();
  }, []);

  const handleSubmit = async () => {
    setLoading(true);
    try {
      // Track API call performance
      await trackApiCall('createReminder', async () => {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        return { success: true };
      });

      // Navigate back or show success message
    } catch (error) {
      console.error('Error creating reminder:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Create New Reminder</Text>
      
      <TextInput
        style={styles.input}
        placeholder="Title"
        value={title}
        onChangeText={setTitle}
      />
      
      <TextInput
        style={[styles.input, styles.descriptionInput]}
        placeholder="Description"
        value={description}
        onChangeText={setDescription}
        multiline
      />
      
      <TouchableOpacity 
        style={styles.button} 
        onPress={handleSubmit}
        disabled={loading}
      >
        <Text style={styles.buttonText}>
          {loading ? 'Creating...' : 'Create Reminder'}
        </Text>
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
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 10,
    marginBottom: 15,
    fontSize: 16,
  },
  descriptionInput: {
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
});

export default withPerformanceTracking(NewReminderScreen, 'NewReminderScreenLoad'); 