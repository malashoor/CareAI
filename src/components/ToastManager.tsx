import React, { useState, useCallback } from 'react';
import { View, StyleSheet } from 'react-native';
import { ToastNotification } from './ToastNotification';

interface Toast {
  id: string;
  message: string;
  severity: 'error' | 'warning' | 'info';
}

export function ToastManager() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((message: string, severity: 'error' | 'warning' | 'info') => {
    const id = Date.now().toString();
    setToasts(prev => [...prev, { id, message, severity }]);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);

  return (
    <View style={styles.container}>
      {toasts.map((toast, index) => (
        <ToastNotification
          key={toast.id}
          message={toast.message}
          severity={toast.severity}
          onDismiss={() => removeToast(toast.id)}
          duration={toast.severity === 'error' ? 8000 : 5000}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
  },
}); 