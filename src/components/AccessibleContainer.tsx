import React from 'react';
import { View, ViewStyle, StyleSheet } from 'react-native';
import { accessibility } from '../utils/accessibility';

interface AccessibleContainerProps {
  children: React.ReactNode;
  style?: ViewStyle;
  accessibilityLabel?: string;
  accessibilityRole?: string;
  accessibilityLiveRegion?: 'polite' | 'assertive' | 'off';
  testID?: string;
}

export const AccessibleContainer: React.FC<AccessibleContainerProps> = ({
  children,
  style,
  accessibilityLabel,
  accessibilityRole,
  accessibilityLiveRegion,
  testID,
}) => {
  return (
    <View
      style={[styles.container, style]}
      accessibilityLabel={accessibilityLabel}
      accessibilityRole={accessibilityRole}
      accessibilityLiveRegion={accessibilityLiveRegion}
      testID={testID}
    >
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
}); 