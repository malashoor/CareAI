import { useColorScheme as useColorSchemeRN } from 'react-native';
import { lightTheme, darkTheme, Theme } from '../theme';

export const useTheme = (): { theme: Theme } => {
  const colorScheme = useColorSchemeRN();
  const theme = colorScheme === 'dark' ? darkTheme : lightTheme;
  
  return { theme };
}; 