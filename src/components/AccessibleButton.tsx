import React from 'react';
import { 
  TouchableOpacity, 
  Text, 
  StyleSheet, 
  ViewStyle, 
  TextStyle,
  ActivityIndicator,
} from 'react-native';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';
import { typography } from '../theme/typography';

interface AccessibleButtonProps {
  onPress: () => void;
  title: string;
  icon?: string;
  variant?: 'primary' | 'secondary' | 'danger';
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  accessibilityLabel?: string;
  accessibilityHint?: string;
}

export const AccessibleButton: React.FC<AccessibleButtonProps> = ({
  onPress,
  title,
  icon,
  variant = 'primary',
  disabled = false,
  loading = false,
  style,
  textStyle,
  accessibilityLabel,
  accessibilityHint,
}) => {
  const getVariantStyles = () => {
    switch (variant) {
      case 'secondary':
        return {
          container: styles.secondaryContainer,
          text: styles.secondaryText,
        };
      case 'danger':
        return {
          container: styles.dangerContainer,
          text: styles.dangerText,
        };
      default:
        return {
          container: styles.primaryContainer,
          text: styles.primaryText,
        };
    }
  };

  const variantStyles = getVariantStyles();
  const isDisabled = disabled || loading;

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={isDisabled}
      style={[
        styles.container,
        variantStyles.container,
        isDisabled && styles.disabledContainer,
        style,
      ]}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel || title}
      accessibilityHint={accessibilityHint}
      accessibilityState={{ disabled: isDisabled }}
    >
      {loading ? (
        <ActivityIndicator 
          size="small" 
          color={variant === 'primary' ? colors.background : colors.primary} 
        />
      ) : (
        <Text style={[styles.text, variantStyles.text, isDisabled && styles.disabledText, textStyle]}>
          {title}
        </Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    borderRadius: spacing.borderRadius.md,
    flexDirection: 'row',
    justifyContent: 'center',
    padding: spacing.buttonPadding,
  },
  dangerContainer: {
    backgroundColor: colors.error,
  },
  dangerText: {
    color: colors.background,
  },
  disabledContainer: {
    backgroundColor: colors.textTertiary,
    borderColor: colors.textTertiary,
  },
  disabledText: {
    color: colors.textSecondary,
  },
  primaryContainer: {
    backgroundColor: colors.primary,
  },
  primaryText: {
    color: colors.background,
  },
  secondaryContainer: {
    backgroundColor: colors.background,
    borderColor: colors.primary,
    borderWidth: 1,
  },
  secondaryText: {
    color: colors.primary,
  },
  text: {
    ...typography.button,
    textAlign: 'center',
  },
}); 