import { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Platform,
  Switch,
} from 'react-native';
import { useRouter } from 'expo-router';
import {
  Clock,
  Bell,
  Calendar,
  CircleAlert as AlertCircle,
  Brain,
  MessageSquare,
  Users,
  Volume2 as VolumeUp,
} from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Speech from 'expo-speech';

type TimeOfDay = 'morning' | 'afternoon' | 'evening' | 'night';
type ReminderType = 'sound' | 'voice' | 'both';
type CaregiverAlert = 'missed' | 'late' | 'all';

const timeOptions: { id: TimeOfDay; label: string; time: string; aiSuggestion?: string }[] = [
  {
    id: 'morning',
    label: 'Morning',
    time: '8:00 AM',
    aiSuggestion: 'Taking medication in the morning with breakfast helps maintain consistent levels throughout the day.',
  },
  {
    id: 'afternoon',
    label: 'Afternoon',
    time: '2:00 PM',
    aiSuggestion: 'Afternoon doses are best taken after lunch to avoid stomach discomfort.',
  },
  {
    id: 'evening',
    label: 'Evening',
    time: '7:00 PM',
    aiSuggestion: 'Evening medication should be taken with dinner to ensure proper absorption.',
  },
  {
    id: 'night',
    label: 'Night',
    time: '10:00 PM',
    aiSuggestion: 'Night doses are important for maintaining medication levels while you sleep.',
  },
];

export default function DetailsScreen() {
  const router = useRouter();
  const [selectedTimes, setSelectedTimes] = useState<TimeOfDay[]>(['morning']);
  const [reminderType, setReminderType] = useState<ReminderType>('both');
  const [caregiverAlerts, setCaregiverAlerts] = useState<CaregiverAlert>('all');
  const [showAIHelp, setShowAIHelp] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState<string[]>([]);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [smartScheduling, setSmartScheduling] = useState(true);
  const [medicationData, setMedicationData] = useState({
    name: 'Lisinopril',
    dosage: '10mg',
    frequency: 'Once daily',
    instructions: 'Take with or without food',
  });

  useEffect(() => {
    // AI generates suggestions based on medication and schedule
    generateAISuggestions();
  }, [selectedTimes, medicationData]);

  const generateAISuggestions = () => {
    const suggestions = [
      `Based on your schedule, taking ${medicationData.name} at ${timeOptions.find(t => t.id === selectedTimes[0])?.time} would be optimal.`,
      'Consider setting both voice and sound alerts for better medication adherence.',
      'Regular medication times help maintain consistent blood levels.',
    ];
    setAiSuggestions(suggestions);
  };

  const toggleTime = (time: TimeOfDay) => {
    setSelectedTimes(prev =>
      prev.includes(time)
        ? prev.filter(t => t !== time)
        : [...prev, time]
    );
  };

  const speakInstructions = (text: string) => {
    Speech.speak(text, {
      language: 'en',
      pitch: 1,
      rate: 0.8,
    });
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Medication Setup</Text>
        <Text style={styles.subtitle}>Configure your medication schedule with AI assistance</Text>
      </View>

      <View style={styles.form}>
        <View style={styles.inputGroup}>
          <View style={styles.labelContainer}>
            <Text style={styles.label}>Medication Name</Text>
            <TouchableOpacity
              onPress={() => speakInstructions(medicationData.name)}
              style={styles.speakButton}>
              <VolumeUp color="#007AFF" size={20} />
            </TouchableOpacity>
          </View>
          <TextInput
            style={styles.input}
            value={medicationData.name}
            onChangeText={name => setMedicationData(prev => ({ ...prev, name }))}
            placeholder="Enter medication name"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Dosage</Text>
          <TextInput
            style={styles.input}
            value={medicationData.dosage}
            onChangeText={dosage => setMedicationData(prev => ({ ...prev, dosage }))}
            placeholder="Enter dosage (e.g., 10mg)"
          />
        </View>

        <TouchableOpacity
          style={styles.aiHelpButton}
          onPress={() => setShowAIHelp(!showAIHelp)}>
          <LinearGradient
            colors={['#007AFF', '#0055FF']}
            style={styles.aiHelpGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}>
            <Brain color="#FFF" size={24} />
            <Text style={styles.aiHelpText}>AI Scheduling Assistant</Text>
          </LinearGradient>
        </TouchableOpacity>

        {showAIHelp && (
          <View style={styles.aiSuggestionsContainer}>
            {aiSuggestions.map((suggestion, index) => (
              <View key={index} style={styles.aiSuggestion}>
                <Brain color="#007AFF" size={16} />
                <Text style={styles.aiSuggestionText}>{suggestion}</Text>
              </View>
            ))}
          </View>
        )}

        <View style={styles.timeSection}>
          <Text style={styles.sectionTitle}>Schedule</Text>
          <View style={styles.timeGrid}>
            {timeOptions.map((option) => (
              <TouchableOpacity
                key={option.id}
                style={[
                  styles.timeOption,
                  selectedTimes.includes(option.id) && styles.timeOptionSelected,
                ]}
                onPress={() => toggleTime(option.id)}>
                <Clock
                  color={selectedTimes.includes(option.id) ? '#FFFFFF' : '#666666'}
                  size={20}
                />
                <Text
                  style={[
                    styles.timeLabel,
                    selectedTimes.includes(option.id) && styles.timeLabelSelected,
                  ]}>
                  {option.label}
                </Text>
                <Text
                  style={[
                    styles.timeValue,
                    selectedTimes.includes(option.id) && styles.timeValueSelected,
                  ]}>
                  {option.time}
                </Text>
                {option.aiSuggestion && selectedTimes.includes(option.id) && (
                  <TouchableOpacity
                    onPress={() => speakInstructions(option.aiSuggestion!)}
                    style={styles.timeTip}>
                    <Brain color="#007AFF" size={16} />
                    <Text style={styles.timeTipText}>AI Tip</Text>
                  </TouchableOpacity>
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.reminderSection}>
          <View style={styles.reminderHeader}>
            <Bell color="#007AFF" size={20} />
            <Text style={styles.reminderTitle}>Smart Reminders</Text>
          </View>

          <View style={styles.reminderOptions}>
            <View style={styles.reminderOption}>
              <View style={styles.reminderOptionHeader}>
                <MessageSquare color="#666666" size={20} />
                <Text style={styles.reminderOptionTitle}>Voice Reminders</Text>
              </View>
              <Switch
                value={voiceEnabled}
                onValueChange={setVoiceEnabled}
                trackColor={{ false: '#D1D1D6', true: '#34C759' }}
                ios_backgroundColor="#D1D1D6"
              />
            </View>

            <View style={styles.reminderOption}>
              <View style={styles.reminderOptionHeader}>
                <Brain color="#666666" size={20} />
                <Text style={styles.reminderOptionTitle}>Smart Scheduling</Text>
              </View>
              <Switch
                value={smartScheduling}
                onValueChange={setSmartScheduling}
                trackColor={{ false: '#D1D1D6', true: '#34C759' }}
                ios_backgroundColor="#D1D1D6"
              />
            </View>
          </View>
        </View>

        <View style={styles.caregiverSection}>
          <View style={styles.caregiverHeader}>
            <Users color="#007AFF" size={20} />
            <Text style={styles.caregiverTitle}>Caregiver Notifications</Text>
          </View>

          <View style={styles.caregiverOptions}>
            <TouchableOpacity
              style={[
                styles.caregiverOption,
                caregiverAlerts === 'missed' && styles.caregiverOptionSelected,
              ]}
              onPress={() => setCaregiverAlerts('missed')}>
              <AlertCircle color={caregiverAlerts === 'missed' ? '#FFFFFF' : '#666666'} size={20} />
              <Text
                style={[
                  styles.caregiverOptionText,
                  caregiverAlerts === 'missed' && styles.caregiverOptionTextSelected,
                ]}>
                Missed Doses
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.caregiverOption,
                caregiverAlerts === 'late' && styles.caregiverOptionSelected,
              ]}
              onPress={() => setCaregiverAlerts('late')}>
              <Clock color={caregiverAlerts === 'late' ? '#FFFFFF' : '#666666'} size={20} />
              <Text
                style={[
                  styles.caregiverOptionText,
                  caregiverAlerts === 'late' && styles.caregiverOptionTextSelected,
                ]}>
                Late Doses
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.caregiverOption,
                caregiverAlerts === 'all' && styles.caregiverOptionSelected,
              ]}
              onPress={() => setCaregiverAlerts('all')}>
              <Bell color={caregiverAlerts === 'all' ? '#FFFFFF' : '#666666'} size={20} />
              <Text
                style={[
                  styles.caregiverOptionText,
                  caregiverAlerts === 'all' && styles.caregiverOptionTextSelected,
                ]}>
                All Updates
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.alertSection}>
          <AlertCircle color="#FF9500" size={20} />
          <Text style={styles.alertText}>
            AI will monitor your medication schedule and alert caregivers if doses are missed or taken late.
          </Text>
        </View>
      </View>

      <View style={styles.actions}>
        <TouchableOpacity
          style={styles.saveButton}
          onPress={() => router.push('/medications')}>
          <LinearGradient
            colors={['#34C759', '#32D74B']}
            style={styles.buttonGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}>
            <Text style={styles.buttonText}>Save & Set Reminders</Text>
          </LinearGradient>
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
  form: {
    padding: 16,
    backgroundColor: '#FFFFFF',
    marginTop: 16,
  },
  inputGroup: {
    marginBottom: 16,
  },
  labelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  label: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#000000',
  },
  speakButton: {
    padding: 4,
  },
  input: {
    borderWidth: 1,
    borderColor: '#E5E5EA',
    borderRadius: 12,
    padding: 12,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
  },
  aiHelpButton: {
    marginBottom: 16,
    borderRadius: 12,
    overflow: 'hidden',
  },
  aiHelpGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  aiHelpText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
    marginLeft: 12,
  },
  aiSuggestionsContainer: {
    backgroundColor: '#F0F7FF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  aiSuggestion: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  aiSuggestionText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#000000',
    marginLeft: 8,
    flex: 1,
  },
  timeSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#000000',
    marginBottom: 16,
  },
  timeGrid: {
    gap: 12,
  },
  timeOption: {
    backgroundColor: '#F8F8F8',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  timeOptionSelected: {
    backgroundColor: '#007AFF',
  },
  timeLabel: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#000000',
    marginLeft: 12,
    flex: 1,
  },
  timeLabelSelected: {
    color: '#FFFFFF',
  },
  timeValue: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#666666',
  },
  timeValueSelected: {
    color: '#FFFFFF',
  },
  timeTip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginLeft: 8,
  },
  timeTipText: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#007AFF',
    marginLeft: 4,
  },
  reminderSection: {
    marginBottom: 24,
  },
  reminderHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  reminderTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#000000',
    marginLeft: 8,
  },
  reminderOptions: {
    backgroundColor: '#F8F8F8',
    borderRadius: 12,
    overflow: 'hidden',
  },
  reminderOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  reminderOptionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  reminderOptionTitle: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#000000',
    marginLeft: 12,
  },
  caregiverSection: {
    marginBottom: 24,
  },
  caregiverHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  caregiverTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#000000',
    marginLeft: 8,
  },
  caregiverOptions: {
    flexDirection: 'row',
    gap: 8,
  },
  caregiverOption: {
    flex: 1,
    backgroundColor: '#F8F8F8',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
  },
  caregiverOptionSelected: {
    backgroundColor: '#007AFF',
  },
  caregiverOptionText: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#000000',
    marginTop: 4,
  },
  caregiverOptionTextSelected: {
    color: '#FFFFFF',
  },
  alertSection: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF9F0',
    padding: 16,
    borderRadius: 12,
  },
  alertText: {
    flex: 1,
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#666666',
    marginLeft: 12,
  },
  actions: {
    padding: 16,
  },
  saveButton: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  buttonGradient: {
    padding: 16,
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
  },
});