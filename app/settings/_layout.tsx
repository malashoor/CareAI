import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function SettingsLayout() {
  return (
    <Tabs>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Settings',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="settings-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="privacy"
        options={{
          title: 'Privacy',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="shield-outline" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
} 