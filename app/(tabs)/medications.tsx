import React from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { Text, Button } from '@rneui/themed';
import { router } from 'expo-router';
import { colors } from '../../src/theme/colors';
import { spacing } from '../../src/theme/spacing';
import { typography } from '../../src/theme/typography';
import { t } from '../../src/i18n';

interface MedicationItem {
  id: string;
  name: string;
  dosage: string;
  schedule: string;
}

const MedicationCard = ({ medication }: { medication: MedicationItem }) => (
  <View 
    style={styles.medicationCard}
    accessible={true}
    accessibilityRole="button"
    accessibilityLabel={`${medication.name} ${medication.dosage}`}
  >
    <Text style={styles.medicationName}>{medication.name}</Text>
    <Text style={styles.medicationDetails}>{medication.dosage}</Text>
    <Text style={styles.medicationSchedule}>{medication.schedule}</Text>
  </View>
);

export default function MedicationsScreen() {
  const [medications] = React.useState<MedicationItem[]>([
    {
      id: '1',
      name: 'Aspirin',
      dosage: '81mg',
      schedule: 'Once daily'
    },
  ]);

  const handleAddMedication = () => {
    router.push('/(modals)/add-medication');
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.contentContainer}
      accessibilityRole="list"
      accessibilityLabel={t('medications.screenLabel')}
    >
      <View style={styles.header}>
        <Text style={styles.title}>{t('medications.title')}</Text>
        <Button
          title={t('medications.addButton')}
          onPress={handleAddMedication}
          icon={{ name: 'plus', type: 'feather' }}
          accessibilityLabel={t('medications.addMedicationLabel')}
          buttonStyle={styles.addButton}
        />
      </View>

      {medications.map((medication) => (
        <MedicationCard key={medication.id} medication={medication} />
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: spacing.screenPadding,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  title: {
    ...typography.h1,
    color: colors.text,
  },
  addButton: {
    backgroundColor: colors.primary,
    borderRadius: spacing.borderRadius.md,
  },
  medicationCard: {
    backgroundColor: colors.card,
    borderRadius: spacing.borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.md,
    elevation: 2,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  medicationName: {
    ...typography.h3,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  medicationDetails: {
    ...typography.body1,
    color: colors.textSecondary,
  },
  medicationSchedule: {
    ...typography.body2,
    color: colors.textTertiary,
    marginTop: spacing.xs,
  },
}); 