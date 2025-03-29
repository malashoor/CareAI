import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '@/theme';
import HomeScreen from '../screens/HomeScreen';
import InsuranceClaimsScreen from '../screens/InsuranceClaimsScreen';
import PharmacyRefillsScreen from '../screens/PharmacyRefillsScreen';
import { NotificationCenter } from '../screens/NotificationCenter';
import ProfileScreen from '../screens/ProfileScreen';
import { Icon } from '@/components/Icon';

const Tab = createBottomTabNavigator();

export default function BottomTabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap;

          switch (route.name) {
            case 'Home':
              iconName = focused ? 'home' : 'home-outline';
              break;
            case 'Insurance':
              iconName = focused ? 'document-text' : 'document-text-outline';
              break;
            case 'Pharmacy':
              iconName = focused ? 'medical' : 'medical-outline';
              break;
            case 'Notifications':
              iconName = focused ? 'notifications' : 'notifications-outline';
              break;
            case 'Profile':
              iconName = focused ? 'person' : 'person-outline';
              break;
            default:
              iconName = 'help-circle';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Insurance" component={InsuranceClaimsScreen} />
      <Tab.Screen name="Pharmacy" component={PharmacyRefillsScreen} />
      <Tab.Screen name="Notifications" component={NotificationCenter} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
} 