export const colors = {
  primary: {
    light: '#4CAF50',
    default: '#2E7D32',
    dark: '#1B5E20',
  },
  secondary: {
    light: '#64B5F6',
    default: '#2196F3',
    dark: '#1565C0',
  },
  accent: {
    light: '#B2DFDB',
    default: '#009688',
    dark: '#00796B',
  },
  gradients: {
    primary: ['#1B5E20', '#1565C0'],
    sidebar: ['#2E7D32', '#1565C0'],
    success: ['#4CAF50', '#2E7D32'],
    info: ['#64B5F6', '#1565C0'],
    warning: ['#FFB74D', '#F57C00'],
    danger: ['#EF5350', '#C62828'],
  },
  text: {
    primary: '#000000',
    secondary: '#666666',
    light: '#8E8E93',
    white: '#FFFFFF',
  },
  background: {
    primary: '#FFFFFF',
    secondary: '#F2F2F7',
    tertiary: '#E5E5EA',
  },
  status: {
    success: '#4CAF50',
    warning: '#FF9500',
    error: '#FF3B30',
    info: '#007AFF',
  },
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const borderRadius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  round: 9999,
};

export const typography = {
  sizes: {
    xs: 12,
    sm: 14,
    md: 16,
    lg: 18,
    xl: 20,
    xxl: 24,
    xxxl: 32,
  },
  families: {
    regular: 'Inter-Regular',
    medium: 'Inter-Medium',
    semibold: 'Inter-SemiBold',
    bold: 'Inter-Bold',
  },
};

export const shadows = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.18,
    shadowRadius: 1.0,
    elevation: 1,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 3,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.30,
    shadowRadius: 4.65,
    elevation: 5,
  },
};

export const theme = {
  colors,
  spacing,
  borderRadius,
  typography,
  shadows,
};

export type Theme = typeof theme;