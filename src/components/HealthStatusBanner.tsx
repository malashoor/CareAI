import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Animated as RNAnimated } from 'react-native';
import NetInfo from '@react-native-community/netinfo';
import * as Sentry from '@sentry/react-native';
import { useApiTracking } from '../hooks/useApiTracking';
import { theme } from '../styles/theme';

interface HealthStatusBannerProps {
  onStatusChange?: (isHealthy: boolean) => void;
}

export const HealthStatusBanner: React.FC<HealthStatusBannerProps> = ({ onStatusChange }) => {
  const [isHealthy, setIsHealthy] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const fadeAnim = new RNAnimated.Value(0);
  const { trackApiCall } = useApiTracking();

  useEffect(() => {
    const checkHealth = async () => {
      try {
        // Check network connectivity
        const netInfo = await NetInfo.fetch();
        if (!netInfo.isConnected) {
          throw new Error('No internet connection');
        }

        // Check API health
        const response = await trackApiCall(
          'health-check',
          () => fetch('https://api.careai.com/health')
        );
        
        if (!response.ok) {
          throw new Error('API is not responding');
        }

        setIsHealthy(true);
        setErrorMessage(null);
        onStatusChange?.(true);
      } catch (error) {
        setIsHealthy(false);
        setErrorMessage(error instanceof Error ? error.message : 'Unknown error');
        onStatusChange?.(false);
        
        // Report to Sentry
        Sentry.captureException(error);
      }
    };

    // Initial check
    checkHealth();

    // Set up periodic health checks
    const interval = setInterval(checkHealth, 30000); // Check every 30 seconds

    return () => clearInterval(interval);
  }, [onStatusChange, trackApiCall]);

  useEffect(() => {
    RNAnimated.timing(fadeAnim, {
      toValue: isHealthy ? 0 : 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [isHealthy, fadeAnim]);

  if (isHealthy) return null;

  return (
    <RNAnimated.View style={[styles.container, { opacity: fadeAnim }]}>
      <Text style={styles.text}>
        {errorMessage || 'Service is currently unavailable'}
      </Text>
    </RNAnimated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.error,
    left: 0,
    padding: 10,
    position: 'absolute',
    right: 0,
    top: 0,
    zIndex: 1000,
  },
  text: {
    color: theme.colors.white,
    fontSize: 14,
    textAlign: 'center',
  },
}); 