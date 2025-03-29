import { useState } from 'react';
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
  Calendar,
  Clock,
  MapPin,
  Plus,
  AlertCircle,
  ChevronRight,
  Volume2 as VolumeUp
} from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Speech from 'expo-speech';
import { useAuth } from '@/hooks/useAuth';
import { useAppointments } from '@/hooks/useAppointments';

export default function AppointmentsScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { appointments, loading } = useAppointments(user?.id!, user?.role === 'medical' ? 'medical' : 'senior');
  const [selectedDate, setSelectedDate] = useState(new Date());

  const speakAppointmentDetails = (appointment: any) => {
    if (Platform.OS === 'web') return;

    const startTime = new Date(appointment.start_time).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit'
    });

    Speech.speak(
      `Appointment for ${appointment.title} at ${startTime}. Location: ${appointment.location.name}`,
      { rate: 0.8, pitch: 1.0 }
    );
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Appointments</Text>
        {user?.role === 'medical' && (
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => router.push('/appointments/book')}>
            <LinearGradient
              colors={['#007AFF', '#0055FF']}
              style={styles.addGradient}>
              <Plus color="#FFF" size={24} />
              <Text style={styles.addText}>Book Appointment</Text>
            </LinearGradient>
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.upcomingSection}>
        <Text style={styles.sectionTitle}>Today's Appointments</Text>
        {appointments
          .filter(apt => {
            const aptDate = new Date(apt.start_time);
            return (
              aptDate.getDate() === selectedDate.getDate() &&
              aptDate.getMonth() === selectedDate.getMonth() &&
              aptDate.getFullYear() === selectedDate.getFullYear() &&
              apt.status === 'scheduled'
            );
          })
          .map(appointment => (
            <TouchableOpacity
              key={appointment.id}
              style={styles.appointmentCard}
              onPress={() => router.push(`/appointments/details?id=${appointment.id}`)}>
              <View style={styles.appointmentHeader}>
                <Text style={styles.appointmentTitle}>{appointment.title}</Text>
                <TouchableOpacity
                  onPress={() => speakAppointmentDetails(appointment)}
                  style={styles.speakButton}>
                  <VolumeUp color="#007AFF" size={24} />
                </TouchableOpacity>
              </View>

              <View style={styles.appointmentDetails}>
                <View style={styles.detailRow}>
                  <Clock color="#666666" size={16} />
                  <Text style={styles.detailText}>
                    {new Date(appointment.start_time).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </Text>
                </View>

                <View style={styles.detailRow}>
                  <MapPin color="#666666" size={16} />
                  <Text style={styles.detailText}>{appointment.location.name}</Text>
                </View>

                {appointment.instructions && (
                  <View style={styles.instructionsBox}>
                    <AlertCircle color="#FF9500" size={16} />
                    <Text style={styles.instructionsText}>{appointment.instructions}</Text>
                  </View>
                )}
              </View>

              <View style={styles.appointmentFooter}>
                {user?.role === 'medical' ? (
                  <Text style={styles.patientName}>
                    Patient: {appointment.senior?.name}
                  </Text>
                ) : (
                  <Text style={styles.doctorName}>
                    Dr. {appointment.professional?.name}
                  </Text>
                )}
                <ChevronRight color="#666666" size={20} />
              </View>
            </TouchableOpacity>
          ))}
      </View>

      <View style={styles.reminderPreferences}>
        <Text style={styles.preferencesTitle}>Reminder Preferences</Text>
        <TouchableOpacity
          style={styles.preferencesButton}
          onPress={() => router.push('/settings')}>
          <Text style={styles.preferencesButtonText}>Customize Notifications</Text>
          <ChevronRight color="#007AFF" size={20} />
        </TouchableOpacity>
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
    padding: 24,
    paddingTop: 60,
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    fontFamily: 'Inter-Bold',
    color: '#000000',
  },
  addButton: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  addGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  addText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
    marginLeft: 8,
  },
  upcomingSection: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    color: '#000000',
    marginBottom: 16,
  },
  appointmentCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  appointmentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  appointmentTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#000000',
  },
  speakButton: {
    padding: 8,
  },
  appointmentDetails: {
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  detailText: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#666666',
    marginLeft: 8,
  },
  instructionsBox: {
    flexDirection: 'row',
    backgroundColor: '#FFF9F0',
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
  },
  instructionsText: {
    flex: 1,
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#FF9500',
    marginLeft: 8,
  },
  appointmentFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E5E5EA',
  },
  patientName: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#000000',
  },
  doctorName: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#000000',
  },
  reminderPreferences: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    marginTop: 16,
  },
  preferencesTitle: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    color: '#000000',
    marginBottom: 12,
  },
  preferencesButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F8F8F8',
    padding: 16,
    borderRadius: 12,
  },
  preferencesButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#007AFF',
  },
});