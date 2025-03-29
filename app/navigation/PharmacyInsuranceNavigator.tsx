import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '@/theme';
import { View } from 'react-native';

import PharmacyRefillsScreen from '@/screens/PharmacyRefillsScreen';
import NewPharmacyRefillScreen from '@/screens/NewPharmacyRefillScreen';
import RefillDetailsScreen from '@/screens/RefillDetailsScreen';
import InsuranceClaimsScreen from '@/screens/InsuranceClaimsScreen';
import NewInsuranceClaimScreen from '@/screens/NewInsuranceClaimScreen';
import ClaimDetailsScreen from '@/screens/ClaimDetailsScreen';
import NotificationsScreen from '@/screens/NotificationsScreen';
import NotificationPreferencesScreen from '@/screens/NotificationPreferencesScreen';

export type PharmacyInsuranceStackParamList = {
  PharmacyRefills: undefined;
  NewPharmacyRefill: undefined;
  RefillDetails: { refillId: string };
  InsuranceClaims: undefined;
  NewInsuranceClaim: undefined;
  ClaimDetails: { claimId: string };
  Notifications: undefined;
  NotificationPreferences: undefined;
};

const Stack = createStackNavigator<PharmacyInsuranceStackParamList>();

export default function PharmacyInsuranceNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: theme.colors.background.primary,
        },
        headerTintColor: theme.colors.text.primary,
        headerTitleStyle: {
          fontFamily: theme.typography.families.bold,
        },
      }}
    >
      <Stack.Screen
        name="PharmacyRefills"
        component={PharmacyRefillsScreen}
        options={{
          title: 'Pharmacy Refills',
          headerRight: ({ navigation }) => (
            <View style={{ flexDirection: 'row' }}>
              <Ionicons
                name="notifications-outline"
                size={24}
                color={theme.colors.text.primary}
                style={{ marginRight: 16 }}
                onPress={() => navigation.navigate('Notifications')}
              />
              <Ionicons
                name="settings-outline"
                size={24}
                color={theme.colors.text.primary}
                style={{ marginRight: 16 }}
                onPress={() => navigation.navigate('NotificationPreferences')}
              />
            </View>
          ),
        }}
      />
      <Stack.Screen
        name="NewPharmacyRefill"
        component={NewPharmacyRefillScreen}
        options={{ title: 'New Refill Request' }}
      />
      <Stack.Screen
        name="RefillDetails"
        component={RefillDetailsScreen}
        options={{ title: 'Refill Details' }}
      />
      <Stack.Screen
        name="InsuranceClaims"
        component={InsuranceClaimsScreen}
        options={{ title: 'Insurance Claims' }}
      />
      <Stack.Screen
        name="NewInsuranceClaim"
        component={NewInsuranceClaimScreen}
        options={{ title: 'New Claim' }}
      />
      <Stack.Screen
        name="ClaimDetails"
        component={ClaimDetailsScreen}
        options={{ title: 'Claim Details' }}
      />
      <Stack.Screen
        name="Notifications"
        component={NotificationsScreen}
        options={{ title: 'Notifications' }}
      />
      <Stack.Screen
        name="NotificationPreferences"
        component={NotificationPreferencesScreen}
        options={{ title: 'Notification Preferences' }}
      />
    </Stack.Navigator>
  );
} 