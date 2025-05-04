import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../constants/theme';

interface ToastNotificationProps {
  message: string;
  severity: 'error' | 'warning' | 'info';
  onDismiss: () => void;
  duration?: number;
}

export function ToastNotification({ 
  message, 
  severity, 
  onDismiss, 
  duration = 5000 
}: ToastNotificationProps) {
  const translateY = useRef(new Animated.Value(-100)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Slide in
    Animated.parallel([
      Animated.timing(translateY, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();

    // Auto dismiss after duration
    const timer = setTimeout(() => {
      dismiss();
    }, duration);

    return () => clearTimeout(timer);
  }, []);

  const dismiss = () => {
    Animated.parallel([
      Animated.timing(translateY, {
        toValue: -100,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onDismiss();
    });
  };

  const getSeverityColor = () => {
    switch (severity) {
      case 'error': return theme.colors.error;
      case 'warning': return theme.colors.warning;
      case 'info': return theme.colors.info;
      default: return theme.colors.primary;
    }
  };

  const getSeverityIcon = () => {
    switch (severity) {
      case 'error': return 'alert-circle';
      case 'warning': return 'warning';
      case 'info': return 'information-circle';
      default: return 'information-circle';
    }
  };

  return (
    <Animated.View
      style={[
        styles.container,
        {
          transform: [{ translateY }],
          opacity,
          backgroundColor: getSeverityColor(),
        },
      ]}
    >
      <View style={styles.content}>
        <Ionicons name={getSeverityIcon()} size={24} color="#fff" />
        <Text style={styles.message}>{message}</Text>
      </View>
      <TouchableOpacity onPress={dismiss} style={styles.dismissButton}>
        <Ionicons name="close" size={24} color="#fff" />
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    zIndex: 1000,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  content: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  message: {
    color: '#fff',
    fontSize: 16,
    marginLeft: 12,
    flex: 1,
  },
  dismissButton: {
    padding: 4,
  },
}); 