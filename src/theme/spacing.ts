export const spacing = {
  // Base spacing units
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
  
  // Component specific spacing
  buttonPadding: 12,
  inputPadding: 12,
  cardPadding: 16,
  sectionPadding: 24,
  
  // Layout spacing
  screenPadding: 16,
  contentPadding: 16,
  listItemSpacing: 12,
  
  // Icon spacing
  iconSize: 24,
  iconSpacing: 8,
  
  // Border radius
  borderRadius: {
    sm: 4,
    md: 8,
    lg: 16,
    xl: 24,
  },
} as const;

export type SpacingKey = keyof typeof spacing; 