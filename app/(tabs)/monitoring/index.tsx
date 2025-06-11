import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import * as Speech from 'expo-speech';
import {
  AlertTriangle,
  Clock,
  MapPin,
  Phone,
  Power,
  Settings,
  Shield,
  TestTube,
  TrendingUp,
  Volume2 as VolumeUp,
  Zap
} from 'lucide-react-native';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { useFallDetection } from '../../../hooks/useFallDetection';
import { useAuth } from '../../hooks/useAuth';
import { useLanguage } from '../../hooks/useLanguage';

export default function MonitoringScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { t, isRTL } = useLanguage();
  const {
    events,
    monitoring,
    loading,
    settings,
    startMonitoring,
    stopMonitoring,
    criticalEvents,
    recentEvents,
    todayEvents,
    triggerTestFall,
    toggleMockMode,
    setSensitivity,
    markEventAsResolved
  } = useFallDetection(user?.id!);

  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (criticalEvents.length > 0 && Platform.OS !== 'web') {
      Speech.speak(
        'Warning: Active fall events detected. Please check the alerts.',
        { rate: 0.8, pitch: 1.0 }
      );
    }
  }, [criticalEvents]);

  const speakText = async (text: string) => {
    if (Platform.OS !== 'web') {
      try {
        await Speech.speak(text, {
          rate: 0.8,
          pitch: 1.0,
          language: isRTL ? 'ar' : 'en'
        });
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      } catch (error) {
        console.error('Error speaking text:', error);
      }
    }
  };

  const speakEventDetails = (event: any) => {
    const eventText = `Fall detected on ${new Date(event.detected_at).toLocaleDateString()} at ${new Date(event.detected_at).toLocaleTimeString()}. Severity: ${event.severity}. Status: ${event.response_status}.`;
    speakText(eventText);
  };

  const handleMonitoringToggle = async () => {
    try {
      if (monitoring) {
        await stopMonitoring();
        await speakText('Fall detection monitoring stopped');
      } else {
        await startMonitoring();
        await speakText(settings.mockMode ? 'Fall detection monitoring started in demo mode' : 'Fall detection monitoring started');
      }
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch (error) {
      console.error('Error toggling monitoring:', error);
      Alert.alert('Error', 'Failed to toggle monitoring state');
    }
  };

  const handleTestFall = async () => {
    Alert.alert(
      'Test Fall Detection',
      'This will trigger a test fall event. Are you sure?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Test',
          onPress: async () => {
            try {
              await triggerTestFall();
              await speakText('Test fall event triggered');
              await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
            } catch (error) {
              Alert.alert('Error', 'Failed to trigger test fall');
            }
          }
        }
      ]
    );
  };

  const handleEmergencyCall = async () => {
    Alert.alert(
      'Emergency Call',
      'This would call emergency services in a real emergency. This is a demo.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Call Demo', onPress: () => speakText('Emergency call would be placed now') }
      ]
    );
  };

  const handleMarkResolved = async (eventId: string) => {
    try {
      await markEventAsResolved(eventId);
      await speakText('Event marked as resolved');
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch (error) {
      Alert.alert('Error', 'Failed to mark event as resolved');
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await speakText('Refreshing fall detection data');
    setTimeout(() => setRefreshing(false), 1000);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Loading fall detection...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={[styles.container, isRTL && styles.rtlContainer]}>
      {/* Header */}
      <View style={[styles.header, isRTL && styles.headerRTL]}>
        <View style={[styles.headerContent, isRTL && styles.headerContentRTL]}>
          <Text style={[styles.title, isRTL && styles.rtlText]}>Fall Detection</Text>
          <View style={styles.headerActions}>
            <TouchableOpacity
              onPress={() => speakText('Fall detection monitors your movements and alerts caregivers if a fall is detected. You can test the system or adjust settings.')}
              style={styles.voiceButton}
              accessibilityRole="button"
              accessibilityLabel="Listen to instructions">
              <VolumeUp color="#007AFF" size={20} />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleRefresh}
              style={styles.refreshButton}
              accessibilityRole="button"
              accessibilityLabel="Refresh">
              <TrendingUp color="#007AFF" size={20} style={refreshing ? styles.spinning : undefined} />
            </TouchableOpacity>
          </View>
        </View>
        
        {/* Monitoring Toggle */}
        <TouchableOpacity
          style={styles.monitoringButton}
          onPress={handleMonitoringToggle}
          accessibilityRole="button"
          accessibilityLabel={monitoring ? 'Stop monitoring' : 'Start monitoring'}>
          <LinearGradient
            colors={monitoring ? ['#34C759', '#32D74B'] : ['#FF3B30', '#FF2D55']}
            style={styles.monitoringGradient}>
            <Power color="#FFF" size={24} />
            <Text style={styles.monitoringText}>
              {monitoring ? 'Monitoring Active' : 'Start Monitoring'}
            </Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>

      {/* Status Cards */}
      <View style={styles.statusCards}>
        <TouchableOpacity 
          style={styles.statusCard}
          onPress={() => speakText(`Monitoring is currently ${monitoring ? 'active' : 'inactive'}`)}>
          <Shield color={monitoring ? '#34C759' : '#999999'} size={24} />
          <Text style={styles.statusValue}>{monitoring ? 'Active' : 'Inactive'}</Text>
          <Text style={styles.statusLabel}>Status</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.statusCard}
          onPress={() => speakText(`${todayEvents.length} events detected today`)}>
          <AlertTriangle color="#FF9500" size={24} />
          <Text style={styles.statusValue}>{todayEvents.length}</Text>
          <Text style={styles.statusLabel}>Today</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.statusCard}
          onPress={() => speakText(`${criticalEvents.length} critical alerts requiring attention`)}>
          <Zap color="#FF3B30" size={24} />
          <Text style={styles.statusValue}>{criticalEvents.length}</Text>
          <Text style={styles.statusLabel}>Critical</Text>
        </TouchableOpacity>
      </View>

      {/* Critical Alerts */}
      {criticalEvents.length > 0 && (
        <View style={styles.alertsSection}>
          <Text style={[styles.alertsTitle, isRTL && styles.rtlText]}>🚨 Critical Alerts</Text>
          {criticalEvents.map((event) => (
            <TouchableOpacity
              key={event.id}
              style={styles.criticalAlert}
              onPress={() => router.push(`/monitoring/fall-details?id=${event.id}`)}>
              <LinearGradient
                colors={['#FF3B30', '#FF2D55']}
                style={styles.alertGradient}>
                <View style={[styles.alertHeader, isRTL && styles.alertHeaderRTL]}>
                  <AlertTriangle color="#FFF" size={24} />
                  <Text style={[styles.alertTitle, isRTL && styles.rtlText]}>Fall Detected</Text>
                  <TouchableOpacity
                    onPress={() => speakEventDetails(event)}
                    style={styles.speakButton}
                    accessibilityRole="button"
                    accessibilityLabel="Listen to event details">
                    <VolumeUp color="#FFF" size={20} />
                  </TouchableOpacity>
                </View>

                <View style={styles.alertDetails}>
                  <View style={[styles.alertRow, isRTL && styles.alertRowRTL]}>
                    <Clock color="#FFF" size={16} />
                    <Text style={[styles.alertText, isRTL && styles.rtlText]}>
                      {new Date(event.detected_at).toLocaleString()}
                    </Text>
                  </View>

                  {event.location && (
                    <View style={[styles.alertRow, isRTL && styles.alertRowRTL]}>
                      <MapPin color="#FFF" size={16} />
                      <Text style={[styles.alertText, isRTL && styles.rtlText]}>
                        Location: {event.location.latitude.toFixed(4)}, {event.location.longitude.toFixed(4)}
                      </Text>
                    </View>
                  )}
                </View>

                <View style={[styles.alertActions, isRTL && styles.alertActionsRTL]}>
                  <TouchableOpacity 
                    style={styles.actionButton}
                    onPress={handleEmergencyCall}
                    accessibilityRole="button"
                    accessibilityLabel="Call emergency services">
                    <Phone color="#FFF" size={20} />
                    <Text style={styles.actionText}>Emergency</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={[styles.actionButton, styles.resolveButton]}
                    onPress={() => handleMarkResolved(event.id)}
                    accessibilityRole="button"
                    accessibilityLabel="Mark as resolved">
                    <Shield color="#FFF" size={20} />
                    <Text style={styles.actionText}>I'm OK</Text>
                  </TouchableOpacity>
                </View>
              </LinearGradient>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* System Status */}
      <View style={styles.statusSection}>
        <Text style={[styles.sectionTitle, isRTL && styles.rtlText]}>System Status</Text>
        <View style={styles.statusDetails}>
          <View style={[styles.statusRow, isRTL && styles.statusRowRTL]}>
            <Text style={[styles.statusLabel, isRTL && styles.rtlText]}>Mode:</Text>
            <Text style={[styles.statusValue, isRTL && styles.rtlText]}>
              {settings.mockMode ? 'Demo Mode' : 'Live Detection'}
            </Text>
          </View>
          <View style={[styles.statusRow, isRTL && styles.statusRowRTL]}>
            <Text style={[styles.statusLabel, isRTL && styles.rtlText]}>Sensitivity:</Text>
            <Text style={[styles.statusValue, isRTL && styles.rtlText]}>
              {(settings.sensitivity * 100).toFixed(0)}%
            </Text>
          </View>
          <View style={[styles.statusRow, isRTL && styles.statusRowRTL]}>
            <Text style={[styles.statusLabel, isRTL && styles.rtlText]}>Device:</Text>
            <Text style={[styles.statusValue, isRTL && styles.rtlText]}>
              {Platform.OS === 'ios' ? 'iPhone' : Platform.OS === 'android' ? 'Android' : 'Web'}
            </Text>
          </View>
        </View>
      </View>

      {/* Test & Settings */}
      <View style={styles.controlsSection}>
        <Text style={[styles.sectionTitle, isRTL && styles.rtlText]}>Controls</Text>
        <View style={[styles.controlsGrid, isRTL && styles.controlsGridRTL]}>
          <TouchableOpacity
            style={styles.controlButton}
            onPress={handleTestFall}
            disabled={!monitoring}
            accessibilityRole="button"
            accessibilityLabel="Test fall detection">
            <TestTube color={monitoring ? "#007AFF" : "#CCCCCC"} size={24} />
            <Text style={[
              styles.controlButtonText,
              !monitoring && styles.controlButtonTextDisabled
            ]}>
              Test Fall
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.controlButton}
            onPress={toggleMockMode}
            accessibilityRole="button"
            accessibilityLabel={`Switch to ${settings.mockMode ? 'live' : 'demo'} mode`}>
            <Settings color="#007AFF" size={24} />
            <Text style={styles.controlButtonText}>
              {settings.mockMode ? 'Live Mode' : 'Demo Mode'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Recent Events */}
      <View style={styles.historySection}>
        <Text style={[styles.sectionTitle, isRTL && styles.rtlText]}>Recent Events ({recentEvents.length})</Text>
        {recentEvents.length === 0 ? (
          <View style={styles.emptyState}>
            <Shield color="#CCCCCC" size={48} />
            <Text style={[styles.emptyStateText, isRTL && styles.rtlText]}>
              No fall events detected yet
            </Text>
            {monitoring && settings.mockMode && (
              <Text style={[styles.emptyStateSubtext, isRTL && styles.rtlText]}>
                Demo mode is active - events will be simulated
              </Text>
            )}
          </View>
        ) : (
          recentEvents.map((event) => (
            <TouchableOpacity
              key={event.id}
              style={styles.eventCard}
              onPress={() => router.push(`/monitoring/fall-details?id=${event.id}`)}
              accessibilityRole="button"
              accessibilityLabel={`Fall event from ${new Date(event.detected_at).toLocaleString()}`}>
              <View style={[styles.eventInfo, isRTL && styles.eventInfoRTL]}>
                <View style={[styles.eventHeader, isRTL && styles.eventHeaderRTL]}>
                  <Text style={[styles.eventTitle, isRTL && styles.rtlText]}>Fall Detected</Text>
                  <View style={[
                    styles.severityBadge,
                    { backgroundColor: 
                      event.severity === 'high' ? '#FFE5E5' : 
                      event.severity === 'medium' ? '#FFF3E0' : '#F0F8FF' 
                    }
                  ]}>
                    <Text style={[
                      styles.severityText,
                      { color: 
                        event.severity === 'high' ? '#FF3B30' : 
                        event.severity === 'medium' ? '#FF9500' : '#007AFF' 
                      }
                    ]}>
                      {event.severity.toUpperCase()}
                    </Text>
                  </View>
                </View>

                <View style={styles.eventDetails}>
                  <View style={[styles.detailRow, isRTL && styles.detailRowRTL]}>
                    <Clock color="#666666" size={16} />
                    <Text style={[styles.detailText, isRTL && styles.rtlText]}>
                      {new Date(event.detected_at).toLocaleString()}
                    </Text>
                  </View>

                  <View style={[styles.detailRow, isRTL && styles.detailRowRTL]}>
                    <Shield color="#666666" size={16} />
                    <Text style={[styles.detailText, isRTL && styles.rtlText]}>
                      Status: {event.response_status}
                    </Text>
                  </View>

                  {event.device_data?.mockMode && (
                    <View style={[styles.detailRow, isRTL && styles.detailRowRTL]}>
                      <TestTube color="#999999" size={16} />
                      <Text style={[styles.detailText, styles.demoText, isRTL && styles.rtlText]}>
                        Demo Event
                      </Text>
                    </View>
                  )}
                </View>
              </View>
            </TouchableOpacity>
          ))
        )}
      </View>
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
    padding: 24,
    paddingTop: 60,
    backgroundColor: '#FFFFFF',
  },
  headerRTL: {
    flexDirection: 'column',
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerContentRTL: {
    flexDirection: 'row-reverse',
  },
  title: {
    fontSize: 32,
    fontFamily: 'Inter-Bold',
    color: '#000000',
  },
  rtlText: {
    textAlign: 'right',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  voiceButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#F2F2F7',
  },
  refreshButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#F2F2F7',
  },
  spinning: {
    transform: [{ rotate: '360deg' }],
  },
  monitoringButton: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  monitoringGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  monitoringText: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
    marginLeft: 8,
  },
  statusCards: {
    flexDirection: 'row',
    padding: 16,
    gap: 8,
  },
  statusCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
  },
  statusValue: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    color: '#000000',
    marginTop: 8,
  },
  statusLabel: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#666666',
    marginTop: 4,
  },
  alertsSection: {
    padding: 16,
    backgroundColor: '#FFFFFF',
    marginTop: 8,
  },
  alertsTitle: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    color: '#FF3B30',
    marginBottom: 16,
  },
  criticalAlert: {
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 12,
  },
  alertGradient: {
    padding: 16,
  },
  alertHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  alertHeaderRTL: {
    flexDirection: 'row-reverse',
  },
  alertTitle: {
    flex: 1,
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    color: '#FFFFFF',
    marginLeft: 8,
  },
  speakButton: {
    padding: 8,
  },
  alertDetails: {
    marginBottom: 16,
  },
  alertRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  alertRowRTL: {
    flexDirection: 'row-reverse',
  },
  alertText: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#FFFFFF',
    marginLeft: 8,
  },
  alertActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
  },
  alertActionsRTL: {
    flexDirection: 'row-reverse',
    justifyContent: 'flex-start',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  resolveButton: {
    backgroundColor: 'rgba(52, 199, 89, 0.3)',
  },
  actionText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
    marginLeft: 8,
  },
  statusSection: {
    padding: 16,
    backgroundColor: '#FFFFFF',
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    color: '#000000',
    marginBottom: 16,
  },
  statusDetails: {
    backgroundColor: '#F8F8F8',
    borderRadius: 12,
    padding: 16,
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  statusRowRTL: {
    flexDirection: 'row-reverse',
  },
  controlsSection: {
    padding: 16,
    backgroundColor: '#FFFFFF',
    marginTop: 8,
  },
  controlsGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  controlsGridRTL: {
    flexDirection: 'row-reverse',
  },
  controlButton: {
    flex: 1,
    backgroundColor: '#F8F8F8',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  controlButtonText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#007AFF',
    marginTop: 8,
  },
  controlButtonTextDisabled: {
    color: '#CCCCCC',
  },
  historySection: {
    padding: 16,
    backgroundColor: '#FFFFFF',
    marginTop: 8,
  },
  emptyState: {
    alignItems: 'center',
    padding: 32,
  },
  emptyStateText: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#999999',
    marginTop: 16,
    textAlign: 'center',
  },
  emptyStateSubtext: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#CCCCCC',
    marginTop: 8,
    textAlign: 'center',
  },
  eventCard: {
    backgroundColor: '#F8F8F8',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  eventInfo: {
    flex: 1,
  },
  eventInfoRTL: {
    flexDirection: 'column',
  },
  eventHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  eventHeaderRTL: {
    flexDirection: 'row-reverse',
  },
  eventTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#000000',
  },
  severityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  severityText: {
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
  },
  eventDetails: {
    marginTop: 8,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  detailRowRTL: {
    flexDirection: 'row-reverse',
  },
  detailText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#666666',
    marginLeft: 8,
  },
  demoText: {
    fontStyle: 'italic',
    color: '#999999',
  },
});