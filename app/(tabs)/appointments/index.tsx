import { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
  ActivityIndicator,
  RefreshControl,
  Alert,
  Modal
} from 'react-native';
import { useRouter } from 'expo-router';
import {
  Calendar,
  Clock,
  MapPin,
  Plus,
  AlertCircle,
  ChevronRight,
  Volume2 as VolumeUp,
  Settings,
  Edit,
  Trash2,
  CheckCircle2,
  X
} from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Speech from 'expo-speech';
import * as Haptics from 'expo-haptics';
import { useAuth } from '@/hooks/useAuth';
import { useLanguage } from '@/hooks/useLanguage';
import { useAppointments } from '@/hooks/useAppointments';

export default function AppointmentsScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { t } = useLanguage();
  const { 
    appointments, 
    loading, 
    error,
    updateAppointment,
    cancelAppointment,
    todayAppointments,
    upcomingAppointments
  } = useAppointments(user?.id || '', user?.role === 'medical' ? 'medical' : 'senior');

  const [selectedDate, setSelectedDate] = useState(new Date());
  const [refreshing, setRefreshing] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<any>(null);
  const [showActionModal, setShowActionModal] = useState(false);

  useEffect(() => {
    if (!loading && appointments.length > 0) {
      // Check for upcoming appointments today
      if (todayAppointments.length > 0) {
        const message = `You have ${todayAppointments.length} appointment${
          todayAppointments.length > 1 ? 's' : ''
        } today. Would you like me to read the details?`;
        
        if (Platform.OS !== 'web') {
          Speech.speak(message, { rate: 0.8, pitch: 1.0 });
        }
      }
    }
  }, [loading, todayAppointments]);

  const speakAppointmentDetails = async (appointment: any) => {
    if (Platform.OS === 'web') return;

    const startTime = new Date(appointment.start_time).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit'
    });

    const message = `Appointment for ${appointment.title} at ${startTime}. Location: ${appointment.location.name}. ${appointment.instructions ? 'Instructions: ' + appointment.instructions : ''}`;
    
    try {
      await Speech.speak(message, { rate: 0.8, pitch: 1.0 });
    } catch (error) {
      console.error('Error speaking appointment details:', error);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    // The hook will automatically refresh data through real-time subscriptions
    setTimeout(() => setRefreshing(false), 1000);
  };

  const handleAppointmentAction = (appointment: any, action: 'edit' | 'cancel' | 'details') => {
    setSelectedAppointment(appointment);
    
    switch (action) {
      case 'edit':
        router.push(`/appointments/edit?id=${appointment.id}`);
        break;
      case 'cancel':
        Alert.alert(
          'Cancel Appointment',
          'Are you sure you want to cancel this appointment?',
          [
            { text: 'No', style: 'cancel' },
            { 
              text: 'Yes, Cancel', 
              style: 'destructive',
              onPress: () => handleCancelAppointment(appointment.id)
            }
          ]
        );
        break;
      case 'details':
        setShowActionModal(true);
        break;
    }
  };

  const handleCancelAppointment = async (appointmentId: string) => {
    try {
      await cancelAppointment(appointmentId);
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch (error) {
      console.error('Error cancelling appointment:', error);
      Alert.alert('Error', 'Failed to cancel appointment. Please try again.');
    }
  };

  const handleConfirmAppointment = async (appointmentId: string) => {
    try {
      await updateAppointment(appointmentId, { status: 'confirmed' });
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch (error) {
      console.error('Error confirming appointment:', error);
      Alert.alert('Error', 'Failed to confirm appointment. Please try again.');
    }
  };

  const getAppointmentsForDate = (date: Date) => {
    return appointments.filter(apt => {
      const aptDate = new Date(apt.start_time);
      return (
        aptDate.getDate() === date.getDate() &&
        aptDate.getMonth() === date.getMonth() &&
        aptDate.getFullYear() === date.getFullYear()
      );
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled': return '#007AFF';
      case 'confirmed': return '#34C759';
      case 'cancelled': return '#FF3B30';
      case 'completed': return '#666666';
      default: return '#007AFF';
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Loading your appointments...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <AlertCircle color="#FF3B30" size={48} />
        <Text style={styles.errorTitle}>Unable to Load Appointments</Text>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={() => window.location.reload()}>
          <Text style={styles.retryButtonText}>Try Again</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView 
      style={styles.container}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={handleRefresh}
          colors={['#007AFF']}
          tintColor="#007AFF"
        />
      }
    >
      <View style={styles.header}>
        <Text style={styles.title}>Appointments</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity
            style={styles.calendarButton}
            onPress={() => setShowCalendar(!showCalendar)}>
            <Calendar color="#007AFF" size={24} />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => router.push('/appointments/book')}>
            <LinearGradient
              colors={['#007AFF', '#0055FF']}
              style={styles.addGradient}>
              <Plus color="#FFF" size={20} />
              <Text style={styles.addText}>Book</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>

      {showCalendar && (
        <View style={styles.calendarContainer}>
          <Text style={styles.calendarTitle}>Select Date</Text>
          {/* Simple date selector - in production, use a proper calendar component */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.dateScroll}>
            {Array.from({ length: 14 }, (_, i) => {
              const date = new Date();
              date.setDate(date.getDate() + i);
              const isSelected = date.toDateString() === selectedDate.toDateString();
              const appointmentCount = getAppointmentsForDate(date).length;
              
              return (
                <TouchableOpacity
                  key={i}
                  style={[styles.dateItem, isSelected && styles.dateItemSelected]}
                  onPress={() => setSelectedDate(date)}>
                  <Text style={[styles.dateDay, isSelected && styles.dateDaySelected]}>
                    {date.toLocaleDateString('en', { weekday: 'short' })}
                  </Text>
                  <Text style={[styles.dateNumber, isSelected && styles.dateNumberSelected]}>
                    {date.getDate()}
                  </Text>
                  {appointmentCount > 0 && (
                    <View style={styles.appointmentDot}>
                      <Text style={styles.appointmentCount}>{appointmentCount}</Text>
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>
      )}

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>
          {showCalendar ? `${selectedDate.toLocaleDateString('en', { weekday: 'long', month: 'long', day: 'numeric' })}` : "Today's Appointments"}
        </Text>
        
        {appointments.length === 0 ? (
          <View style={styles.emptyState}>
            <Calendar color="#666666" size={48} />
            <Text style={styles.emptyTitle}>No Appointments Scheduled</Text>
            <Text style={styles.emptyText}>
              Book your first appointment to start managing your healthcare
            </Text>
            <TouchableOpacity style={styles.bookFirstButton} onPress={() => router.push('/appointments/book')}>
              <Text style={styles.bookFirstButtonText}>Book Appointment</Text>
            </TouchableOpacity>
          </View>
        ) : (
          (showCalendar ? getAppointmentsForDate(selectedDate) : todayAppointments)
            .map((appointment) => (
              <TouchableOpacity
                key={appointment.id}
                style={styles.appointmentCard}
                onPress={() => handleAppointmentAction(appointment, 'details')}>
                <View style={[styles.statusIndicator, { backgroundColor: getStatusColor(appointment.status) }]} />
                
                <View style={styles.appointmentContent}>
                  <View style={styles.appointmentHeader}>
                    <Text style={styles.appointmentTitle}>{appointment.title}</Text>
                    <TouchableOpacity
                      onPress={() => speakAppointmentDetails(appointment)}
                      style={styles.speakButton}>
                      <VolumeUp color="#007AFF" size={20} />
                    </TouchableOpacity>
                  </View>

                  <View style={styles.appointmentDetails}>
                    <View style={styles.detailRow}>
                      <Clock color="#666666" size={16} />
                      <Text style={styles.detailText}>
                        {new Date(appointment.start_time).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit'
                        })} - {new Date(appointment.end_time).toLocaleTimeString([], {
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
                    <View style={styles.statusContainer}>
                      <Text style={[styles.statusText, { color: getStatusColor(appointment.status) }]}>
                        {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                      </Text>
                    </View>
                    
                    <View style={styles.appointmentActions}>
                      {appointment.status === 'scheduled' && (
                        <TouchableOpacity
                          style={styles.confirmButton}
                          onPress={() => handleConfirmAppointment(appointment.id)}>
                          <CheckCircle2 color="#34C759" size={20} />
                        </TouchableOpacity>
                      )}
                      
                      <TouchableOpacity
                        style={styles.editButton}
                        onPress={() => handleAppointmentAction(appointment, 'edit')}>
                        <Edit color="#007AFF" size={20} />
                      </TouchableOpacity>
                      
                      <TouchableOpacity
                        style={styles.cancelButton}
                        onPress={() => handleAppointmentAction(appointment, 'cancel')}>
                        <Trash2 color="#FF3B30" size={20} />
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              </TouchableOpacity>
            ))
        )}
      </View>

      {upcomingAppointments.length > 0 && !showCalendar && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Upcoming Appointments</Text>
          {upcomingAppointments.slice(0, 3).map((appointment) => (
            <TouchableOpacity
              key={appointment.id}
              style={styles.upcomingCard}
              onPress={() => handleAppointmentAction(appointment, 'details')}>
              <View style={styles.upcomingDate}>
                <Text style={styles.upcomingDay}>
                  {new Date(appointment.start_time).getDate()}
                </Text>
                <Text style={styles.upcomingMonth}>
                  {new Date(appointment.start_time).toLocaleDateString('en', { month: 'short' })}
                </Text>
              </View>
              
              <View style={styles.upcomingInfo}>
                <Text style={styles.upcomingTitle}>{appointment.title}</Text>
                <Text style={styles.upcomingTime}>
                  {new Date(appointment.start_time).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </Text>
                <Text style={styles.upcomingLocation}>{appointment.location.name}</Text>
              </View>
              
              <ChevronRight color="#666666" size={20} />
            </TouchableOpacity>
          ))}
        </View>
      )}

      <View style={styles.reminderPreferences}>
        <Text style={styles.preferencesTitle}>Notification Settings</Text>
        <TouchableOpacity
          style={styles.preferencesButton}
          onPress={() => router.push('/appointments/notifications')}>
          <Settings color="#007AFF" size={20} />
          <Text style={styles.preferencesButtonText}>Customize Notifications</Text>
          <ChevronRight color="#007AFF" size={20} />
        </TouchableOpacity>
      </View>

      <Modal
        visible={showActionModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowActionModal(false)}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Appointment Details</Text>
              <TouchableOpacity onPress={() => setShowActionModal(false)}>
                <X color="#666666" size={24} />
              </TouchableOpacity>
            </View>
            
            {selectedAppointment && (
              <View style={styles.modalBody}>
                <Text style={styles.modalAppointmentTitle}>{selectedAppointment.title}</Text>
                <Text style={styles.modalDescription}>{selectedAppointment.description}</Text>
                
                <View style={styles.modalDetailRow}>
                  <Clock color="#666666" size={16} />
                  <Text style={styles.modalDetailText}>
                    {new Date(selectedAppointment.start_time).toLocaleDateString()} at{' '}
                    {new Date(selectedAppointment.start_time).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </Text>
                </View>
                
                <View style={styles.modalDetailRow}>
                  <MapPin color="#666666" size={16} />
                  <Text style={styles.modalDetailText}>{selectedAppointment.location.name}</Text>
                  <Text style={styles.modalDetailSubtext}>{selectedAppointment.location.address}</Text>
                </View>
                
                {selectedAppointment.instructions && (
                  <View style={styles.modalInstructions}>
                    <Text style={styles.modalInstructionsTitle}>Instructions:</Text>
                    <Text style={styles.modalInstructionsText}>{selectedAppointment.instructions}</Text>
                  </View>
                )}
              </View>
            )}
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
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
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F2F2F7',
    padding: 24,
  },
  errorTitle: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    color: '#000000',
    marginTop: 16,
  },
  errorText: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#666666',
    textAlign: 'center',
    marginTop: 8,
  },
  retryButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 16,
  },
  retryButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
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
    fontSize: 28,
    fontFamily: 'Inter-Bold',
    color: '#000000',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  calendarButton: {
    padding: 8,
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
    gap: 4,
  },
  addText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
  },
  calendarContainer: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  calendarTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#000000',
    marginBottom: 12,
  },
  dateScroll: {
    flexDirection: 'row',
  },
  dateItem: {
    alignItems: 'center',
    padding: 12,
    marginRight: 8,
    borderRadius: 12,
    backgroundColor: '#F8F8F8',
    minWidth: 60,
  },
  dateItemSelected: {
    backgroundColor: '#007AFF',
  },
  dateDay: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#666666',
  },
  dateDaySelected: {
    color: '#FFFFFF',
  },
  dateNumber: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    color: '#000000',
    marginTop: 4,
  },
  dateNumberSelected: {
    color: '#FFFFFF',
  },
  appointmentDot: {
    backgroundColor: '#FF3B30',
    borderRadius: 10,
    width: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
  },
  appointmentCount: {
    fontSize: 10,
    fontFamily: 'Inter-Bold',
    color: '#FFFFFF',
  },
  section: {
    padding: 16,
    backgroundColor: '#FFFFFF',
    marginTop: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontFamily: 'Inter-SemiBold',
    color: '#000000',
    marginBottom: 16,
  },
  emptyState: {
    alignItems: 'center',
    padding: 48,
  },
  emptyTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#000000',
    marginTop: 16,
  },
  emptyText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#666666',
    textAlign: 'center',
    marginTop: 8,
  },
  bookFirstButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 16,
  },
  bookFirstButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
  },
  appointmentCard: {
    flexDirection: 'row',
    backgroundColor: '#F8F8F8',
    borderRadius: 12,
    marginBottom: 12,
    overflow: 'hidden',
  },
  statusIndicator: {
    width: 4,
    backgroundColor: '#007AFF',
  },
  appointmentContent: {
    flex: 1,
    padding: 16,
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
    flex: 1,
  },
  speakButton: {
    padding: 4,
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
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#666666',
    marginLeft: 8,
    flex: 1,
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
  },
  statusContainer: {
    flex: 1,
  },
  statusText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
  },
  appointmentActions: {
    flexDirection: 'row',
    gap: 8,
  },
  confirmButton: {
    padding: 8,
  },
  editButton: {
    padding: 8,
  },
  cancelButton: {
    padding: 8,
  },
  upcomingCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F8F8',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
  },
  upcomingDate: {
    alignItems: 'center',
    marginRight: 16,
    backgroundColor: '#007AFF',
    borderRadius: 8,
    padding: 8,
    minWidth: 50,
  },
  upcomingDay: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    color: '#FFFFFF',
  },
  upcomingMonth: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#FFFFFF',
  },
  upcomingInfo: {
    flex: 1,
  },
  upcomingTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#000000',
  },
  upcomingTime: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#666666',
    marginTop: 2,
  },
  upcomingLocation: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#666666',
    marginTop: 2,
  },
  reminderPreferences: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    marginTop: 16,
  },
  preferencesTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#000000',
    marginBottom: 12,
  },
  preferencesButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F8F8',
    padding: 16,
    borderRadius: 12,
    gap: 12,
  },
  preferencesButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#000000',
    flex: 1,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    margin: 32,
    maxWidth: 400,
    width: '100%',
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  modalTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#000000',
  },
  modalBody: {
    padding: 20,
  },
  modalAppointmentTitle: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    color: '#000000',
    marginBottom: 8,
  },
  modalDescription: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#666666',
    marginBottom: 16,
  },
  modalDetailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  modalDetailText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#000000',
    marginLeft: 8,
  },
  modalDetailSubtext: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#666666',
    marginLeft: 24,
    marginTop: 4,
  },
  modalInstructions: {
    backgroundColor: '#F8F8F8',
    padding: 16,
    borderRadius: 12,
    marginTop: 16,
  },
  modalInstructionsTitle: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#000000',
    marginBottom: 8,
  },
  modalInstructionsText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#666666',
  },
});