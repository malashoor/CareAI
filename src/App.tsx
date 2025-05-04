import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { ThemeProvider } from '@rneui/themed';
import { lightTheme, darkTheme } from './theme';
import { sentryMonitoring } from './services/sentryMonitoring';
import { useAuth } from './hooks/useAuth';
import { LoginScreen } from './screens/LoginScreen';
import BottomTabNavigator from './navigation/BottomTabNavigator';
import { useColorScheme } from 'react-native';

const Stack = createStackNavigator();

export default function App() {
  const { user, loading } = useAuth();
  const colorScheme = useColorScheme();

  useEffect(() => {
    // Track app launch performance
    sentryMonitoring.trackAppLaunch();
  }, []);

  if (loading) {
    return null; // Or a loading screen
  }

  return (
    <ThemeProvider theme={colorScheme === 'dark' ? darkTheme : lightTheme}>
      <NavigationContainer>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          {!user ? (
            <Stack.Screen name="Login" component={LoginScreen} />
          ) : (
            <Stack.Screen name="Main" component={BottomTabNavigator} />
          )}
        </Stack.Navigator>
      </NavigationContainer>
    </ThemeProvider>
  );
} 