import { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  Image, 
  Platform,
  ActivityIndicator,
  RefreshControl,
  Alert
} from 'react-native';
import { useRouter } from 'expo-router';
import { 
  Pill, 
  Camera, 
  Clock, 
  Bell, 
  Plus, 
  TrendingUp, 
  Calendar, 
  Brain, 
  CircleCheck as CheckCircle2, 
  CircleAlert as AlertCircle,
  Volume2 as VolumeUp,
  BellRing,
  Users
} from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Speech from 'expo-speech';
import * as Haptics from 'expo-haptics';
import { useAuth } from '@/hooks/useAuth';
import { useLanguage } from '@/hooks/useLanguage';
import { useMedications } from '@/hooks/useMedications';

export default function MedicationsScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { t } = useLanguage();
  const {
    medications,
    adherenceStats,
    loading,
    error,
    recordDose,
    toggleReminders,
    toggleCaregiverAlerts,
    todaysMedications,
    upcomingMedications,
    medicationsNeedingRefill
  } = useMedications(user?.id || '');

  const [showAIInsights, setShowAIInsights] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [speakingMedication, setSpeakingMedication] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && medications.length > 0) {
      // Check for medications that need refills soon
      if (medicationsNeedingRefill.length > 0) {
        const message = `You have ${medicationsNeedingRefill.length} medication${
          medicationsNeedingRefill.length > 1 ? 's' : ''
        } that need refills soon. Would you like me to help you schedule refills?`;
        
        if (Platform.OS !== 'web') {
          Speech.speak(message, { rate: 0.8, pitch: 1.0 });
        }
      }
    }
  }, [loading, medicationsNeedingRefill]);

  const handleMedicationTaken = async (medicationId: string) => {
    try {
      await recordDose(medicationId, 'taken');
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch (error) {
      console.error('Error recording dose:', error);
      Alert.alert('Error', 'Failed to record dose. Please try again.');
    }
  };

  const handleRemindersToggle = async (medicationId: string, currentState: boolean) => {
    try {
      await toggleReminders(medicationId, !currentState);
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch (error) {
      console.error('Error toggling reminders:', error);
      Alert.alert('Error', 'Failed to update reminders. Please try again.');
    }
  };

  const handleCaregiverAlertsToggle = async (medicationId: string, currentState: boolean) => {
    try {
      await toggleCaregiverAlerts(medicationId, !currentState);
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch (error) {
      console.error('Error toggling caregiver alerts:', error);
      Alert.alert('Error', 'Failed to update caregiver alerts. Please try again.');
    }
  };

  const speakMedicationDetails = async (medication: any) => {
    if (Platform.OS === 'web') return;

    setSpeakingMedication(medication.id);
    const message = `${medication.name}, ${medication.dosage}, ${medication.frequency}. Next dose at ${medication.time_of_day.join(' and ')}. Adherence rate: ${medication.adherence_rate} percent.`;
    
    try {
      await Speech.speak(message, { rate: 0.8, pitch: 1.0 });
    } catch (error) {
      console.error('Error speaking medication details:', error);
    } finally {
      setSpeakingMedication(null);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    // The hook will automatically refresh data through real-time subscriptions
    setTimeout(() => setRefreshing(false), 1000);
  };

  const handleScanMedication = () => {
    router.push('/medications/scan');
  };

  const handleAddMedication = () => {
    router.push('/medications/add');
  };

  const renderTrendIndicator = (change: number) => {
    const color = change >= 0 ? '#34C759' : '#FF3B30';
    const icon = change >= 0 ? '↑' : '↓';
    return (
      <Text style={[styles.trendChange, { color }]}>
        {icon} {Math.abs(change)}%
      </Text>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Loading your medications...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <AlertCircle color="#FF3B30" size={48} />
        <Text style={styles.errorTitle}>Unable to Load Medications</Text>
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
        <Text style={styles.title}>Medications</Text>
        <Text style={styles.subtitle}>Track and manage your medications with AI assistance</Text>
      </View>

      {adherenceStats && (
        <View style={styles.adherenceCard}>
          <LinearGradient
            colors={['#007AFF', '#0055FF']}
            style={styles.adherenceHeader}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}>
            <View style={styles.adherenceTitle}>
              <Brain color="#FFF" size={24} />
              <Text style={styles.adherenceTitleText}>AI Health Insights</Text>
            </View>
            <TouchableOpacity
              style={styles.insightButton}
              onPress={() => setShowAIInsights(!showAIInsights)}>
              <Text style={styles.insightButtonText}>
                {showAIInsights ? 'Hide Insights' : 'View Insights'}
              </Text>
            </TouchableOpacity>
          </LinearGradient>

          {showAIInsights && (
            <View style={styles.insightsContainer}>
              <View style={styles.insightRow}>
                <View style={styles.insightItem}>
                  <TrendingUp color="#34C759" size={20} />
                  <Text style={styles.insightLabel}>Weekly Adherence</Text>
                  <Text style={styles.insightValue}>{adherenceStats.weeklyRate}%</Text>
                </View>
                <View style={styles.insightItem}>
                  <Calendar color="#FF9500" size={20} />
                  <Text style={styles.insightLabel}>Monthly Average</Text>
                  <Text style={styles.insightValue}>{adherenceStats.monthlyRate}%</Text>
                </View>
              </View>
              <View style={styles.insightRow}>
                <View style={styles.insightItem}>
                  <CheckCircle2 color="#5856D6" size={20} />
                  <Text style={styles.insightLabel}>Current Streak</Text>
                  <Text style={styles.insightValue}>{adherenceStats.currentStreak} days</Text>
                </View>
                <View style={styles.insightItem}>
                  <AlertCircle color="#FF2D55" size={20} />
                  <Text style={styles.insightLabel}>Best Streak</Text>
                  <Text style={styles.insightValue}>{adherenceStats.bestStreak} days</Text>
                </View>
              </View>

              <View style={styles.aiInsightsContainer}>
                <Text style={styles.aiInsightsTitle}>AI Recommendations</Text>
                {adherenceStats.insights.map((insight, index) => (
                  <View key={index} style={styles.aiInsightItem}>
                    <Brain color="#007AFF" size={16} />
                    <Text style={styles.aiInsightText}>{insight}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}
        </View>
      )}

      <View style={styles.actionsContainer}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={handleScanMedication}>
          <LinearGradient
            colors={['#007AFF', '#0055FF']}
            style={styles.actionGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}>
            <Camera color="#FFF" size={24} />
            <Text style={styles.actionText}>Scan New{'\n'}Medication</Text>
          </LinearGradient>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.actionButton}
          onPress={() => router.push('/medications/reminders')}>
          <LinearGradient
            colors={['#34C759', '#32D74B']}
            style={styles.actionGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}>
            <Clock color="#FFF" size={24} />
            <Text style={styles.actionText}>Schedule{'\n'}Reminders</Text>
          </LinearGradient>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.actionButton}
          onPress={() => router.push('/medications/caregivers')}>
          <LinearGradient
            colors={['#FF3B30', '#FF2D55']}
            style={styles.actionGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}>
            <Bell color="#FFF" size={24} />
            <Text style={styles.actionText}>Caregiver{'\n'}Alerts</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Today's Schedule</Text>
          <TouchableOpacity onPress={handleAddMedication}>
            <Plus color="#007AFF" size={24} />
          </TouchableOpacity>
        </View>

        {medications.length === 0 ? (
          <View style={styles.emptyState}>
            <Pill color="#666666" size={48} />
            <Text style={styles.emptyTitle}>No Medications Added</Text>
            <Text style={styles.emptyText}>
              Add your first medication to start tracking your health journey
            </Text>
            <TouchableOpacity style={styles.addFirstButton} onPress={handleAddMedication}>
              <Text style={styles.addFirstButtonText}>Add Medication</Text>
            </TouchableOpacity>
          </View>
        ) : (
          medications.map((medication) => (
            <TouchableOpacity
              key={medication.id}
              style={styles.medicationCard}
              onPress={() => router.push(`/medications/details?id=${medication.id}`)}>
              <Image 
                source={{ uri: medication.image_url || 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?q=80&w=200&auto=format&fit=crop' }} 
                style={styles.medicationImage} 
              />
              <View style={styles.medicationInfo}>
                <View style={styles.medicationHeader}>
                  <Text style={styles.medicationName}>{medication.name}</Text>
                  <Text style={styles.medicationDosage}>{medication.dosage}</Text>
                </View>
                <Text style={styles.medicationFrequency}>{medication.frequency}</Text>
                <View style={styles.timeContainer}>
                  <Clock color="#666666" size={16} />
                  <Text style={styles.nextDoseText}>
                    Next: {medication.time_of_day.join(', ')}
                  </Text>
                </View>
                <View style={styles.adherenceContainer}>
                  <View style={styles.adherenceBar}>
                    <View
                      style={[
                        styles.adheranceProgress,
                        { width: `${medication.adherence_rate}%` },
                      ]}
                    />
                  </View>
                  <Text style={styles.adherenceText}>
                    {medication.adherence_rate}% adherence
                  </Text>
                </View>

                {medication.instructions && (
                  <View style={styles.medicationInsights}>
                    <Brain color="#007AFF" size={16} />
                    <Text style={styles.insightText}>{medication.instructions}</Text>
                  </View>
                )}

                {medication.days_remaining && medication.days_remaining <= 7 && (
                  <View style={styles.refillAlert}>
                    <AlertCircle color="#FF3B30" size={16} />
                    <Text style={styles.refillText}>
                      Refill needed in {medication.days_remaining} days
                    </Text>
                  </View>
                )}

                {medication.side_effects && medication.side_effects.length > 0 && (
                  <View style={styles.sideEffectsContainer}>
                    <Text style={styles.sideEffectsTitle}>Reported Side Effects:</Text>
                    {medication.side_effects.map((effect, index) => (
                      <Text key={index} style={styles.sideEffectText}>• {effect}</Text>
                    ))}
                  </View>
                )}
              </View>
              <View style={styles.medicationActions}>
                <TouchableOpacity
                  style={[styles.actionIcon, { backgroundColor: medication.reminder_enabled ? '#34C759' : '#E5E5EA' }]}
                  onPress={() => handleRemindersToggle(medication.id, medication.reminder_enabled)}>
                  <BellRing color={medication.reminder_enabled ? "#FFF" : "#666"} size={16} />
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={[styles.actionIcon, { backgroundColor: medication.caregiver_alerts ? '#FF9500' : '#E5E5EA' }]}
                  onPress={() => handleCaregiverAlertsToggle(medication.id, medication.caregiver_alerts)}>
                  <Users color={medication.caregiver_alerts ? "#FFF" : "#666"} size={16} />
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.actionIcon}
                  onPress={() => speakMedicationDetails(medication)}>
                  <VolumeUp color={speakingMedication === medication.id ? "#007AFF" : "#666"} size={16} />
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.takeButton}
                  onPress={() => handleMedicationTaken(medication.id)}>
                  <LinearGradient
                    colors={['#34C759', '#32D74B']}
                    style={styles.takeButtonGradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}>
                    <CheckCircle2 color="#FFF" size={20} />
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          ))
        )}
      </View>

      <View style={styles.aiAssistantCard}>
        <Brain color="#007AFF" size={24} />
        <View style={styles.aiAssistantContent}>
          <Text style={styles.aiAssistantTitle}>AI Medication Assistant</Text>
          <Text style={styles.aiAssistantText}>
            I can help you maintain your medication schedule and answer any questions you have.
          </Text>
        </View>
        <TouchableOpacity
          style={styles.askButton}
          onPress={() => router.push('/chat')}>
          <Text style={styles.askButtonText}>Ask AI</Text>
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
    padding: 24,
    paddingTop: 60,
    backgroundColor: '#FFFFFF',
  },
  title: {
    fontSize: 28,
    fontFamily: 'Inter-Bold',
    color: '#000000',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#666666',
  },
  adherenceCard: {
    margin: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  adherenceHeader: {
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  adherenceTitle: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  adherenceTitleText: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
    marginLeft: 8,
  },
  insightButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  insightButtonText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#FFFFFF',
  },
  insightsContainer: {
    padding: 16,
    backgroundColor: '#FFFFFF',
  },
  insightRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  insightItem: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: '#F8F8F8',
    padding: 12,
    borderRadius: 12,
    marginHorizontal: 4,
  },
  insightLabel: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#666666',
    marginTop: 4,
  },
  insightValue: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    color: '#000000',
    marginTop: 4,
  },
  trendChange: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
  },
  aiInsightsContainer: {
    marginTop: 16,
  },
  aiInsightsTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#000000',
    marginBottom: 12,
  },
  aiInsightItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F7FF',
    padding: 12,
    borderRadius: 12,
    marginBottom: 8,
  },
  aiInsightText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#000000',
    marginLeft: 8,
    flex: 1,
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#FFFFFF',
  },
  actionButton: {
    flex: 1,
    marginHorizontal: 4,
  },
  actionGradient: {
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  actionText: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#FFFFFF',
    marginTop: 8,
    textAlign: 'center',
  },
  section: {
    padding: 16,
    backgroundColor: '#FFFFFF',
    marginTop: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontFamily: 'Inter-SemiBold',
    color: '#000000',
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
  addFirstButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 16,
  },
  addFirstButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
  },
  medicationCard: {
    flexDirection: 'row',
    backgroundColor: '#F8F8F8',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  medicationImage: {
    width: 48,
    height: 48,
    borderRadius: 8,
    marginRight: 16,
  },
  medicationInfo: {
    flex: 1,
  },
  medicationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  medicationName: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#000000',
    marginRight: 8,
  },
  medicationDosage: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#666666',
  },
  medicationFrequency: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#666666',
    marginBottom: 8,
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  nextDoseText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#666666',
    marginLeft: 4,
  },
  adherenceContainer: {
    marginTop: 8,
  },
  adherenceBar: {
    height: 4,
    backgroundColor: '#E5E5EA',
    borderRadius: 2,
    marginBottom: 4,
  },
  adheranceProgress: {
    height: '100%',
    backgroundColor: '#34C759',
    borderRadius: 2,
  },
  adherenceText: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#666666',
  },
  medicationInsights: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F7FF',
    padding: 8,
    borderRadius: 8,
    marginTop: 8,
  },
  insightText: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#007AFF',
    marginLeft: 4,
    flex: 1,
  },
  refillAlert: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF0F0',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    marginTop: 8,
  },
  refillText: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#FF3B30',
    marginLeft: 4,
  },
  sideEffectsContainer: {
    marginTop: 8,
    padding: 8,
    backgroundColor: '#F8F8F8',
    borderRadius: 8,
  },
  sideEffectsTitle: {
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
    color: '#666666',
    marginBottom: 4,
  },
  sideEffectText: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#666666',
  },
  medicationActions: {
    marginLeft: 12,
    alignItems: 'center',
    gap: 8,
  },
  actionIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#E5E5EA',
  },
  takeButton: {
    marginTop: 8,
  },
  takeButtonGradient: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  aiAssistantCard: {
    margin: 16,
    padding: 16,
    backgroundColor: '#F0F7FF',
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  aiAssistantContent: {
    flex: 1,
    marginLeft: 12,
  },
  aiAssistantTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#000000',
  },
  aiAssistantText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#666666',
    marginTop: 4,
  },
  askButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
  },
  askButtonText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
  },
});