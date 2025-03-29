import { useState, useEffect } from 'react';
import * as SplashScreen from 'expo-splash-screen';
import * as Font from 'expo-font';
import { Asset } from 'expo-asset';

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

export function useFrameworkReady() {
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function prepare() {
      try {
        // Pre-load fonts
        await Font.loadAsync({
          'Inter-Regular': require('@expo-google-fonts/inter/Inter_400Regular.ttf'),
          'Inter-Medium': require('@expo-google-fonts/inter/Inter_500Medium.ttf'),
          'Inter-SemiBold': require('@expo-google-fonts/inter/Inter_600SemiBold.ttf'),
          'Inter-Bold': require('@expo-google-fonts/inter/Inter_700Bold.ttf'),
        });

        // Pre-load images
        await Asset.loadAsync([
          require('../assets/icon.png'),
          require('../assets/splash.png'),
          require('../assets/adaptive-icon.png'),
          require('../assets/favicon.png'),
        ]);

        // Artificially delay for 2 seconds to show splash screen
        await new Promise(resolve => setTimeout(resolve, 2000));

        setIsReady(true);
      } catch (e) {
        setError(e instanceof Error ? e.message : 'An error occurred while loading resources');
      } finally {
        // Hide splash screen
        await SplashScreen.hideAsync();
      }
    }

    prepare();
  }, []);

  return { isReady, error };
} 