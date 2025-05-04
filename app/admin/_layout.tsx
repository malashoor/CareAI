import React, { useEffect } from 'react';
import { Stack, useRouter } from 'expo-router';
import { useTheme } from '../theme/ThemeContext';
import { useAuthStore } from '../../store/authStore';

export default function AdminLayout() {
  const { colors } = useTheme();
  const router = useRouter();
  const { isAdmin, isCaregiver, loading } = useAuthStore();

  useEffect(() => {
    if (!loading && !isAdmin && !isCaregiver) {
      router.replace('/');
    }
  }, [loading, isAdmin, isCaregiver]);

  if (loading) {
    return null;
  }

  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: colors.background,
        },
        headerTintColor: colors.text,
        headerShown: true,
        animation: 'slide_from_right',
        gestureEnabled: true,
        gestureDirection: 'horizontal',
      }}
    >
      <Stack.Screen
        name="AdminDashboardScreen"
        options={{
          title: 'Admin Dashboard',
          headerShown: true,
          headerBackVisible: true,
        }}
      />
      <Stack.Screen
        name="subscription-analytics"
        options={{
          title: 'Subscription Analytics',
          headerShown: true,
          headerBackVisible: true,
        }}
      />
      <Stack.Screen
        name="GiftedAccessScreen"
        options={{
          title: 'Gifted Access',
          headerShown: true,
          headerBackVisible: true,
        }}
      />
    </Stack>
  );
} 