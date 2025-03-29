import { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform
} from 'react-native';
import { useRouter } from 'expo-router';
import {
  AlertTriangle,
  MapPin,
  Phone,
  Clock,
  Shield,
  Volume2 as VolumeUp,
  Power
} from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Speech from 'expo-speech';
import { useAuth } from '@/hooks/useAuth';
import { useFallDetection } from '@/hooks/useFallDetection';

export default function MonitoringScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const {
    events,
    monitoring,
    startMonitoring,
    stopMonitoring,
    criticalEvents
  } = useFallDetection(user?.id!);

  useEffect(() => {
    if (criticalEvents.length > 0 && Platform.OS !== 'web') {
      Speech.speak(
        'Warning: Active fall events detected. Please check the alerts.',
        { rate: 0.8, pitch: 1.0 }
      );
    }
  }, [criticalEvents]);

  const speakEventDetails = (event: any) => {
    if (Platform.OS !== 'web') {
      Speech.speak(
        `Fall detected on ${new Date(event.detected_at).toLocaleDateString()} at ${new Date(event.detected_at).toLocaleTimeString()}. Severity: ${event.severity}. Status: ${event.response_status}.`,
        { rate: 0.8, pitch: 1.0 }
      );
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Fall Detection</Text>
        <TouchableOpacity
          style={styles.monitoringButton}
          onPress={() => monitoring ? stopMonitoring() : startMonitoring()}>
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

      {criticalEvents.length > 0 && (
        <View style={styles.alertsSection}>
          <Text style={styles.alertsTitle}>Active Alerts</Text>
          {criticalEvents.map((event) => (
            <TouchableOpacity
              key={event.id}
              style={styles.criticalAlert}
              onPress={() => router.push(`/monitoring/fall-details?id=${event.id}`)}>
              <LinearGradient
                colors={['#FF3B30', '#FF2D55']}
                style={styles.alertGradient}>
                <View style={styles.alertHeader}>
                  <AlertTriangle color="#FFF" size={24} />
                  <Text style={styles.alertTitle}>Fall Detected</Text>
                  <TouchableOpacity
                    onPress={() => speakEventDetails(event)}
                    style={styles.speakButton}>
                    <VolumeUp color="#FFF" size={20} />
                  </TouchableOpacity>
                </View>

                <View style={styles.alertDetails}>
                  <View style={styles.alertRow}>
                    <Clock color="#FFF" size={16} />
                    <Text style={styles.alertText}>
                      {new Date(event.detected_at).toLocaleString()}
                    </Text>
                  </View>

                  {event.location && (
                    <View style={styles.alertRow}>
                      <MapPin color="#FFF" size={16} />
                      <Text style={styles.alertText}>
                        Location available
                      </Text>
                    </View>
                  )}
                </View>

                <View style={styles.alertActions}>
                  <TouchableOpacity style={styles.actionButton}>
                    <Phone color="#FFF" size={20} />
                    <Text style={styles.actionText}>Call Emergency</Text>
                  </TouchableOpacity>
                </View>
              </LinearGradient>
            </TouchableOpacity>
          ))}
        </View>
      )}

      <View style={styles.statusSection}>
        <Text style={styles.sectionTitle}>Monitoring Status</Text>
        <View style={styles.statusCard}>
          <Shield color="#34C759" size={32} />
          <Text style={styles.statusText}>
            {monitoring
              ? 'Fall detection is active and monitoring your movements'
              : 'Fall detection is currently inactive'}
          </Text>
        </View>
      </View>

      <View style={styles.historySection}>
        <Text style={styles.sectionTitle}>Recent Events</Text>
        {events.map((event) => (
          <TouchableOpacity
            key={event.id}
            style={styles.eventCard}
            onPress={() => router.push(`/monitoring/fall-details?id=${event.id}`)}>
            <View style={styles.eventInfo}>
              <View style={styles.eventHeader}>
                <Text style={styles.eventTitle}>Fall Detected</Text>
                <View style={[
                  styles.severityBadge,
                  { backgroundColor: event.severity === 'high' ? '#FFE5E5' : '#FFF9F0' }
                ]}>
                  <Text style={[
                    styles.severityText,
                    { color: event.severity === 'high' ? '#FF3B30' : '#FF9500' }
                  ]}>
                    {event.severity.toUpperCase()}
                  </Text>
                </View>
              </View>

              <View style={styles.eventDetails}>
                <View style={styles.detailRow}>
                  <Clock color="#666666" size={16} />
                  <Text style={styles.detailText}>
                    {new Date(event.detected_at).toLocaleString()}
                  </Text>
                </View>

                <View style={styles.detailRow}>
                  <Shield color="#666666" size={16} />
                  <Text style={styles.detailText}>
                    Status: {event.response_status}
                  </Text>
                </View>
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </View>
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
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 24,
    paddingTop: 60,
    backgroundColor: '#FFFFFF',
  },
  title: {
    fontSize: 32,
    fontFamily: 'Inter-Bold',
    color: '#000000',
  },
  monitoringButton: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  monitoringGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  monitoringText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
    marginLeft: 8,
  },
  alertsSection: {
    padding: 16,
    backgroundColor: '#FFFFFF',
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
  alertText: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#FFFFFF',
    marginLeft: 8,
  },
  alertActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
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
    marginTop: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    color: '#000000',
    marginBottom: 16,
  },
  statusCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F8F8',
    padding: 16,
    borderRadius: 16,
  },
  statusText: {
    flex: 1,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#000000',
    marginLeft: 12,
  },
  historySection: {
    padding: 16,
    backgroundColor: '#FFFFFF',
    marginTop: 16,
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
  eventHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
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
    marginLeft: 8,
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
  detailText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#666666',
    marginLeft: 8,
  },
});