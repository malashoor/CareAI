import { Platform } from 'react-native';

const fontFamily = Platform.select({
  ios: 'System',
  android: 'Roboto',
  default: 'System',
});

export const typography = {
  // Headings
  h1: {
    fontFamily,
    fontSize: 32,
    fontWeight: '700',
    lineHeight: 40,
  },
  h2: {
    fontFamily,
    fontSize: 24,
    fontWeight: '600',
    lineHeight: 32,
  },
  h3: {
    fontFamily,
    fontSize: 20,
    fontWeight: '600',
    lineHeight: 28,
  },
  h4: {
    fontFamily,
    fontSize: 18,
    fontWeight: '600',
    lineHeight: 24,
  },
  
  // Body text
  body1: {
    fontFamily,
    fontSize: 16,
    fontWeight: '400',
    lineHeight: 24,
  },
  body2: {
    fontFamily,
    fontSize: 14,
    fontWeight: '400',
    lineHeight: 20,
  },
  
  // Caption text
  caption: {
    fontFamily,
    fontSize: 12,
    fontWeight: '400',
    lineHeight: 16,
  },
  
  // Button text
  button: {
    fontFamily,
    fontSize: 16,
    fontWeight: '600',
    lineHeight: 24,
    textTransform: 'uppercase',
  },
  
  // Input text
  input: {
    fontFamily,
    fontSize: 16,
    fontWeight: '400',
    lineHeight: 24,
  },
  
  // Label text
  label: {
    fontFamily,
    fontSize: 14,
    fontWeight: '500',
    lineHeight: 20,
  },
} as const;

export type TypographyKey = keyof typeof typography; 