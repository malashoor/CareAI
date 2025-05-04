import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { useApiTracking } from '../hooks/useApiTracking';
import { withPerformanceTracking } from '../components/withPerformanceTracking';

function ExampleScreen() {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<any>(null);
  const { trackApiCall, trackAnimation } = useApiTracking();

  const fetchData = async () => {
    setLoading(true);
    try {
      // Track API call performance
      const result = await trackApiCall('fetchData', async () => {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        return { message: 'Data fetched successfully' };
      });
      
      setData(result);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAnimation = () => {
    // Track animation performance
    trackAnimation('buttonPress', () => {
      // Simulate animation
      console.log('Animation completed');
    });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Example Screen</Text>
      
      <TouchableOpacity 
        style={styles.button} 
        onPress={fetchData}
        disabled={loading}
      >
        <Text style={styles.buttonText}>
          {loading ? 'Loading...' : 'Fetch Data'}
        </Text>
      </TouchableOpacity>

      {loading && <ActivityIndicator style={styles.loader} />}
      
      {data && (
        <View style={styles.dataContainer}>
          <Text style={styles.dataText}>{data.message}</Text>
        </View>
      )}

      <TouchableOpacity 
        style={styles.button} 
        onPress={handleAnimation}
      >
        <Text style={styles.buttonText}>Trigger Animation</Text>
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
  button: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 15,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  loader: {
    marginVertical: 20,
  },
  dataContainer: {
    padding: 15,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    marginBottom: 15,
  },
  dataText: {
    fontSize: 16,
    color: '#333',
  },
});

export default withPerformanceTracking(ExampleScreen, 'ExampleScreen'); 