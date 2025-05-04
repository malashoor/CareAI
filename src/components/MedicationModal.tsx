import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Platform,
  ScrollView,
} from 'react-native';
import { Text, TextInput, Button, Chip } from 'react-native-paper';
import { makeStyles, useTheme } from '@rneui/themed';
import { useTranslation } from 'react-i18next';
import * as Haptics from 'expo-haptics';
import Modal from 'react-native-modal';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { MedicationFormData } from '@/types/medication';

interface MedicationModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (data: MedicationFormData) => Promise<void>;
  initialData?: Partial<MedicationFormData>;
}

const TIME_OPTIONS = ['Morning', 'Noon', 'Evening', 'Night'] as const;
type TimeOption = typeof TIME_OPTIONS[number];

interface TimeOfDayPickerProps {
  selectedTimes: string[];
  onChange: (times: string[]) => void;
  error?: string;
}

const TimeOfDayPicker: React.FC<TimeOfDayPickerProps> = ({
  selectedTimes,
  onChange,
  error,
}) => {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const styles = useStyles();

  const handleTimeToggle = (time: TimeOption): void => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const newTimes = selectedTimes.includes(time)
      ? selectedTimes.filter(t => t !== time)
      : [...selectedTimes, time];
    onChange(newTimes);
  };

  return (
    <View style={styles.timePickerContainer}>
      <Text style={[styles.timePickerLabel, { color: theme.colors.text.primary }]}>
        {t('Time of Day')}
      </Text>
      <View style={styles.timeChipsContainer}>
        {TIME_OPTIONS.map((time) => (
          <Chip
            key={time}
            selected={selectedTimes.includes(time)}
            onPress={() => handleTimeToggle(time)}
            style={[
              styles.timeChip,
              {
                backgroundColor: selectedTimes.includes(time)
                  ? theme.colors.primary
                  : theme.colors.surfaceVariant,
              },
            ]}
            textStyle={[
              styles.timeChipText,
              {
                color: selectedTimes.includes(time)
                  ? theme.colors.onPrimary
                  : theme.colors.onSurfaceVariant,
              },
            ]}
            accessibilityLabel={t(`${time} time option`)}
            accessibilityHint={t('Select to take medication at this time')}
            accessibilityRole="button"
            accessibilityState={{
              selected: selectedTimes.includes(time),
            }}
          >
            {t(time)}
          </Chip>
        ))}
      </View>
      {error && (
        <Text style={[styles.errorText, { color: theme.colors.error }]}>
          {error}
        </Text>
      )}
    </View>
  );
};

export const MedicationModal: React.FC<MedicationModalProps> = ({
  visible,
  onClose,
  onSubmit,
  initialData,
}) => {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const styles = useStyles();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<MedicationFormData>({
    name: initialData?.name || '',
    dosage: initialData?.dosage || '',
    frequency: initialData?.frequency || '',
    timeOfDay: initialData?.timeOfDay || [],
  });
  const [errors, setErrors] = useState<Partial<Record<keyof MedicationFormData, string>>>({});

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof MedicationFormData, string>> = {};

    if (!formData.name.trim()) {
      newErrors.name = t('Medication name is required');
    }

    if (!formData.dosage.trim()) {
      newErrors.dosage = t('Dosage is required');
    } else {
      const dosageMatch = formData.dosage.match(/^\d+(\.\d+)?\s*[a-zA-Z]+$/);
      if (!dosageMatch) {
        newErrors.dosage = t('Please enter a valid dosage (e.g., 10mg)');
      }
    }

    if (!formData.frequency.trim()) {
      newErrors.frequency = t('Frequency is required');
    }

    if (formData.timeOfDay.length === 0) {
      newErrors.timeOfDay = t('Please select at least one time of day');
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (): Promise<void> => {
    if (!validateForm()) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }

    try {
      setIsSubmitting(true);
      await onSubmit(formData);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      onClose();
    } catch (error) {
      console.error('Error submitting medication:', error);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = (): void => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onClose();
  };

  const handleTextChange = (field: keyof MedicationFormData, text: string): void => {
    setFormData((prev: MedicationFormData) => ({ ...prev, [field]: text }));
  };

  return (
    <Modal
      isVisible={visible}
      onBackdropPress={handleCancel}
      onBackButtonPress={handleCancel}
      useNativeDriver
      hideModalContentWhileAnimating
      style={styles.modal}
    >
      <KeyboardAwareScrollView
        enableOnAndroid
        enableAutomaticScroll
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{
          ...styles.content,
          backgroundColor: theme.colors.background,
        }}
      >
        <Text style={[styles.title, { color: theme.colors.text.primary }]}>
          {t('Medication Details')}
        </Text>

        <TextInput
          label={t('Medication Name')}
          value={formData.name}
          onChangeText={(text: string) => handleTextChange('name', text)}
          error={!!errors.name}
          style={[styles.input, { backgroundColor: theme.colors.surface }]}
          textColor={theme.colors.text.primary}
          accessibilityLabel={t('Medication name input')}
          accessibilityHint={t('Enter the name of your medication')}
          accessibilityRole="textbox"
          accessibilityState={{ required: true }}
        />
        {errors.name && (
          <Text style={[styles.errorText, { color: theme.colors.error }]}>
            {errors.name}
          </Text>
        )}

        <TextInput
          label={t('Dosage')}
          value={formData.dosage}
          onChangeText={(text: string) => handleTextChange('dosage', text)}
          error={!!errors.dosage}
          style={[styles.input, { backgroundColor: theme.colors.surface }]}
          textColor={theme.colors.text.primary}
          placeholder={t('e.g., 10mg')}
          placeholderTextColor={theme.colors.text.secondary}
          accessibilityLabel={t('Dosage input')}
          accessibilityHint={t('Enter the dosage of your medication')}
          accessibilityRole="textbox"
          accessibilityState={{ required: true }}
        />
        {errors.dosage && (
          <Text style={[styles.errorText, { color: theme.colors.error }]}>
            {errors.dosage}
          </Text>
        )}

        <TextInput
          label={t('Frequency')}
          value={formData.frequency}
          onChangeText={(text: string) => handleTextChange('frequency', text)}
          error={!!errors.frequency}
          style={[styles.input, { backgroundColor: theme.colors.surface }]}
          textColor={theme.colors.text.primary}
          placeholder={t('e.g., Once daily')}
          placeholderTextColor={theme.colors.text.secondary}
          accessibilityLabel={t('Frequency input')}
          accessibilityHint={t('Enter how often you take this medication')}
          accessibilityRole="textbox"
          accessibilityState={{ required: true }}
        />
        {errors.frequency && (
          <Text style={[styles.errorText, { color: theme.colors.error }]}>
            {errors.frequency}
          </Text>
        )}

        <TimeOfDayPicker
          selectedTimes={formData.timeOfDay}
          onChange={(times) => setFormData((prev: MedicationFormData) => ({ ...prev, timeOfDay: times }))}
          error={errors.timeOfDay}
        />

        <View style={styles.actions}>
          <Button
            mode="outlined"
            onPress={handleCancel}
            style={[styles.button, { borderColor: theme.colors.outline }]}
            textColor={theme.colors.text.primary}
            accessibilityLabel={t('Cancel button')}
            accessibilityHint={t('Close the medication form')}
            accessibilityRole="button"
          >
            {t('Cancel')}
          </Button>
          <Button
            mode="contained"
            onPress={handleSubmit}
            loading={isSubmitting}
            disabled={isSubmitting}
            style={[styles.button, { backgroundColor: theme.colors.primary }]}
            textColor={theme.colors.onPrimary}
            accessibilityLabel={t('Save medication button')}
            accessibilityHint={t('Save the medication details')}
            accessibilityRole="button"
          >
            {t('Save')}
          </Button>
        </View>
      </KeyboardAwareScrollView>
    </Modal>
  );
};

const useStyles = makeStyles((theme) => ({
  modal: {
    margin: 0,
    justifyContent: 'flex-end',
  },
  content: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 24,
    maxHeight: '80%',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  input: {
    marginBottom: 16,
  },
  errorText: {
    fontSize: 12,
    marginTop: -12,
    marginBottom: 16,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 20,
    gap: 12,
  },
  button: {
    minWidth: 100,
  },
  timePickerContainer: {
    marginBottom: 16,
  },
  timePickerLabel: {
    fontSize: 16,
    marginBottom: 8,
  },
  timeChipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  timeChip: {
    marginRight: 8,
    marginBottom: 8,
  },
  timeChipText: {
    fontSize: 14,
  },
})); 