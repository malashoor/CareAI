import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Switch } from 'react-native-paper';
import { theme } from '../theme';
import { accessibility } from '../utils/accessibility';

interface AccessibleSwitchProps {
  value: boolean;
  onValueChange: (value: boolean) => void;
  accessibilityLabel: string;
  accessibilityHint?: string;
  disabled?: boolean;
}

export const AccessibleSwitch: React.FC<AccessibleSwitchProps> = ({
  value,
  onValueChange,
  accessibilityLabel,
  accessibilityHint,
  disabled,
}) => {
  return (
    <View style={styles.container}>
      <Switch
        value={value}
        onValueChange={onValueChange}
        disabled={disabled}
        color={theme.colors.primary}
        {...accessibility.getAccessibilityProps({
          label: accessibilityLabel,
          hint: accessibilityHint,
          role: 'switch',
          state: { checked: value }
        })}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
}); 