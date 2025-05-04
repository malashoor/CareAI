import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Button, Text } from 'react-native-paper';
import { useTheme } from '@rneui/themed';
import { MedicationModal } from '@/components/MedicationModal';
import { MedicationFormData } from '@/types/medication';
import * as Haptics from 'expo-haptics';

export const MedicationTestScreen: React.FC = () => {
  const { theme } = useTheme();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [lastAddedMedication, setLastAddedMedication] = useState<MedicationFormData | null>(null);

  const handleSubmit = async (data: MedicationFormData): Promise<void> => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setLastAddedMedication(data);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Button
        mode="contained"
        onPress={() => setIsModalVisible(true)}
        style={styles.button}
        accessibilityLabel="Add new medication"
        accessibilityHint="Opens the medication form"
      >
        Add Medication
      </Button>

      {lastAddedMedication && (
        <View style={[styles.resultCard, { backgroundColor: theme.colors.surface }]}>
          <Text style={[styles.resultTitle, { color: theme.colors.text.primary }]}>
            Last Added Medication:
          </Text>
          <Text style={[styles.resultText, { color: theme.colors.text.secondary }]}>
            Name: {lastAddedMedication.name}
          </Text>
          <Text style={[styles.resultText, { color: theme.colors.text.secondary }]}>
            Dosage: {lastAddedMedication.dosage}
          </Text>
          <Text style={[styles.resultText, { color: theme.colors.text.secondary }]}>
            Frequency: {lastAddedMedication.frequency}
          </Text>
          <Text style={[styles.resultText, { color: theme.colors.text.secondary }]}>
            Times: {lastAddedMedication.timeOfDay.join(', ')}
          </Text>
        </View>
      )}

      <MedicationModal
        visible={isModalVisible}
        onClose={() => setIsModalVisible(false)}
        onSubmit={handleSubmit}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  button: {
    marginBottom: 16,
  },
  resultCard: {
    padding: 16,
    borderRadius: 8,
    marginTop: 16,
  },
  resultTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  resultText: {
    fontSize: 16,
    marginBottom: 4,
  },
}); 