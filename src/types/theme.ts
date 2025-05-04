import { Theme as RNETheme } from '@rneui/themed';

export interface CustomThemeColors {
  primary: string;
  secondary: string;
  background: string;
  surface: string;
  surfaceVariant: string;
  text: {
    primary: string;
    secondary: string;
  };
  onPrimary: string;
  onSurfaceVariant: string;
  outline: string;
  overlay: string;
  error: string;
  success: string;
  warning: string;
}

declare module '@rneui/themed' {
  export interface Theme {
    colors: CustomThemeColors;
  }
} 