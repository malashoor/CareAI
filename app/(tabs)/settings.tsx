import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, useTheme } from '@rneui/themed';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function SettingsScreen() {
  const { theme } = useTheme();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Text h1 style={styles.title}>
        Settings
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
}); 