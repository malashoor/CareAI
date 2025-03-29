import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Switch } from 'react-native';
import { User, Heart, Bell, Shield, Brain, ChevronRight, LogOut } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';

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
      },
      {
        id: 'health',
        title: 'Health Profile',
        subtitle: 'Medical history and conditions',
        type: 'link',
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
        value: true,
      },
      {
        id: 'reminders',
        title: 'Medication Reminders',
        type: 'toggle',
        value: true,
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
      },
      {
        id: 'learning',
        title: 'Learning Preferences',
        subtitle: 'How AI adapts to you',
        type: 'link',
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
      },
      {
        id: 'privacy',
        title: 'Privacy Settings',
        type: 'toggle',
        value: true,
      },
    ],
  },
];

export default function SettingsScreen() {
  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.profile}>
          <Image
            source={{ uri: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=200&auto=format&fit=crop' }}
            style={styles.avatar}
          />
          <View style={styles.profileInfo}>
            <Text style={styles.name}>Sarah Johnson</Text>
            <Text style={styles.email}>sarah.j@example.com</Text>
          </View>
          <TouchableOpacity style={styles.editButton}>
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
                onPress={() => {}}>
                <View style={styles.settingContent}>
                  <Text style={styles.settingTitle}>{item.title}</Text>
                  {item.subtitle && (
                    <Text style={styles.settingSubtitle}>{item.subtitle}</Text>
                  )}
                </View>

                {item.type === 'toggle' ? (
                  <Switch
                    value={item.value}
                    onValueChange={() => {}}
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

        <TouchableOpacity style={styles.logoutButton}>
          <LinearGradient
            colors={['#FF3B30', '#FF2D55']}
            style={styles.logoutGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}>
            <LogOut color="#FFF" size={24} />
            <Text style={styles.logoutText}>Log Out</Text>
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