import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Platform,
  Alert,
  KeyboardAvoidingView
} from 'react-native';
import { useRouter } from 'expo-router';
import {
  ArrowLeft,
  Pill,
  Clock,
  Calendar,
  Plus,
  X,
  Volume2 as VolumeUp,
  CheckCircle2,
  AlertCircle
} from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Speech from 'expo-speech';
import * as Haptics from 'expo-haptics';
import { useAuth } from '@/hooks/useAuth';
import { useLanguage } from '@/hooks/useLanguage';
import { useMedications } from '@/hooks/useMedications';

const FREQUENCY_OPTIONS = [
  { label: 'Once daily', value: 'once_daily', times: 1 },
  { label: 'Twice daily', value: 'twice_daily', times: 2 },
  { label: 'Three times daily', value: 'three_times_daily', times: 3 },
  { label: 'Four times daily', value: 'four_times_daily', times: 4 },
  { label: 'Every other day', value: 'every_other_day', times: 1 },
  { label: 'Weekly', value: 'weekly', times: 1 },
  { label: 'As needed', value: 'as_needed', times: 0 }
];

const DEFAULT_TIMES = {
  1: ['08:00'],
  2: ['08:00', '20:00'],
  3: ['08:00', '13:00', '20:00'],
  4: ['08:00', '12:00', '16:00', '20:00']
};

export default function AddMedicationScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { t } = useLanguage();
  const { addMedication } = useMedications(user?.id || '');

  const [formData, setFormData] = useState({
    name: '',
    dosage: '',
    frequency: 'once_daily',
    times_per_day: 1,
    time_of_day: ['08:00'],
    instructions: '',
    side_effects: [] as string[],
    start_date: new Date().toISOString(),
    end_date: '',
    refill_date: '',
    reminder_enabled: true,
    caregiver_alerts: false
  });

  const [sideEffectInput, setSideEffectInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Medication name is required';
    }

    if (!formData.dosage.trim()) {
      newErrors.dosage = 'Dosage is required';
    }

    if (formData.times_per_day > 0 && formData.time_of_day.length === 0) {
      newErrors.time_of_day = 'At least one time is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleFrequencyChange = (frequency: string, times: number) => {
    const defaultTimes = times > 0 ? DEFAULT_TIMES[times as keyof typeof DEFAULT_TIMES] || ['08:00'] : [];
    
    setFormData(prev => ({
      ...prev,
      frequency,
      times_per_day: times,
      time_of_day: defaultTimes
    }));
  };

  const handleTimeChange = (index: number, time: string) => {
    const newTimes = [...formData.time_of_day];
    newTimes[index] = time;
    setFormData(prev => ({ ...prev, time_of_day: newTimes }));
  };

  const addSideEffect = () => {
    if (sideEffectInput.trim() && !formData.side_effects.includes(sideEffectInput.trim())) {
      setFormData(prev => ({
        ...prev,
        side_effects: [...prev.side_effects, sideEffectInput.trim()]
      }));
      setSideEffectInput('');
    }
  };

  const removeSideEffect = (index: number) => {
    setFormData(prev => ({
      ...prev,
      side_effects: prev.side_effects.filter((_, i) => i !== index)
    }));
  };

  const speakInstructions = async () => {
    if (Platform.OS === 'web') return;

    const message = `Adding medication: ${formData.name || 'medication name'}, ${formData.dosage || 'dosage'}, ${formData.frequency.replace('_', ' ')}. Please fill in all required fields.`;
    
    try {
      await Speech.speak(message, { rate: 0.8, pitch: 1.0 });
    } catch (error) {
      console.error('Error speaking instructions:', error);
    }
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
      return;
    }

    setLoading(true);
    
    try {
      await addMedication({
        ...formData,
        adherence_rate: 100,
        current_streak: 0,
        total_doses: 0,
        missed_doses: 0,
        active: true
      });

      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      
      if (Platform.OS !== 'web') {
        await Speech.speak(`Successfully added ${formData.name} to your medication list.`, {
          rate: 0.8,
          pitch: 1.0
        });
      }

      router.back();
    } catch (error) {
      console.error('Error adding medication:', error);
      Alert.alert('Error', 'Failed to add medication. Please try again.');
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <ArrowLeft color="#007AFF" size={24} />
        </TouchableOpacity>
        <Text style={styles.title}>Add Medication</Text>
        <TouchableOpacity style={styles.speakButton} onPress={speakInstructions}>
          <VolumeUp color="#007AFF" size={24} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Basic Information</Text>
          
          <View style={styles.formGroup}>
            <Text style={styles.label}>Medication Name *</Text>
            <TextInput
              style={[styles.input, errors.name && styles.inputError]}
              value={formData.name}
              onChangeText={(text) => setFormData(prev => ({ ...prev, name: text }))}
              placeholder="Enter medication name"
              placeholderTextColor="#999"
              autoCapitalize="words"
            />
            {errors.name && (
              <View style={styles.errorContainer}>
                <AlertCircle color="#FF3B30" size={16} />
                <Text style={styles.errorText}>{errors.name}</Text>
              </View>
            )}
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Dosage *</Text>
            <TextInput
              style={[styles.input, errors.dosage && styles.inputError]}
              value={formData.dosage}
              onChangeText={(text) => setFormData(prev => ({ ...prev, dosage: text }))}
              placeholder="e.g., 10mg, 1 tablet"
              placeholderTextColor="#999"
            />
            {errors.dosage && (
              <View style={styles.errorContainer}>
                <AlertCircle color="#FF3B30" size={16} />
                <Text style={styles.errorText}>{errors.dosage}</Text>
              </View>
            )}
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Instructions</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={formData.instructions}
              onChangeText={(text) => setFormData(prev => ({ ...prev, instructions: text }))}
              placeholder="e.g., Take with food, Take on empty stomach"
              placeholderTextColor="#999"
              multiline
              numberOfLines={3}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Frequency & Timing</Text>
          
          <View style={styles.frequencyGrid}>
            {FREQUENCY_OPTIONS.map((option) => (
              <TouchableOpacity
                key={option.value}
                style={[
                  styles.frequencyOption,
                  formData.frequency === option.value && styles.frequencySelected
                ]}
                onPress={() => handleFrequencyChange(option.value, option.times)}
              >
                <Text style={[
                  styles.frequencyText,
                  formData.frequency === option.value && styles.frequencyTextSelected
                ]}>
                  {option.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {formData.times_per_day > 0 && (
            <View style={styles.timesContainer}>
              <Text style={styles.label}>Times of Day</Text>
              {formData.time_of_day.map((time, index) => (
                <View key={index} style={styles.timeInput}>
                  <Clock color="#666" size={20} />
                  <TextInput
                    style={styles.timeField}
                    value={time}
                    onChangeText={(text) => handleTimeChange(index, text)}
                    placeholder="HH:MM"
                    placeholderTextColor="#999"
                  />
                </View>
              ))}
              {errors.time_of_day && (
                <View style={styles.errorContainer}>
                  <AlertCircle color="#FF3B30" size={16} />
                  <Text style={styles.errorText}>{errors.time_of_day}</Text>
                </View>
              )}
            </View>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Side Effects</Text>
          
          <View style={styles.sideEffectInput}>
            <TextInput
              style={styles.sideEffectField}
              value={sideEffectInput}
              onChangeText={setSideEffectInput}
              placeholder="Add a side effect"
              placeholderTextColor="#999"
              onSubmitEditing={addSideEffect}
              returnKeyType="done"
            />
            <TouchableOpacity style={styles.addButton} onPress={addSideEffect}>
              <Plus color="#007AFF" size={20} />
            </TouchableOpacity>
          </View>

          {formData.side_effects.length > 0 && (
            <View style={styles.sideEffectsList}>
              {formData.side_effects.map((effect, index) => (
                <View key={index} style={styles.sideEffectChip}>
                  <Text style={styles.sideEffectText}>{effect}</Text>
                  <TouchableOpacity onPress={() => removeSideEffect(index)}>
                    <X color="#666" size={16} />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Alerts & Reminders</Text>
          
          <TouchableOpacity
            style={styles.toggleOption}
            onPress={() => setFormData(prev => ({ ...prev, reminder_enabled: !prev.reminder_enabled }))}
          >
            <View style={styles.toggleInfo}>
              <Text style={styles.toggleLabel}>Enable Reminders</Text>
              <Text style={styles.toggleDescription}>Get notified when it's time to take your medication</Text>
            </View>
            <View style={[styles.toggle, formData.reminder_enabled && styles.toggleActive]}>
              {formData.reminder_enabled && <CheckCircle2 color="#FFF" size={16} />}
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.toggleOption}
            onPress={() => setFormData(prev => ({ ...prev, caregiver_alerts: !prev.caregiver_alerts }))}
          >
            <View style={styles.toggleInfo}>
              <Text style={styles.toggleLabel}>Caregiver Alerts</Text>
              <Text style={styles.toggleDescription}>Notify caregivers about missed doses</Text>
            </View>
            <View style={[styles.toggle, formData.caregiver_alerts && styles.toggleActive]}>
              {formData.caregiver_alerts && <CheckCircle2 color="#FFF" size={16} />}
            </View>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.submitButton, loading && styles.submitButtonDisabled]}
          onPress={handleSubmit}
          disabled={loading}
        >
          <LinearGradient
            colors={loading ? ['#999', '#999'] : ['#007AFF', '#0055FF']}
            style={styles.submitGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Pill color="#FFF" size={20} />
            <Text style={styles.submitText}>
              {loading ? 'Adding Medication...' : 'Add Medication'}
            </Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
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
    justifyContent: 'space-between',
    padding: 16,
    paddingTop: 60,
    backgroundColor: '#FFFFFF',
  },
  backButton: {
    padding: 8,
  },
  title: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    color: '#000000',
  },
  speakButton: {
    padding: 8,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  section: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#000000',
    marginBottom: 16,
  },
  formGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#000000',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#E5E5EA',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#000000',
    backgroundColor: '#FFFFFF',
  },
  inputError: {
    borderColor: '#FF3B30',
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  errorText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#FF3B30',
    marginLeft: 4,
  },
  frequencyGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  frequencyOption: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E5E5EA',
    backgroundColor: '#FFFFFF',
  },
  frequencySelected: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  frequencyText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#000000',
  },
  frequencyTextSelected: {
    color: '#FFFFFF',
  },
  timesContainer: {
    marginTop: 16,
  },
  timeInput: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F8F8',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  timeField: {
    flex: 1,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#000000',
    marginLeft: 8,
  },
  sideEffectInput: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  sideEffectField: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#E5E5EA',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#000000',
    backgroundColor: '#FFFFFF',
  },
  addButton: {
    backgroundColor: '#007AFF',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sideEffectsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  sideEffectChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F8F8',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    gap: 4,
  },
  sideEffectText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#000000',
  },
  toggleOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  toggleInfo: {
    flex: 1,
  },
  toggleLabel: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#000000',
  },
  toggleDescription: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#666666',
    marginTop: 2,
  },
  toggle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#E5E5EA',
    alignItems: 'center',
    justifyContent: 'center',
  },
  toggleActive: {
    backgroundColor: '#007AFF',
  },
  footer: {
    padding: 16,
    backgroundColor: '#FFFFFF',
  },
  submitButton: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    gap: 8,
  },
  submitText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
  },
}); 