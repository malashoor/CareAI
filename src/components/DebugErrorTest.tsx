import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { sentryConfig } from '../services/sentryConfig';
import { useSentryTracking } from '../hooks/useSentryTracking';
import { theme } from '../styles/theme';

export function DebugErrorTest() {
  const { trackAction } = useSentryTracking('DebugErrorTest');

  const triggerTestError = () => {
    trackAction('trigger_test_error');
    sentryConfig.testErrorReporting();
  };

  const triggerCustomError = () => {
    trackAction('trigger_custom_error');
    try {
      throw new Error('Custom test error from DebugErrorTest');
    } catch (error) {
      sentryConfig.addActionBreadcrumb(
        'Custom error triggered',
        'DebugErrorTest',
        {
          error: error.message,
          stack: error.stack,
        }
      );
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Error Testing</Text>
      <Text style={styles.description}>
        Use these buttons to test error reporting and monitoring.
      </Text>
      <TouchableOpacity style={styles.button} onPress={triggerTestError}>
        <Text style={styles.buttonText}>Trigger Test Error</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.button} onPress={triggerCustomError}>
        <Text style={styles.buttonText}>Trigger Custom Error</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.background,
    borderRadius: 8,
    margin: 10,
    padding: 20,
  },
  title: {
    color: theme.colors.text,
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  description: {
    color: theme.colors.gray,
    fontSize: 14,
    marginBottom: 20,
  },
  button: {
    backgroundColor: theme.colors.primary,
    borderRadius: 8,
    marginBottom: 10,
    padding: 10,
  },
  buttonText: {
    color: theme.colors.white,
    fontWeight: '600',
    textAlign: 'center',
  },
}); 