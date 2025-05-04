import { Stack } from 'expo-router';
import { ThemeProvider } from '@rneui/themed';
import { SafeAreaProvider } from 'react-native-safe-area-context';

export default function RootLayout() {
  return (
    <ThemeProvider>
      <SafeAreaProvider>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(tabs)" />
          <Stack.Screen 
            name="(modals)"
            options={{
              presentation: 'modal',
            }}
          />
        </Stack>
      </SafeAreaProvider>
    </ThemeProvider>
  );
} 