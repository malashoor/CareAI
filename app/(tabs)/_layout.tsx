import { useEffect } from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
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
import { useTabConfig, validateTabConfig } from '@/hooks/useTabConfig';
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
  const { tabs, loading: tabsLoading, error, usingFallback, retry, debug } = useTabConfig();

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

  useEffect(() => {
    // Debug tab configuration
    if (tabs.length > 0) {
      const validationErrors = validateTabConfig(tabs);
      if (validationErrors.length > 0) {
        console.warn('⚠️ Tab configuration issues:', validationErrors);
      }
      
      console.log('📋 Tab Layout Debug:', {
        ...debug,
        usingFallback,
        validationErrors,
        hasError: !!error
      });
    }
  }, [tabs, debug, usingFallback, error]);

  if (authLoading || tabsLoading || !user) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  // Validate user role
  if (!['senior', 'child', 'medical'].includes(user.role)) {
    console.error('Invalid user role:', user.role);
    router.replace('/welcome/role-selection');
    return null;
  }

  // If no tabs available for role, show error with retry option
  if (tabs.length === 0) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorTitle}>No Navigation Available</Text>
        <Text style={styles.errorText}>
          {error || `No tabs configured for role: ${user.role}`}
        </Text>
        <TouchableOpacity style={styles.retryButton} onPress={retry}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Show error notification if using fallback
  if (error && usingFallback) {
    console.warn('🔄 Using fallback configuration due to error:', error);
  }

  return (
    <View style={styles.container}>
      {/* Show fallback notification banner */}
      {usingFallback && (
        <View style={styles.fallbackBanner}>
          <Text style={styles.fallbackText}>
            Using offline configuration
          </Text>
        </View>
      )}
      
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarStyle: [
            styles.tabBar,
            usingFallback && styles.tabBarFallback
          ],
          tabBarActiveTintColor: theme.colors.primary.default,
          tabBarInactiveTintColor: theme.colors.text.light,
          tabBarLabelStyle: styles.tabBarLabel,
          tabBarIconStyle: styles.tabBarIcon,
        }}>
        {tabs.map((tab) => {
          const Icon = icons[tab.icon];
          if (!Icon) {
            console.error(`❌ Icon not found for tab: ${tab.icon}`);
            // Return a placeholder tab with default icon
            return (
              <Tabs.Screen
                key={tab.name}
                name={tab.name}
                options={{
                  title: tab.title,
                  tabBarIcon: ({ color }) => <Settings size={24} color={color} />
                }}
              />
            );
          }

          return (
            <Tabs.Screen
              key={tab.name}
              name={tab.name}
              options={{
                title: tab.title,
                tabBarIcon: ({ color }) => <Icon size={24} color={color} />,
                tabBarAccessibilityLabel: `${tab.title} tab`,
              }}
            />
          );
        })}
      </Tabs>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.background.primary,
  },
  loadingText: {
    fontSize: 16,
    fontFamily: theme.typography.families.regular,
    color: theme.colors.text.primary,
  },
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
  tabBarFallback: {
    borderTopColor: theme.colors.status.warning,
    borderTopWidth: 2,
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
    padding: 20,
  },
  errorTitle: {
    fontSize: 20,
    fontFamily: theme.typography.families.bold,
    color: theme.colors.status.error,
    marginBottom: 12,
    textAlign: 'center',
  },
  errorText: {
    fontSize: 16,
    fontFamily: theme.typography.families.regular,
    color: theme.colors.text.secondary,
    marginBottom: 24,
    textAlign: 'center',
    lineHeight: 24,
  },
  retryButton: {
    backgroundColor: theme.colors.primary.default,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    fontSize: 16,
    fontFamily: theme.typography.families.semibold,
    color: theme.colors.text.white,
  },
  fallbackBanner: {
    backgroundColor: theme.colors.status.warning,
    paddingVertical: 8,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  fallbackText: {
    fontSize: 12,
    fontFamily: theme.typography.families.medium,
    color: theme.colors.text.white,
  },
});