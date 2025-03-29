import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { Pill, Camera, Clock, Bell, Plus, TrendingUp, Calendar, Brain, CircleCheck as CheckCircle2, CircleAlert as AlertCircle } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Speech from 'expo-speech';

type Medication = {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  timeOfDay: string[];
  image: string;
  nextDose: string;
  color: string[];
  adherenceRate: number;
  streak: number;
  lastTaken?: Date;
  refillDate?: Date;
  daysRemaining: number;
  aiInsights?: string[];
  missedDoses?: number;
  sideEffects?: string[];
};

type AdherenceStats = {
  weeklyRate: number;
  monthlyRate: number;
  currentStreak: number;
  bestStreak: number;
  insights: string[];
  trends: {
    label: string;
    value: number;
    change: number;
  }[];
};

export default function MedicationsScreen() {
  const router = useRouter();
  const [medications, setMedications] = useState<Medication[]>([
    {
      id: '1',
      name: 'Lisinopril',
      dosage: '10mg',
      frequency: 'Once daily',
      timeOfDay: ['Morning'],
      image: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?q=80&w=200&auto=format&fit=crop',
      nextDose: '8:00 AM',
      color: ['#FF9500', '#FF7F00'],
      adherenceRate: 95,
      streak: 7,
      lastTaken: new Date(Date.now() - 24 * 60 * 60 * 1000),
      refillDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
      daysRemaining: 14,
      aiInsights: [
        'Great adherence pattern in the morning',
        'Consider taking with breakfast for better absorption',
        'Blood pressure readings show positive response',
      ],
      missedDoses: 2,
      sideEffects: ['Mild dizziness', 'Dry cough'],
    },
    {
      id: '2',
      name: 'Metformin',
      dosage: '500mg',
      frequency: 'Twice daily',
      timeOfDay: ['Morning', 'Evening'],
      image: 'https://images.unsplash.com/photo-1587854692152-cbe660dbde88?q=80&w=200&auto=format&fit=crop',
      nextDose: '7:00 PM',
      color: ['#5856D6', '#5E5CE6'],
      adherenceRate: 88,
      streak: 4,
      lastTaken: new Date(Date.now() - 12 * 60 * 60 * 1000),
      refillDate: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000),
      daysRemaining: 21,
      aiInsights: [
        'Evening doses occasionally missed',
        'Taking with meals reduces side effects',
        'Consider setting a dinner-time reminder',
      ],
      missedDoses: 5,
      sideEffects: ['Nausea when taken on empty stomach'],
    },
  ]);

  const [adherenceStats, setAdherenceStats] = useState<AdherenceStats>({
    weeklyRate: 92,
    monthlyRate: 89,
    currentStreak: 7,
    bestStreak: 14,
    insights: [
      'Morning medication adherence is excellent',
      'Evening doses need attention',
      'Overall trend is improving',
    ],
    trends: [
      {
        label: 'Morning',
        value: 95,
        change: 2,
      },
      {
        label: 'Evening',
        value: 85,
        change: -3,
      },
      {
        label: 'Weekend',
        value: 90,
        change: 5,
      },
    ],
  });

  const [showAIInsights, setShowAIInsights] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    if (!isInitialized) {
      // Check for medications that need refills soon
      const medicationsNeedingRefills = medications.filter(med => med.daysRemaining <= 7);
      if (medicationsNeedingRefills.length > 0) {
        const message = `You have ${medicationsNeedingRefills.length} medication${
          medicationsNeedingRefills.length > 1 ? 's' : ''
        } that need refills soon. Would you like me to help you schedule refills?`;
        
        // Only run speech on native platforms
        if (Platform.OS !== 'web') {
          Speech.speak(message, {
            rate: 0.8,
            pitch: 1.0,
          });
        }
      }

      // Check for missed doses and notify caregivers
      const missedDoses = medications.filter(med => {
        const lastTaken = med.lastTaken ? new Date(med.lastTaken) : new Date(0);
        const hoursSinceLastDose = (Date.now() - lastTaken.getTime()) / (1000 * 60 * 60);
        return hoursSinceLastDose > 24;
      });

      if (missedDoses.length > 0) {
        // Simulate caregiver notification
        console.log('Notifying caregivers about missed doses:', missedDoses.map(med => med.name));
      }

      setIsInitialized(true);
    }
  }, [isInitialized, medications]);

  const handleMedicationTaken = (id: string) => {
    setMedications(prev =>
      prev.map(med =>
        med.id === id
          ? {
              ...med,
              lastTaken: new Date(),
              streak: med.streak + 1,
              adherenceRate: Math.min(100, med.adherenceRate + 1),
            }
          : med
      )
    );

    // Only run speech on native platforms
    if (Platform.OS !== 'web') {
      Speech.speak('Great job taking your medication! Keep up the good work!', {
        rate: 0.8,
        pitch: 1.0,
      });
    }

    setAdherenceStats(prev => ({
      ...prev,
      weeklyRate: Math.min(100, prev.weeklyRate + 0.5),
      currentStreak: prev.currentStreak + 1,
      bestStreak: Math.max(prev.bestStreak, prev.currentStreak + 1),
    }));
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

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Medications</Text>
        <Text style={styles.subtitle}>Track and manage your medications with AI assistance</Text>
      </View>

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

            <View style={styles.trendsContainer}>
              <Text style={styles.trendsTitle}>Adherence Trends</Text>
              {adherenceStats.trends.map((trend, index) => (
                <View key={index} style={styles.trendItem}>
                  <Text style={styles.trendLabel}>{trend.label}</Text>
                  <View style={styles.trendValue}>
                    <Text style={styles.trendPercentage}>{trend.value}%</Text>
                    {renderTrendIndicator(trend.change)}
                  </View>
                </View>
              ))}
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

      <View style={styles.actionsContainer}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => router.push('/medications/scan')}>
          <LinearGradient
            colors={['#007AFF', '#0055FF']}
            style={styles.actionGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}>
            <Camera color="#FFF" size={24} />
            <Text style={styles.actionText}>Scan New{'\n'}Medication</Text>
          </LinearGradient>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionButton}>
          <LinearGradient
            colors={['#34C759', '#32D74B']}
            style={styles.actionGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}>
            <Clock color="#FFF" size={24} />
            <Text style={styles.actionText}>Schedule{'\n'}Reminders</Text>
          </LinearGradient>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionButton}>
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
          <TouchableOpacity>
            <Plus color="#007AFF" size={24} />
          </TouchableOpacity>
        </View>

        {medications.map((medication) => (
          <TouchableOpacity
            key={medication.id}
            style={styles.medicationCard}
            onPress={() => router.push('/medications/details')}>
            <Image source={{ uri: medication.image }} style={styles.medicationImage} />
            <View style={styles.medicationInfo}>
              <View style={styles.medicationHeader}>
                <Text style={styles.medicationName}>{medication.name}</Text>
                <Text style={styles.medicationDosage}>{medication.dosage}</Text>
              </View>
              <Text style={styles.medicationFrequency}>{medication.frequency}</Text>
              <View style={styles.timeContainer}>
                <Clock color="#666666" size={16} />
                <Text style={styles.nextDoseText}>Next dose: {medication.nextDose}</Text>
              </View>
              <View style={styles.adherenceContainer}>
                <View style={styles.adherenceBar}>
                  <View
                    style={[
                      styles.adheranceProgress,
                      { width: `${medication.adherenceRate}%` },
                    ]}
                  />
                </View>
                <Text style={styles.adherenceText}>
                  {medication.adherenceRate}% adherence
                </Text>
              </View>

              {medication.aiInsights && medication.aiInsights.length > 0 && (
                <View style={styles.medicationInsights}>
                  <Brain color="#007AFF" size={16} />
                  <Text style={styles.insightText}>{medication.aiInsights[0]}</Text>
                </View>
              )}

              {medication.daysRemaining <= 7 && (
                <View style={styles.refillAlert}>
                  <AlertCircle color="#FF3B30" size={16} />
                  <Text style={styles.refillText}>
                    Refill needed in {medication.daysRemaining} days
                  </Text>
                </View>
              )}

              {medication.sideEffects && medication.sideEffects.length > 0 && (
                <View style={styles.sideEffectsContainer}>
                  <Text style={styles.sideEffectsTitle}>Reported Side Effects:</Text>
                  {medication.sideEffects.map((effect, index) => (
                    <Text key={index} style={styles.sideEffectText}>• {effect}</Text>
                  ))}
                </View>
              )}
            </View>
            <TouchableOpacity
              style={styles.takeButton}
              onPress={() => handleMedicationTaken(medication.id)}>
              <LinearGradient
                colors={medication.color}
                style={styles.takeButtonGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}>
                <CheckCircle2 color="#FFF" size={20} />
              </LinearGradient>
            </TouchableOpacity>
          </TouchableOpacity>
        ))}
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
  trendsContainer: {
    marginTop: 16,
    backgroundColor: '#F8F8F8',
    padding: 16,
    borderRadius: 12,
  },
  trendsTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#000000',
    marginBottom: 12,
  },
  trendItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  trendLabel: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#000000',
  },
  trendValue: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  trendPercentage: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#000000',
    marginRight: 8,
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
  takeButton: {
    marginLeft: 12,
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