import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, ViewStyle, TextStyle, KeyboardTypeOptions } from 'react-native';
import { theme } from '@/theme';

interface NationalIdInputProps {
  value: string;
  onChange: (value: string) => void;
  country: string;
  error?: string;
  style?: ViewStyle;
  label?: string;
}

const COUNTRY_CONFIGS = {
  SA: {
    pattern: /^[0-9]{10}$/,
    placeholder: 'Enter 10-digit ID',
    maxLength: 10,
    keyboardType: 'numeric' as KeyboardTypeOptions,
  },
  // Add more countries as needed
  DEFAULT: {
    pattern: /^[a-zA-Z0-9]{5,20}$/,
    placeholder: 'Enter ID',
    maxLength: 20,
    keyboardType: 'default' as KeyboardTypeOptions,
  },
};

export default function NationalIdInput({
  value,
  onChange,
  country,
  error,
  style,
  label = 'National ID',
}: NationalIdInputProps) {
  const [isValid, setIsValid] = useState(true);
  const config = COUNTRY_CONFIGS[country as keyof typeof COUNTRY_CONFIGS] || COUNTRY_CONFIGS.DEFAULT;

  useEffect(() => {
    if (value) {
      setIsValid(config.pattern.test(value));
    }
  }, [value, config.pattern]);

  const handleChange = (text: string) => {
    onChange(text);
  };

  return (
    <View style={[styles.container, style]}>
      <Text style={styles.label as TextStyle}>{label}</Text>
      <TextInput
        value={value}
        onChangeText={handleChange}
        placeholder={config.placeholder}
        maxLength={config.maxLength}
        keyboardType={config.keyboardType}
        style={[
          styles.input as TextStyle,
          !isValid && styles.inputError as TextStyle,
        ]}
        accessibilityLabel={`${label} input field`}
        accessibilityHint={`Enter your ${label.toLowerCase()}`}
      />
      {error && <Text style={styles.errorText as TextStyle}>{error}</Text>}
      {!isValid && value && (
        <Text style={styles.errorText as TextStyle}>
          Please enter a valid {label.toLowerCase()}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  } as ViewStyle,
  label: {
    fontSize: 16,
    fontFamily: theme.typography.families.medium,
    color: theme.colors.text.primary,
    marginBottom: 8,
  } as TextStyle,
  input: {
    height: 48,
    borderWidth: 1,
    borderColor: theme.colors.status.info,
    borderRadius: 8,
    paddingHorizontal: 16,
    fontSize: 16,
    fontFamily: theme.typography.families.regular,
    color: theme.colors.text.primary,
    backgroundColor: theme.colors.background.primary,
  } as TextStyle,
  inputError: {
    borderColor: theme.colors.status.error,
  } as TextStyle,
  errorText: {
    fontSize: 14,
    fontFamily: theme.typography.families.regular,
    color: theme.colors.status.error,
    marginTop: 4,
  } as TextStyle,
}); 