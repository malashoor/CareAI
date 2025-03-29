import React, { createContext, useContext, useEffect, useState } from 'react';
import { useColorScheme } from 'react-native';
import { usePreferencesStore } from '@/services/preferences';
import { theme } from './index';

interface ThemeContextType {
  colors: typeof theme.colors;
  spacing: typeof theme.spacing;
  borderRadius: typeof theme.borderRadius;
  typography: typeof theme.typography;
  shadows: typeof theme.shadows;
  isDark: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const systemColorScheme = useColorScheme();
  const { theme: userTheme } = usePreferencesStore();
  const [isDark, setIsDark] = useState(systemColorScheme === 'dark');

  useEffect(() => {
    if (userTheme === 'system') {
      setIsDark(systemColorScheme === 'dark');
    } else {
      setIsDark(userTheme === 'dark');
    }
  }, [userTheme, systemColorScheme]);

  const value = {
    ...theme,
    isDark,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
} 