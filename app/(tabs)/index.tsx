import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import * as Speech from 'expo-speech';
import {
  Activity,
  Bell,
  Brain,
  Calendar,
  Heart,
  MessageSquare,
  Pill,
  Shield,
  Stethoscope,
  Users,
  Volume2
} from 'lucide-react-native';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Image, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useFeatureAccess } from '../../hooks/useFeatureAccess';
import { useAuth } from '../hooks/useAuth';
import { useLanguage } from '../hooks/useLanguage';
import { useOfflineStorage } from '../hooks/useOfflineStorage';
import { supabase } from '../lib/supabase';

interface QuickAction {
  id: string;
  title: string;
  description: string;
  icon: any;
  color: string[];
  feature: string;
  route: string;
}

interface HealthStat {
  icon: any;
  value: string;
  label: string;
  color: string;
  normalRange?: string;
  lastUpdated?: string;
}

const allQuickActions: QuickAction[] = [
  {
    id: 'health',
    title: 'Health Monitoring',
    description: 'Track vital signs and wellness metrics',
    icon: Heart,
    color: ['#FF2D55', '#FF0066'],
    feature: 'health_monitoring',
    route: '/(tabs)/health'
  },
  {
    id: 'cognitive',
    title: 'Mind Exercises',
    description: 'Keep your mind sharp and active',
    icon: Brain,
    color: ['#5856D6', '#5E5CE6'],
    feature: 'cognitive_support',
    route: '/(tabs)/cognitive'
  },
  {
    id: 'safety',
    title: 'Safety Monitoring',
    description: 'Fall detection and emergency alerts',
    icon: Shield,
    color: ['#FF9500', '#FF7F00'],
    feature: 'fall_detection',
    route: '/(tabs)/monitoring'
  },
  {
    id: 'family',
    title: 'Family Monitoring',
    description: 'Monitor your loved one\'s health',
    icon: Users,
    color: ['#34C759', '#32D74B'],
    feature: 'family_monitoring',
    route: '/(tabs)/monitoring'
  },
  {
    id: 'appointments',
    title: 'Appointments',
    description: 'Schedule and manage consultations',
    icon: Calendar,
    color: ['#007AFF', '#0055FF'],
    feature: 'appointment_scheduling',
    route: '/(tabs)/appointments'
  },
  {
    id: 'messages',
    title: 'Voice Messages',
    description: 'Send and receive voice messages',
    icon: MessageSquare,
    color: ['#64D2FF', '#5AC8FF'],
    feature: 'voice_messaging',
    route: '/(tabs)/chat'
  },
  {
    id: 'medications',
    title: 'Medications',
    description: 'Manage your medications and reminders',
    icon: Pill,
    color: ['#AF52DE', '#FF3B30'],
    feature: 'medication_management',
    route: '/(tabs)/medications'
  }
];

export default function HomeScreen() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const { hasAccess } = useFeatureAccess();
  const { t, isRTL } = useLanguage();
  const { isOnline } = useOfflineStorage();
  
  const [greeting, setGreeting] = useState('');
  const [healthStats, setHealthStats] = useState<HealthStat[]>([]);
  const [loadingHealth, setLoadingHealth] = useState(true);
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);

  // Set greeting based on time of day
  useEffect(() => {
    const updateGreeting = () => {
      const hour = new Date().getHours();
      if (hour < 12) setGreeting(t('greeting') || 'Good Morning');
      else if (hour < 18) setGreeting('Good Afternoon');
      else setGreeting('Good Evening');
    };

    updateGreeting();
    const interval = setInterval(updateGreeting, 60000); // Update every minute
    return () => clearInterval(interval);
  }, [t]);

  // Load health statistics
  useEffect(() => {
    if (user && hasAccess('health_monitoring')) {
      loadHealthStats();
    } else {
      setLoadingHealth(false);
    }
  }, [user, hasAccess]);

  const loadHealthStats = async () => {
    if (!user) return;

    try {
      setLoadingHealth(true);
      
      // Get today's date for filtering
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      // Fetch health metrics from Supabase
      const { data: healthMetrics, error } = await supabase
        .from('health_metrics')
        .select('*')
        .eq('user_id', user.id)
        .gte('recorded_at', today.toISOString())
        .order('recorded_at', { ascending: false });

      // if (error && error.code !== 'PGRST116') { // PGRST116 is "no rows returned"
      //   console.error('Error fetching health metrics:', error);
      // }

      // Process health metrics into stats
      const stats: HealthStat[] = [];
      
      if (healthMetrics && healthMetrics.length > 0) {
        // Get latest heart rate
        const heartRate = healthMetrics.find(m => m.metric_type === 'heart_rate');
        if (heartRate) {
          stats.push({
            icon: Activity,
            value: heartRate.value.toString(),
            label: 'Heart Rate (bpm)',
            color: '#34C759',
            normalRange: '60-100',
            lastUpdated: heartRate.recorded_at
          });
        }

        // Get latest blood pressure
        const bloodPressure = healthMetrics.find(m => m.metric_type === 'blood_pressure');
        if (bloodPressure) {
          // Assuming systolic/diastolic are stored as separate metrics or in metadata
          stats.push({
            icon: Bell,
            value: `${bloodPressure.value}/80`,
            label: 'Blood Pressure',
            color: '#FF9500',
            normalRange: '<140/90',
            lastUpdated: bloodPressure.recorded_at
          });
        }

        // Get latest oxygen saturation
        const oxygen = healthMetrics.find(m => m.metric_type === 'oxygen_saturation');
        if (oxygen) {
          stats.push({
            icon: Stethoscope,
            value: `${oxygen.value}%`,
            label: 'Oxygen Saturation',
            color: '#5856D6',
            normalRange: '95-100%',
            lastUpdated: oxygen.recorded_at
          });
        }
      }

      // If no real data, show mock data for demo
      if (stats.length === 0) {
        stats.push(
          {
            icon: Activity,
            value: '72',
            label: 'Heart Rate (bpm)',
            color: '#34C759',
            normalRange: '60-100',
            lastUpdated: new Date().toISOString()
          },
          {
            icon: Bell,
            value: '120/80',
            label: 'Blood Pressure',
            color: '#FF9500',
            normalRange: '<140/90',
            lastUpdated: new Date().toISOString()
          },
          {
            icon: Stethoscope,
            value: '98%',
            label: 'Oxygen Saturation',
            color: '#5856D6',
            normalRange: '95-100%',
            lastUpdated: new Date().toISOString()
          }
        );
      }

      setHealthStats(stats);
      setLastSyncTime(new Date());
    } catch (error) {
      console.error('Error loading health stats:', error);
      Alert.alert('Error', 'Failed to load health statistics');
    } finally {
      setLoadingHealth(false);
    }
  };

  const quickActions = allQuickActions.filter(action => 
    hasAccess(action.feature as any)
  );

  const getWelcomeMessage = () => {
    if (!user) return '';
    
    switch (user.role) {
      case 'senior':
        return 'Track your health and stay connected with your family';
      case 'child':
        return 'Monitor and support your loved one\'s well-being';
      case 'medical':
        return 'Manage patient care and consultations';
      default:
        return 'Welcome to your personalized health companion';
    }
  };

  const speakText = async (text: string) => {
    if (Platform.OS !== 'web') {
      try {
        await Speech.speak(text, {
          rate: 0.8,
          pitch: 1.0,
          language: isRTL ? 'ar' : 'en'
        });
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      } catch (error) {
        console.error('Error speaking text:', error);
      }
    }
  };

  const handleActionPress = async (action: QuickAction) => {
    await speakText(`Opening ${action.title}`);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    
    try {
      router.push(action.route as any);
    } catch (error) {
      console.error('Navigation error:', error);
      Alert.alert('Navigation Error', 'Failed to open this feature');
    }
  };

  const handleRefreshStats = async () => {
    if (!isOnline) {
      Alert.alert('Offline', 'Please check your internet connection to sync health data');
      return;
    }
    
    await speakText('Refreshing health statistics');
    await loadHealthStats();
  };

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffInMinutes = Math.floor((now.getTime() - time.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  if (authLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Loading your health dashboard...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={[styles.container, isRTL && styles.rtlContainer]}>
      {/* Header Section */}
      <View style={[styles.header, isRTL && styles.headerRTL]}>
        <TouchableOpacity
          onPress={() => speakText(`${greeting} ${user?.name || 'User'}`)}
          style={styles.avatarContainer}
          accessibilityRole="button"
          accessibilityLabel="Tap to hear greeting">
          <Image
            source={{ 
              uri: user?.avatar_url || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=200&auto=format&fit=crop' 
            }}
            style={styles.avatar}
            defaultSource={{ uri: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=200&auto=format&fit=crop' }}
          />
          <Volume2 
            color="#666666" 
            size={16} 
            style={styles.speakerIcon} 
          />
        </TouchableOpacity>
        <View style={[styles.welcomeContainer, isRTL && styles.welcomeContainerRTL]}>
          <Text style={[styles.greeting, isRTL && styles.rtlText]}>{greeting}</Text>
          <Text style={[styles.name, isRTL && styles.rtlText]}>{user?.name || 'User'}</Text>
          {!isOnline && (
            <Text style={styles.offlineIndicator}>📱 Offline Mode</Text>
          )}
        </View>
      </View>

      {/* Welcome Card */}
      <TouchableOpacity
        style={styles.welcomeCard}
        onPress={() => speakText(getWelcomeMessage())}
        accessibilityRole="button"
        accessibilityLabel="Tap to hear welcome message">
        <LinearGradient
          colors={['#007AFF', '#0055FF']}
          style={styles.welcomeGradient}>
          <Text style={styles.welcomeTitle}>Welcome to CareAI</Text>
          <Text style={styles.welcomeText}>{getWelcomeMessage()}</Text>
        </LinearGradient>
      </TouchableOpacity>

      {/* Quick Actions */}
      <View style={styles.quickActions}>
        <Text style={[styles.sectionTitle, isRTL && styles.rtlText]}>Quick Actions</Text>
        <View style={[styles.actionGrid, isRTL && styles.actionGridRTL]}>
          {quickActions.map((action) => (
            <TouchableOpacity
              key={action.id}
              style={styles.actionCard}
              onPress={() => handleActionPress(action)}
              accessibilityRole="button"
              accessibilityLabel={`${action.title}: ${action.description}`}>
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

      {/* Health Overview */}
      {hasAccess('health_monitoring') && (
        <View style={styles.statsSection}>
          <View style={[styles.statsSectionHeader, isRTL && styles.statsSectionHeaderRTL]}>
            <Text style={[styles.sectionTitle, isRTL && styles.rtlText]}>Health Overview</Text>
            <TouchableOpacity
              onPress={handleRefreshStats}
              style={styles.refreshButton}
              accessibilityRole="button"
              accessibilityLabel="Refresh health statistics">
              <Activity 
                color="#007AFF" 
                size={20} 
                style={loadingHealth ? styles.spinning : undefined} 
              />
            </TouchableOpacity>
          </View>
          
          {loadingHealth ? (
            <View style={styles.statsLoading}>
              <ActivityIndicator size="small" color="#666666" />
              <Text style={styles.statsLoadingText}>Loading health data...</Text>
            </View>
          ) : (
            <>
              <View style={[styles.statsGrid, isRTL && styles.statsGridRTL]}>
                {healthStats.map((stat, index) => (
                  <TouchableOpacity
                    key={index}
                    style={styles.statCard}
                    onPress={() => speakText(`${stat.label}: ${stat.value}`)}
                    accessibilityRole="button"
                    accessibilityLabel={`${stat.label}: ${stat.value}. Normal range: ${stat.normalRange}`}>
                    <stat.icon color={stat.color} size={24} />
                    <Text style={styles.statValue}>{stat.value}</Text>
                    <Text style={styles.statLabel}>{stat.label}</Text>
                    {stat.normalRange && (
                      <Text style={styles.statRange}>Normal: {stat.normalRange}</Text>
                    )}
                    {stat.lastUpdated && (
                      <Text style={styles.statTime}>{formatTimeAgo(stat.lastUpdated)}</Text>
                    )}
                  </TouchableOpacity>
                ))}
              </View>
              
              {lastSyncTime && (
                <Text style={[styles.lastSync, isRTL && styles.rtlText]}>
                  Last synced: {lastSyncTime.toLocaleTimeString()}
                </Text>
              )}
            </>
          )}
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
  rtlContainer: {
    direction: 'rtl',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F2F2F7',
  },
  loadingText: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#666666',
    marginTop: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 24,
    paddingTop: 60,
    backgroundColor: '#FFFFFF',
  },
  headerRTL: {
    flexDirection: 'row-reverse',
  },
  avatarContainer: {
    position: 'relative',
    alignItems: 'center',
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  speakerIcon: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 2,
  },
  welcomeContainer: {
    marginLeft: 16,
    flex: 1,
  },
  welcomeContainerRTL: {
    marginLeft: 0,
    marginRight: 16,
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
  rtlText: {
    textAlign: 'right',
  },
  offlineIndicator: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#FF9500',
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
  actionGridRTL: {
    flexDirection: 'row-reverse',
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
  statsSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  statsSectionHeaderRTL: {
    flexDirection: 'row-reverse',
  },
  refreshButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#F8F8F8',
  },
  spinning: {
    transform: [{ rotate: '360deg' }],
  },
  statsLoading: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  statsLoadingText: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#666666',
    marginLeft: 8,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  statsGridRTL: {
    flexDirection: 'row-reverse',
  },
  statCard: {
    flex: 1,
    backgroundColor: '#F8F8F8',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    minHeight: 140,
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
    textAlign: 'center',
  },
  statRange: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#999999',
    marginTop: 4,
    textAlign: 'center',
  },
  statTime: {
    fontSize: 10,
    fontFamily: 'Inter-Regular',
    color: '#999999',
    marginTop: 4,
    textAlign: 'center',
  },
  lastSync: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#999999',
    textAlign: 'center',
    marginTop: 16,
  },
});