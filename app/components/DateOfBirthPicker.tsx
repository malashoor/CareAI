import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
  Modal,
  ViewStyle,
  TextStyle,
} from 'react-native';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { isValidDOB } from '../../lib/utils/age';

interface DateOfBirthPickerProps {
  value: Date | null;
  onChange: (date: Date | null) => void;
  error?: string;
}

export default function DateOfBirthPicker({
  value,
  onChange,
  error,
}: DateOfBirthPickerProps) {
  const [showPicker, setShowPicker] = useState(false);

  const handleChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
    const currentDate = selectedDate || value;
    setShowPicker(Platform.OS === 'ios');

    if (currentDate && isValidDOB(currentDate.toISOString())) {
      onChange(currentDate);
    } else if (currentDate) {
      onChange(null);
    }
  };

  const formattedDate = value ? value.toLocaleDateString() : 'Select Date of Birth';

  const buttonStyles: ViewStyle[] = [styles.button];
  if (error) buttonStyles.push(styles.buttonError);

  const textStyles: TextStyle[] = [styles.buttonText];
  if (error) textStyles.push(styles.buttonTextError);

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Date of Birth</Text>
      <Text style={styles.description}>
        Used for personalization and health insights
      </Text>
      
      <TouchableOpacity
        style={buttonStyles}
        onPress={() => setShowPicker(true)}
      >
        <Text style={textStyles}>
          {formattedDate}
        </Text>
      </TouchableOpacity>

      {error && <Text style={styles.errorText}>{error}</Text>}

      {(showPicker || Platform.OS === 'ios') && (
        <Modal
          visible={showPicker}
          transparent={true}
          animationType="slide"
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <TouchableOpacity
                  onPress={() => {
                    setShowPicker(false);
                    onChange(null);
                  }}
                >
                  <Text style={styles.modalButton}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => setShowPicker(false)}
                >
                  <Text style={[styles.modalButton, styles.modalButtonConfirm]}>
                    Confirm
                  </Text>
                </TouchableOpacity>
              </View>
              <DateTimePicker
                value={value || new Date()}
                mode="date"
                display="spinner"
                onChange={handleChange}
                maximumDate={new Date()}
              />
            </View>
          </View>
        </Modal>
      )}

      {Platform.OS === 'android' && showPicker && (
        <DateTimePicker
          value={value || new Date()}
          mode="date"
          display="default"
          onChange={handleChange}
          maximumDate={new Date()}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    color: '#000000',
    marginBottom: 4,
  },
  description: {
    fontSize: 14,
    color: '#8E8E93',
    marginBottom: 8,
  },
  button: {
    backgroundColor: '#F2F2F7',
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#C7C7CC',
  },
  buttonError: {
    borderColor: '#FF3B30',
  },
  buttonText: {
    fontSize: 16,
    color: '#000000',
  },
  buttonTextError: {
    color: '#FF3B30',
  },
  errorText: {
    fontSize: 14,
    color: '#FF3B30',
    marginTop: 4,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    paddingBottom: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  modalButton: {
    fontSize: 17,
    color: '#007AFF',
  },
  modalButtonConfirm: {
    fontWeight: '600',
  },
}); 