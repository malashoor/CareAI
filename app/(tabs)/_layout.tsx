import { useEffect } from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { Tabs, useRouter } from 'expo-router';
import {
  Home,
  Heart,
  Brain,
  Shield,
  Calendar,
  MessageSquare,
  Settings,
  Activity,
  Stethoscope,
  Users,
  Bell
} from 'lucide-react-native';
import { useAuth } from '@/hooks/useAuth';
import { useTabConfig } from '@/hooks/useTabConfig';
import { theme } from '@/theme';

const icons: Record<string, any> = {
  home: Home,
  heart: Heart,
  brain: Brain,
  shield: Shield,
  calendar: Calendar,
  'message-square': MessageSquare,
  settings: Settings,
  activity: Activity,
  stethoscope: Stethoscope,
  users: Users,
  bell: Bell
};

export default function TabLayout() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const { tabs, loading: tabsLoading, error } = useTabConfig();

  useEffect(() => {
    if (!authLoading && !user) {
      router.replace('/welcome');
      return;
    }

    // If user has no role, redirect to role selection
    if (!authLoading && user && !user.role) {
      router.replace('/welcome/role-selection');
      return;
    }
  }, [user, authLoading]);

  if (authLoading || tabsLoading || !user) return null;

  // Validate user role
  if (!['senior', 'child', 'medical'].includes(user.role)) {
    console.error('Invalid user role:', user.role);
    router.replace('/welcome/role-selection');
    return null;
  }

  // If no tabs available for role, redirect to role selection
  if (tabs.length === 0) {
    console.error('No tabs available for role:', user.role);
    router.replace('/welcome/role-selection');
    return null;
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Failed to load navigation</Text>
      </View>
    );
  }

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarActiveTintColor: theme.colors.primary.default,
        tabBarInactiveTintColor: theme.colors.text.light,
        tabBarLabelStyle: styles.tabBarLabel,
        tabBarIconStyle: styles.tabBarIcon,
      }}>
      {tabs.map((tab) => {
        const Icon = icons[tab.icon];
        if (!Icon) {
          console.error(`Icon not found for tab: ${tab.icon}`);
          return null;
        }

        return (
          <Tabs.Screen
            key={tab.name}
            name={tab.name}
            options={{
              title: tab.title,
              tabBarIcon: ({ color }) => <Icon size={24} color={color} />
            }}
          />
        );
      })}
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: theme.colors.background.primary,
    borderTopWidth: 1,
    borderTopColor: theme.colors.background.tertiary,
    height: 88,
    paddingBottom: 30,
    paddingTop: 12,
    elevation: 0,
    shadowOpacity: 0,
  },
  tabBarLabel: {
    fontFamily: theme.typography.families.semibold,
    fontSize: 12,
    marginTop: 4,
  },
  tabBarIcon: {
    marginBottom: 2,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.background.primary,
  },
  errorText: {
    fontSize: 16,
    fontFamily: theme.typography.families.regular,
    color: theme.colors.status.error,
  },
});