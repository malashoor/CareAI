import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Modal } from 'react-native-modal';
import { theme } from '../theme';
import { accessibility } from '../utils/accessibility';

interface AccessibleModalProps {
  visible: boolean;
  onDismiss: () => void;
  title: string;
  message: string;
  confirmLabel: string;
  cancelLabel: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export const AccessibleModal: React.FC<AccessibleModalProps> = ({
  visible,
  onDismiss,
  title,
  message,
  confirmLabel,
  cancelLabel,
  onConfirm,
  onCancel,
}) => {
  return (
    <Modal
      isVisible={visible}
      onBackdropPress={onDismiss}
      onBackButtonPress={onDismiss}
      {...accessibility.getAccessibilityProps({
        label: title,
        role: 'dialog'
      })}
    >
      <View style={styles.container}>
        <Text 
          style={styles.title}
          {...accessibility.getAccessibilityProps({
            label: title,
            role: 'header'
          })}
        >
          {title}
        </Text>
        
        <Text 
          style={styles.message}
          {...accessibility.getAccessibilityProps({
            label: message,
            role: 'text'
          })}
        >
          {message}
        </Text>

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.button, styles.cancelButton]}
            onPress={onCancel}
            {...accessibility.getAccessibilityProps({
              label: cancelLabel,
              role: 'button'
            })}
          >
            <Text style={styles.cancelButtonText}>{cancelLabel}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.confirmButton]}
            onPress={onConfirm}
            {...accessibility.getAccessibilityProps({
              label: confirmLabel,
              role: 'button'
            })}
          >
            <Text style={styles.confirmButtonText}>{confirmLabel}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  button: {
    borderRadius: theme.borderRadius.md,
    minWidth: 100,
    padding: theme.spacing.md,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cancelButton: {
    backgroundColor: theme.colors.background,
    borderColor: theme.colors.border,
    borderWidth: 1,
    marginRight: theme.spacing.md,
  },
  cancelButtonText: {
    color: theme.colors.text,
    fontFamily: theme.typography.button.fontFamily,
    fontSize: theme.typography.button.fontSize,
    textAlign: 'center',
  },
  confirmButton: {
    backgroundColor: theme.colors.primary,
  },
  confirmButtonText: {
    color: theme.colors.background,
    fontFamily: theme.typography.button.fontFamily,
    fontSize: theme.typography.button.fontSize,
    textAlign: 'center',
  },
  container: {
    alignItems: 'center',
    backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadius.lg,
    justifyContent: 'center',
    maxWidth: 400,
    padding: theme.spacing.lg,
    width: '80%',
  },
  message: {
    color: theme.colors.textSecondary,
    fontFamily: theme.typography.body1.fontFamily,
    fontSize: theme.typography.body1.fontSize,
    marginBottom: theme.spacing.lg,
    textAlign: 'center',
  },
  title: {
    color: theme.colors.text,
    fontFamily: theme.typography.h3.fontFamily,
    fontSize: theme.typography.h3.fontSize,
    marginBottom: theme.spacing.md,
    textAlign: 'center',
  },
}); 