export const colors = {
  // Primary colors
  primary: '#007AFF',
  primaryDark: '#0055B3',
  primaryLight: '#4DA3FF',
  
  // Secondary colors
  secondary: '#5856D6',
  secondaryDark: '#3634A3',
  secondaryLight: '#7A79E0',
  
  // Background colors
  background: '#FFFFFF',
  backgroundDark: '#F2F2F7',
  card: '#F8F9FA',
  
  // Text colors
  text: '#000000',
  textSecondary: '#666666',
  textTertiary: '#999999',
  
  // Status colors
  success: '#34C759',
  warning: '#FFCC00',
  error: '#FF3B30',
  info: '#5856D6',
  
  // Border colors
  border: '#C6C6C8',
  borderLight: '#E5E5EA',
  
  // Overlay colors
  overlay: 'rgba(0, 0, 0, 0.5)',
  overlayLight: 'rgba(255, 255, 255, 0.8)',
  
  // Admin specific colors
  adminPrimary: '#5856D6',
  adminSecondary: '#FF9500',
  adminDanger: '#FF3B30',
  
  // New tokens
  surface: '#F2F2F7',
  surfaceVariant: '#E5E5EA',
  onPrimary: '#FFFFFF',
  onSurfaceVariant: '#3C3C43',
  outline: '#C7C7CC',
  
  shadow: '#000000',
} as const;

export type ColorKey = keyof typeof colors; 