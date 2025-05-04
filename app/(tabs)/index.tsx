import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, useTheme } from '@rneui/themed';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function HomeScreen() {
  const { theme } = useTheme();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Text h1 style={styles.title}>
        Welcome to CareAI
      </Text>
      <Text style={styles.subtitle}>
        Your intelligent care management platform
      </Text>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  title: {
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 16,
    opacity: 0.8,
  },
}); 