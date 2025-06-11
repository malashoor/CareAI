import React from 'react';
import { StyleSheet, View } from 'react-native';
import { APITest } from '../components/APITest';

export function SettingsScreen() {
  return (
    <View style={styles.container}>
      <APITest />
      {/* ... other settings components ... */}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
}); 