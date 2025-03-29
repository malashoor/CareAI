import { useColorScheme } from 'react-native';
import { theme } from '../theme';

export function useTheme() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  return {
    ...theme,
    isDark,
    // Add any dynamic theme values based on color scheme here
  };
}