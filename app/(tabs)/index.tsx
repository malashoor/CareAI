import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import {
  Heart,
  Brain,
  Shield,
  Calendar,
  MessageSquare,
  Users,
  Activity,
  Bell,
  Stethoscope
} from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '@/hooks/useAuth';
import { useFeatureAccess } from '../../hooks/useFeatureAccess';

interface QuickAction {
  id: string;
  title: string;
  description: string;
  icon: any;
  color: string[];
  feature: string;
  route: string;
}

const allQuickActions: QuickAction[] = [
  {
    id: 'health',
    title: 'Health Monitoring',
    description: 'Track vital signs and wellness metrics',
    icon: Heart,
    color: ['#FF2D55', '#FF0066'],
    feature: 'health_monitoring',
    route: '/health'
  },
  {
    id: 'cognitive',
    title: 'Mind Exercises',
    description: 'Keep your mind sharp and active',
    icon: Brain,
    color: ['#5856D6', '#5E5CE6'],
    feature: 'cognitive_support',
    route: '/cognitive'
  },
  {
    id: 'safety',
    title: 'Safety Monitoring',
    description: 'Fall detection and emergency alerts',
    icon: Shield,
    color: ['#FF9500', '#FF7F00'],
    feature: 'fall_detection',
    route: '/monitoring'
  },
  {
    id: 'family',
    title: 'Family Monitoring',
    description: 'Monitor your loved one\'s health',
    icon: Users,
    color: ['#34C759', '#32D74B'],
    feature: 'family_monitoring',
    route: '/monitoring'
  },
  {
    id: 'appointments',
    title: 'Appointments',
    description: 'Schedule and manage consultations',
    icon: Calendar,
    color: ['#007AFF', '#0055FF'],
    feature: 'appointment_scheduling',
    route: '/appointments'
  },
  {
    id: 'messages',
    title: 'Voice Messages',
    description: 'Send and receive voice messages',
    icon: MessageSquare,
    color: ['#64D2FF', '#5AC8FF'],
    feature: 'voice_messaging',
    route: '/chat'
  }
];

export default function HomeScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { hasAccess } = useFeatureAccess();
  const [greeting, setGreeting] = useState('');

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Good Morning');
    else if (hour < 18) setGreeting('Good Afternoon');
    else setGreeting('Good Evening');
  }, []);

  const quickActions = allQuickActions.filter(action => 
    hasAccess(action.feature as any)
  );

  const getWelcomeMessage = () => {
    switch (user?.role) {
      case 'senior':
        return 'Track your health and stay connected with your family';
      case 'child':
        return 'Monitor and support your loved one\'s well-being';
      case 'medical':
        return 'Manage patient care and consultations';
      default:
        return '';
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Image
          source={{ uri: user?.avatar_url || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=200&auto=format&fit=crop' }}
          style={styles.avatar}
        />
        <View style={styles.welcomeContainer}>
          <Text style={styles.greeting}>{greeting}</Text>
          <Text style={styles.name}>{user?.name}</Text>
        </View>
      </View>

      <View style={styles.welcomeCard}>
        <LinearGradient
          colors={['#007AFF', '#0055FF']}
          style={styles.welcomeGradient}>
          <Text style={styles.welcomeTitle}>Welcome to CareAI</Text>
          <Text style={styles.welcomeText}>{getWelcomeMessage()}</Text>
        </LinearGradient>
      </View>

      <View style={styles.quickActions}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.actionGrid}>
          {quickActions.map((action) => (
            <TouchableOpacity
              key={action.id}
              style={styles.actionCard}
              onPress={() => router.push(action.route)}>
              <LinearGradient
                colors={action.color}
                style={styles.actionGradient}>
                <action.icon color="#FFF" size={24} />
                <Text style={styles.actionTitle}>{action.title}</Text>
                <Text style={styles.actionDescription}>{action.description}</Text>
              </LinearGradient>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {hasAccess('health_monitoring') && (
        <View style={styles.statsSection}>
          <Text style={styles.sectionTitle}>Health Overview</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <Activity color="#34C759" size={24} />
              <Text style={styles.statValue}>72</Text>
              <Text style={styles.statLabel}>Heart Rate</Text>
            </View>
            <View style={styles.statCard}>
              <Bell color="#FF9500" size={24} />
              <Text style={styles.statValue}>120/80</Text>
              <Text style={styles.statLabel}>Blood Pressure</Text>
            </View>
            <View style={styles.statCard}>
              <Stethoscope color="#5856D6" size={24} />
              <Text style={styles.statValue}>98%</Text>
              <Text style={styles.statLabel}>Oxygen</Text>
            </View>
          </View>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 24,
    paddingTop: 60,
    backgroundColor: '#FFFFFF',
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  welcomeContainer: {
    marginLeft: 16,
  },
  greeting: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#666666',
  },
  name: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    color: '#000000',
    marginTop: 4,
  },
  welcomeCard: {
    margin: 16,
    borderRadius: 16,
    overflow: 'hidden',
  },
  welcomeGradient: {
    padding: 24,
  },
  welcomeTitle: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  welcomeText: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#FFFFFF',
    opacity: 0.9,
  },
  quickActions: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    color: '#000000',
    marginBottom: 16,
  },
  actionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  actionCard: {
    width: '47%',
    borderRadius: 16,
    overflow: 'hidden',
  },
  actionGradient: {
    padding: 20,
    height: 160,
  },
  actionTitle: {
    fontSize: 16,
    fontFamily: 'Inter-Bold',
    color: '#FFFFFF',
    marginTop: 12,
    marginBottom: 8,
  },
  actionDescription: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#FFFFFF',
    opacity: 0.9,
  },
  statsSection: {
    padding: 16,
    backgroundColor: '#FFFFFF',
    marginTop: 8,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#F8F8F8',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    color: '#000000',
    marginTop: 12,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#666666',
  },
});