import React from 'react';
import {
  TextInput,
  Text,
  View,
  StyleSheet,
  TextInputProps,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { theme } from '../theme';
import { accessibility } from '../utils/accessibility';

interface AccessibleInputProps extends TextInputProps {
  label: string;
  error?: string;
  hint?: string;
  containerStyle?: ViewStyle;
  labelStyle?: TextStyle;
  errorStyle?: TextStyle;
  testID?: string;
  keyboardType?: 'default' | 'number-pad' | 'decimal-pad' | 'numeric' | 'email-address' | 'phone-pad';
}

export const AccessibleInput: React.FC<AccessibleInputProps> = ({
  label,
  error,
  hint,
  containerStyle,
  labelStyle,
  errorStyle,
  testID,
  keyboardType,
  ...inputProps
}) => {
  const inputContainerStyle = [
    styles.inputContainer,
    error && styles.inputError,
    containerStyle,
  ];

  return (
    <View style={styles.container}>
      <Text style={[styles.label, labelStyle]}>{label}</Text>
      <View
        style={inputContainerStyle}
        {...accessibility.getAccessibilityProps({
          label,
          hint: hint || accessibility.hints.edit,
          role: 'textbox',
        })}
      >
        <TextInput
          style={styles.input}
          placeholderTextColor={theme.colors.textSecondary}
          testID={testID}
          keyboardType={keyboardType}
          {...inputProps}
        />
      </View>
      {error && (
        <Text style={[styles.error, errorStyle]}>{error}</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: theme.spacing.md,
  },
  error: {
    color: theme.colors.error,
    fontFamily: theme.typography.label.fontFamily,
    fontSize: theme.typography.label.fontSize,
    marginTop: theme.spacing.xs,
  },
  input: {
    color: theme.colors.text,
    fontFamily: theme.typography.input.fontFamily,
    fontSize: theme.typography.input.fontSize,
    padding: theme.spacing.md,
  },
  inputContainer: {
    backgroundColor: theme.colors.background,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    minHeight: 44,
  },
  inputError: {
    borderColor: theme.colors.error,
  },
  label: {
    color: theme.colors.text,
    fontFamily: theme.typography.label.fontFamily,
    fontSize: theme.typography.label.fontSize,
    marginBottom: theme.spacing.xs,
  },
}); 