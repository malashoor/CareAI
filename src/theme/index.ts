import { colors } from './colors';
import { spacing } from './spacing';
import { typography } from './typography';

export * from './colors';
export * from './spacing';
export * from './typography';

export interface Theme {
  colors: {
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
  };
  spacing: {
    xs: number;
    sm: number;
    md: number;
    lg: number;
    xl: number;
  };
  borderRadius: {
    sm: number;
    md: number;
    lg: number;
  };
  typography: {
    sizes: {
      xs: number;
      sm: number;
      md: number;
      lg: number;
      xl: number;
      xxl: number;
    };
    families: {
      regular: string;
      medium: string;
      semiBold: string;
      bold: string;
    };
  };
}

export const lightTheme: Theme = {
  colors: {
    primary: '#007AFF',
    secondary: '#5856D6',
    background: '#FFFFFF',
    surface: '#F2F2F7',
    surfaceVariant: '#E5E5EA',
    text: {
      primary: '#000000',
      secondary: '#8E8E93',
    },
    onPrimary: '#FFFFFF',
    onSurfaceVariant: '#3C3C43',
    outline: '#C7C7CC',
    overlay: 'rgba(0, 0, 0, 0.5)',
    error: '#FF3B30',
    success: '#34C759',
    warning: '#FFCC00',
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
  },
  borderRadius: {
    sm: 4,
    md: 8,
    lg: 16,
  },
  typography: {
    sizes: {
      xs: 12,
      sm: 14,
      md: 16,
      lg: 18,
      xl: 20,
      xxl: 24,
    },
    families: {
      regular: 'Inter-Regular',
      medium: 'Inter-Medium',
      semiBold: 'Inter-SemiBold',
      bold: 'Inter-Bold',
    },
  },
};

export const darkTheme: Theme = {
  ...lightTheme,
  colors: {
    ...lightTheme.colors,
    background: '#000000',
    surface: '#1C1C1E',
    surfaceVariant: '#2C2C2E',
    text: {
      primary: '#FFFFFF',
      secondary: '#8E8E93',
    },
    onSurfaceVariant: '#EBEBF5',
  },
};

export const theme = {
  colors,
  spacing,
  typography,
  borderRadius: {
    sm: 4,
    md: 8,
    lg: 12,
    xl: 16,
  },
}; 