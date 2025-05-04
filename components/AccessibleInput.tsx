import React from 'react';
import { StyleSheet, Text, TextInput, TextInputProps, View } from 'react-native';
import { useAccessibility } from '../hooks/useAccessibility';
import { theme } from '../theme';

interface AccessibleInputProps extends TextInputProps {
  label: string;
  error?: string;
  accessibilityHint?: string;
}

export const AccessibleInput: React.FC<AccessibleInputProps> = ({ 
  label, 
  error,
  accessibilityHint,
  ...props 
}) => {
  const { getAccessibilityProps } = useAccessibility();

  const inputStyle = [
    styles.input,
    error && styles.inputError,
    props.style
  ];

  const accessibilityProps = {
    ...getAccessibilityProps(label),
    accessibilityHint: accessibilityHint || `Enter ${label.toLowerCase()}`,
    accessibilityState: {
      invalid: !!error
    }
  };

  return (
    <View style={styles.container}>
      <Text 
        style={[styles.label, error && styles.labelError]} 
        {...getAccessibilityProps(`${label} label`)}
      >
        {label}
      </Text>
      <TextInput
        style={inputStyle}
        placeholderTextColor={theme.colors.text + '80'}
        {...props}
        {...accessibilityProps}
      />
      {error && (
        <Text 
          style={styles.errorText}
          {...getAccessibilityProps(`${label} error`)}
          accessibilityRole="alert"
        >
          {error}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
    width: '100%',
  },
  errorText: {
    color: theme.colors.error,
    fontSize: 14,
    marginTop: 4,
  },
  input: {
    borderColor: theme.colors.border,
    borderRadius: 8,
    borderWidth: 1,
    color: theme.colors.text,
    fontSize: 16,
    padding: 12,
  },
  inputError: {
    borderColor: theme.colors.error,
  },
  label: {
    color: theme.colors.text,
    fontSize: 16,
    marginBottom: 8,
  },
  labelError: {
    color: theme.colors.error,
  },
}); 