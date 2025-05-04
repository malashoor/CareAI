import { useCallback } from 'react';

export const useAccessibility = () => {
  const getAccessibilityProps = useCallback((label: string) => ({
    accessible: true,
    accessibilityLabel: label,
    accessibilityRole: 'text',
  }), []);

  return {
    getAccessibilityProps,
  };
}; 