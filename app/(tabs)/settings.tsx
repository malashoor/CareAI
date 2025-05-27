import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Switch, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { User, Heart, Bell, Shield, Brain, ChevronRight, LogOut } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '@/hooks/useAuth';

interface SettingsState {
  voiceNotifications: boolean;
  medicationReminders: boolean;
  privacySettings: boolean;
}

const settingSections = [
  {
    id: 'profile',
    title: 'Profile',
    icon: User,
    color: ['#007AFF', '#0055FF'],
    items: [
      {
        id: 'personal',
        title: 'Personal Information',
        subtitle: 'Update your details',
        type: 'link',
        route: '/settings/personal-info',
      },
      {
        id: 'health',
        title: 'Health Profile',
        subtitle: 'Medical history and conditions',
        type: 'link',
        route: '/settings/health-profile',
      },
    ],
  },
  {
    id: 'preferences',
    title: 'Preferences',
    icon: Heart,
    color: ['#FF2D55', '#FF0066'],
    items: [
      {
        id: 'notifications',
        title: 'Voice Notifications',
        type: 'toggle',
        key: 'voiceNotifications',
      },
      {
        id: 'reminders',
        title: 'Medication Reminders',
        type: 'toggle',
        key: 'medicationReminders',
      },
    ],
  },
  {
    id: 'assistance',
    title: 'AI Assistance',
    icon: Brain,
    color: ['#34C759', '#32D74B'],
    items: [
      {
        id: 'voice',
        title: 'Voice Recognition',
        subtitle: 'Customize voice settings',
        type: 'link',
        route: '/settings/voice-settings',
      },
      {
        id: 'learning',
        title: 'Learning Preferences',
        subtitle: 'How AI adapts to you',
        type: 'link',
        route: '/settings/learning-preferences',
      },
    ],
  },
  {
    id: 'security',
    title: 'Security',
    icon: Shield,
    color: ['#5856D6', '#5E5CE6'],
    items: [
      {
        id: 'emergency',
        title: 'Emergency Contacts',
        subtitle: 'Manage your contacts',
        type: 'link',
        route: '/settings/emergency-contacts',
      },
      {
        id: 'privacy',
        title: 'Privacy Settings',
        type: 'toggle',
        key: 'privacySettings',
      },
    ],
  },
];

export default function SettingsScreen() {
  const router = useRouter();
  const { user, signOut } = useAuth();
  const [settings, setSettings] = useState<SettingsState>({
    voiceNotifications: true,
    medicationReminders: true,
    privacySettings: true,
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const savedSettings = await AsyncStorage.getItem('userSettings');
      if (savedSettings) {
        setSettings(JSON.parse(savedSettings));
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  };

  const saveSettings = async (newSettings: SettingsState) => {
    try {
      await AsyncStorage.setItem('userSettings', JSON.stringify(newSettings));
      setSettings(newSettings);
    } catch (error) {
      console.error('Error saving settings:', error);
      Alert.alert('Error', 'Failed to save settings. Please try again.');
    }
  };

  const handleToggleChange = (key: keyof SettingsState, value: boolean) => {
    const newSettings = { ...settings, [key]: value };
    saveSettings(newSettings);
  };

  const handleNavigation = (route: string) => {
    // For now, show alert that these screens will be implemented
    Alert.alert(
      'Coming Soon',
      `The ${route.split('/').pop()?.replace('-', ' ')} screen will be available in the next update.`,
      [{ text: 'OK' }]
    );
  };

  const handleEditProfile = () => {
    Alert.alert(
      'Edit Profile',
      'Profile editing functionality will be available soon.',
      [{ text: 'OK' }]
    );
  };

  const handleLogout = () => {
    Alert.alert(
      'Confirm Logout',
      'Are you sure you want to log out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            setLoading(true);
            try {
              await signOut();
              router.replace('/welcome');
            } catch (error) {
              console.error('Logout error:', error);
              Alert.alert('Error', 'Failed to logout. Please try again.');
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.profile}>
          <Image
            source={{ 
              uri: user?.avatar_url || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=200&auto=format&fit=crop'
            }}
            style={styles.avatar}
          />
          <View style={styles.profileInfo}>
            <Text style={styles.name}>{user?.full_name || 'User Name'}</Text>
            <Text style={styles.email}>{user?.email || 'user@example.com'}</Text>
          </View>
          <TouchableOpacity style={styles.editButton} onPress={handleEditProfile}>
            <LinearGradient
              colors={['#E3F2FF', '#C7E5FF']}
              style={styles.editGradient}>
              <Text style={styles.editText}>Edit</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.content}>
        {settingSections.map((section) => (
          <View key={section.id} style={styles.section}>
            <View style={styles.sectionHeader}>
              <LinearGradient
                colors={section.color}
                style={styles.iconContainer}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}>
                <section.icon color="#FFF" size={24} />
              </LinearGradient>
              <Text style={styles.sectionTitle}>{section.title}</Text>
            </View>

            {section.items.map((item) => (
              <TouchableOpacity
                key={item.id}
                style={styles.settingItem}
                onPress={() => {
                  if (item.type === 'link' && item.route) {
                    handleNavigation(item.route);
                  }
                }}
                disabled={item.type === 'toggle'}>
                <View style={styles.settingContent}>
                  <Text style={styles.settingTitle}>{item.title}</Text>
                  {item.subtitle && (
                    <Text style={styles.settingSubtitle}>{item.subtitle}</Text>
                  )}
                </View>

                {item.type === 'toggle' && item.key ? (
                  <Switch
                    value={settings[item.key as keyof SettingsState]}
                    onValueChange={(value) => handleToggleChange(item.key as keyof SettingsState, value)}
                    trackColor={{ false: '#D1D1D6', true: '#34C759' }}
                    ios_backgroundColor="#D1D1D6"
                  />
                ) : (
                  <ChevronRight color="#C7C7CC" size={24} />
                )}
              </TouchableOpacity>
            ))}
          </View>
        ))}

        <TouchableOpacity 
          style={styles.logoutButton} 
          onPress={handleLogout}
          disabled={loading}>
          <LinearGradient
            colors={['#FF3B30', '#FF2D55']}
            style={styles.logoutGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}>
            <LogOut color="#FFF" size={24} />
            <Text style={styles.logoutText}>
              {loading ? 'Logging Out...' : 'Log Out'}
            </Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#EBF8FF',
  },
  header: {
    padding: 20,
    paddingTop: 60,
  },
  profile: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  profileInfo: {
    flex: 1,
    marginLeft: 16,
  },
  name: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    color: '#1E3A8A',
  },
  email: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#64748B',
    marginTop: 4,
  },
  editButton: {
    borderRadius: 20,
    overflow: 'hidden',
  },
  editGradient: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  editText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#1E3A8A',
  },
  content: {
    padding: 20,
  },
  section: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    marginBottom: 20,
    overflow: 'hidden',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  sectionTitle: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    color: '#1E3A8A',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  settingContent: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#1E3A8A',
  },
  settingSubtitle: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#64748B',
    marginTop: 4,
  },
  logoutButton: {
    borderRadius: 16,
    overflow: 'hidden',
    marginTop: 20,
  },
  logoutGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  logoutText: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
    marginLeft: 12,
  },
});