import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from '@rneui/themed';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';
import { typography } from '../theme/typography';

export default function TwoScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Tab Two</Text>
      <Text style={styles.subtitle}>Open up the code for this screen:</Text>
      <Text style={styles.code}>app/(tabs)/two.tsx</Text>
      <Text style={styles.subtitle}>Change any of the text, save the file, and your app will automatically update.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.screenPadding,
  },
  title: {
    ...typography.h1,
    color: colors.text,
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  subtitle: {
    ...typography.body1,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  code: {
    ...typography.body2,
    color: colors.primary,
    marginVertical: spacing.sm,
  },
}); 