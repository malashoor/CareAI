import 'react-native-url-polyfill/auto';
import { Slot } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ThemeProvider } from '@rneui/themed';

export default function App() {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <Slot />
      </ThemeProvider>
    </SafeAreaProvider>
  );
} 