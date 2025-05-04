import React from 'react';
import { View, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { Text, Button, Input } from '@rneui/themed';
import { colors } from '../../src/theme/colors';
import { spacing } from '../../src/theme/spacing';
import { typography } from '../../src/theme/typography';
import { t } from '../../src/i18n';
import { MedicationFormData } from '../../src/types/medication';

export default function AddMedicationScreen() {
  const [formData, setFormData] = React.useState<MedicationFormData>({
    name: '',
    dosage: '',
    frequency: '',
    timeOfDay: [],
  });

  const handleSubmit = async (data: MedicationFormData) => {
    // TODO: Implement medication creation logic
    console.log('Medication data:', data);
    router.back();
  };

  return (
    <KeyboardAwareScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.content}
      accessible={true}
      accessibilityLabel={t('medications.addMedicationScreen')}
    >
      <Text style={[styles.title, { color: colors.text }]}>
        {t('medications.addMedication')}
      </Text>

      <Input
        label={t('medications.nameLabel')}
        value={formData.name}
        onChangeText={(text) => setFormData(prev => ({ ...prev, name: text }))}
        containerStyle={styles.input}
        accessibilityLabel={t('medications.nameInput')}
      />

      <Input
        label={t('medications.dosageLabel')}
        value={formData.dosage}
        onChangeText={(text) => setFormData(prev => ({ ...prev, dosage: text }))}
        containerStyle={styles.input}
        accessibilityLabel={t('medications.dosageInput')}
      />

      <Input
        label={t('medications.frequencyLabel')}
        value={formData.frequency}
        onChangeText={(text) => setFormData(prev => ({ ...prev, frequency: text }))}
        containerStyle={styles.input}
        accessibilityLabel={t('medications.frequencyInput')}
      />

      <View style={styles.buttonContainer}>
        <Button
          type="outline"
          onPress={() => router.back()}
          containerStyle={styles.button}
          accessibilityLabel={t('common.cancel')}
        >
          {t('common.cancel')}
        </Button>
        <Button
          onPress={() => handleSubmit(formData)}
          containerStyle={styles.button}
          accessibilityLabel={t('common.save')}
        >
          {t('common.save')}
        </Button>
      </View>
    </KeyboardAwareScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: spacing.screenPadding,
  },
  title: {
    ...typography.h1,
    marginBottom: spacing.xl,
  },
  input: {
    marginBottom: spacing.md,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.xl,
  },
  button: {
    flex: 1,
    marginHorizontal: spacing.xs,
  },
}); 