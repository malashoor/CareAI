import { TouchableOpacity, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { theme } from '../theme';

interface ButtonProps {
  onPress: () => void;
  title: string;
  variant?: 'primary' | 'secondary' | 'accent';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  gradient?: boolean;
}

export function Button({
  onPress,
  title,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  style,
  textStyle,
  gradient = false,
}: ButtonProps) {
  const getGradientColors = () => {
    switch (variant) {
      case 'primary':
        return theme.colors.gradients.primary;
      case 'secondary':
        return theme.colors.gradients.info;
      case 'accent':
        return [theme.colors.accent.default, theme.colors.accent.dark];
      default:
        return theme.colors.gradients.primary;
    }
  };

  const buttonStyles = [
    styles.button,
    styles[size],
    !gradient && styles[variant],
    disabled && styles.disabled,
    style,
  ];

  const textStyles = [
    styles.text,
    styles[`${size}Text`],
    disabled && styles.disabledText,
    textStyle,
  ];

  const content = (
    <Text style={textStyles}>{title}</Text>
  );

  if (gradient) {
    return (
      <TouchableOpacity
        onPress={onPress}
        disabled={disabled}
        style={[styles.button, style]}>
        <LinearGradient
          colors={getGradientColors()}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.gradient, styles[size]]}>
          {content}
        </LinearGradient>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      style={buttonStyles}>
      {content}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    borderRadius: theme.borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  gradient: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  small: {
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
  },
  medium: {
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
  },
  large: {
    paddingVertical: theme.spacing.lg,
    paddingHorizontal: theme.spacing.xl,
  },
  primary: {
    backgroundColor: theme.colors.primary.default,
  },
  secondary: {
    backgroundColor: theme.colors.secondary.default,
  },
  accent: {
    backgroundColor: theme.colors.accent.default,
  },
  disabled: {
    opacity: 0.5,
  },
  text: {
    color: theme.colors.text.white,
    fontFamily: theme.typography.families.semibold,
  },
  smallText: {
    fontSize: theme.typography.sizes.sm,
  },
  mediumText: {
    fontSize: theme.typography.sizes.md,
  },
  largeText: {
    fontSize: theme.typography.sizes.lg,
  },
  disabledText: {
    color: theme.colors.text.light,
  },
});