import { useState, useEffect } from 'react';
import { Platform } from 'react-native';
import * as Speech from 'expo-speech';
import * as Haptics from 'expo-haptics';
import { supabase } from '@/lib/supabase';

export interface Medication {
  id: string;
  user_id: string;
  name: string;
  dosage: string;
  frequency: string;
  times_per_day: number;
  time_of_day: string[];
  instructions?: string;
  side_effects?: string[];
  image_url?: string;
  start_date: string;
  end_date?: string;
  refill_date?: string;
  days_remaining?: number;
  adherence_rate: number;
  current_streak: number;
  total_doses: number;
  missed_doses: number;
  last_taken?: string;
  reminder_enabled: boolean;
  caregiver_alerts: boolean;
  created_at: string;
  updated_at: string;
}

export interface MedicationReminder {
  id: string;
  medication_id: string;
  time: string;
  enabled: boolean;
  sound_enabled: boolean;
  vibration_enabled: boolean;
}

export interface MedicationDose {
  id: string;
  medication_id: string;
  scheduled_time: string;
  taken_time?: string;
  status: 'scheduled' | 'taken' | 'missed' | 'late';
  notes?: string;
}

export interface AdherenceStats {
  weeklyRate: number;
  monthlyRate: number;
  currentStreak: number;
  bestStreak: number;
  totalMedications: number;
  onTimeDoses: number;
  missedDoses: number;
  insights: string[];
}

export function useMedications(userId: string) {
  const [medications, setMedications] = useState<Medication[]>([]);
  const [reminders, setReminders] = useState<MedicationReminder[]>([]);
  const [doses, setDoses] = useState<MedicationDose[]>([]);
  const [adherenceStats, setAdherenceStats] = useState<AdherenceStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (userId) {
      loadMedications();
      loadReminders();
      loadRecentDoses();
      calculateAdherenceStats();
    }

    // Set up real-time subscriptions
    const medicationsSubscription = supabase
      .channel('medications')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'medications',
          filter: `user_id=eq.${userId}`
        },
        () => {
          loadMedications();
          calculateAdherenceStats();
        }
      )
      .subscribe();

    const dosesSubscription = supabase
      .channel('medication_doses')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'medication_doses',
          filter: `medication_id=in.(${medications.map(m => m.id).join(',')})`
        },
        () => {
          loadRecentDoses();
          calculateAdherenceStats();
        }
      )
      .subscribe();

    return () => {
      medicationsSubscription.unsubscribe();
      dosesSubscription.unsubscribe();
    };
  }, [userId]);

  const loadMedications = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('medications')
        .select('*')
        .eq('user_id', userId)
        .eq('active', true)
        .order('created_at', { ascending: false });

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      // If no data exists, create sample medications for demo
      if (!data || data.length === 0) {
        await createSampleMedications();
        return;
      }

      setMedications(data || []);
    } catch (error) {
      console.error('Error loading medications:', error);
      setError('Failed to load medications');
    } finally {
      setLoading(false);
    }
  };

  const createSampleMedications = async () => {
    const sampleMedications = [
      {
        user_id: userId,
        name: 'Lisinopril',
        dosage: '10mg',
        frequency: 'Once daily',
        times_per_day: 1,
        time_of_day: ['08:00'],
        instructions: 'Take with breakfast for better absorption',
        side_effects: ['Mild dizziness', 'Dry cough'],
        image_url: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?q=80&w=200&auto=format&fit=crop',
        start_date: new Date().toISOString(),
        refill_date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
        days_remaining: 14,
        adherence_rate: 95,
        current_streak: 7,
        total_doses: 30,
        missed_doses: 2,
        reminder_enabled: true,
        caregiver_alerts: true,
        active: true
      },
      {
        user_id: userId,
        name: 'Metformin',
        dosage: '500mg',
        frequency: 'Twice daily',
        times_per_day: 2,
        time_of_day: ['08:00', '19:00'],
        instructions: 'Take with meals to reduce side effects',
        side_effects: ['Nausea when taken on empty stomach'],
        image_url: 'https://images.unsplash.com/photo-1587854692152-cbe660dbde88?q=80&w=200&auto=format&fit=crop',
        start_date: new Date().toISOString(),
        refill_date: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000).toISOString(),
        days_remaining: 21,
        adherence_rate: 88,
        current_streak: 4,
        total_doses: 60,
        missed_doses: 5,
        reminder_enabled: true,
        caregiver_alerts: true,
        active: true
      }
    ];

    for (const medication of sampleMedications) {
      await supabase.from('medications').insert(medication);
    }

    await loadMedications();
  };

  const loadReminders = async () => {
    try {
      const { data, error } = await supabase
        .from('medication_reminders')
        .select('*')
        .in('medication_id', medications.map(m => m.id));

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      setReminders(data || []);
    } catch (error) {
      console.error('Error loading reminders:', error);
    }
  };

  const loadRecentDoses = async () => {
    try {
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      const { data, error } = await supabase
        .from('medication_doses')
        .select('*')
        .in('medication_id', medications.map(m => m.id))
        .gte('scheduled_time', sevenDaysAgo.toISOString())
        .order('scheduled_time', { ascending: false });

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      setDoses(data || []);
    } catch (error) {
      console.error('Error loading doses:', error);
    }
  };

  const calculateAdherenceStats = async () => {
    if (medications.length === 0) return;

    try {
      const totalDoses = medications.reduce((sum, med) => sum + med.total_doses, 0);
      const missedDoses = medications.reduce((sum, med) => sum + med.missed_doses, 0);
      const onTimeDoses = totalDoses - missedDoses;

      const weeklyRate = Math.round((onTimeDoses / Math.max(totalDoses, 1)) * 100);
      const monthlyRate = Math.round(weeklyRate * 0.9); // Simulated monthly average
      const currentStreak = Math.max(...medications.map(m => m.current_streak));
      const bestStreak = currentStreak + Math.floor(Math.random() * 7); // Simulated best streak

      const insights = generateInsights(medications, weeklyRate);

      setAdherenceStats({
        weeklyRate,
        monthlyRate,
        currentStreak,
        bestStreak,
        totalMedications: medications.length,
        onTimeDoses,
        missedDoses,
        insights
      });
    } catch (error) {
      console.error('Error calculating adherence stats:', error);
    }
  };

  const generateInsights = (meds: Medication[], adherenceRate: number): string[] => {
    const insights: string[] = [];

    if (adherenceRate >= 95) {
      insights.push('Excellent medication adherence! Keep up the great work.');
    } else if (adherenceRate >= 80) {
      insights.push('Good adherence pattern. Consider setting more reminders for missed doses.');
    } else {
      insights.push('Medication adherence needs improvement. Let\'s work on a better routine.');
    }

    const lowAdherenceMeds = meds.filter(m => m.adherence_rate < 80);
    if (lowAdherenceMeds.length > 0) {
      insights.push(`Focus on improving adherence for ${lowAdherenceMeds[0].name}.`);
    }

    const medsNeedingRefill = meds.filter(m => m.days_remaining && m.days_remaining <= 7);
    if (medsNeedingRefill.length > 0) {
      insights.push(`${medsNeedingRefill.length} medication(s) need refill soon.`);
    }

    return insights;
  };

  const addMedication = async (medicationData: Omit<Medication, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data, error } = await supabase
        .from('medications')
        .insert({
          ...medicationData,
          user_id: userId,
          active: true
        })
        .select()
        .single();

      if (error) throw error;

      await speakText(`Added ${medicationData.name} to your medication list.`);
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

      return data;
    } catch (error) {
      console.error('Error adding medication:', error);
      throw error;
    }
  };

  const updateMedication = async (medicationId: string, updates: Partial<Medication>) => {
    try {
      const { data, error } = await supabase
        .from('medications')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', medicationId)
        .select()
        .single();

      if (error) throw error;

      setMedications(current =>
        current.map(med => med.id === medicationId ? { ...med, ...updates } : med)
      );

      return data;
    } catch (error) {
      console.error('Error updating medication:', error);
      throw error;
    }
  };

  const deleteMedication = async (medicationId: string) => {
    try {
      const { error } = await supabase
        .from('medications')
        .update({ active: false })
        .eq('id', medicationId);

      if (error) throw error;

      setMedications(current => current.filter(med => med.id !== medicationId));
      await speakText('Medication removed from your list.');
    } catch (error) {
      console.error('Error deleting medication:', error);
      throw error;
    }
  };

  const recordDose = async (medicationId: string, status: 'taken' | 'missed' = 'taken') => {
    try {
      const medication = medications.find(m => m.id === medicationId);
      if (!medication) return;

      const { data, error } = await supabase
        .from('medication_doses')
        .insert({
          medication_id: medicationId,
          scheduled_time: new Date().toISOString(),
          taken_time: status === 'taken' ? new Date().toISOString() : null,
          status
        })
        .select()
        .single();

      if (error) throw error;

      // Update medication adherence
      const newStreak = status === 'taken' ? medication.current_streak + 1 : 0;
      const newAdherenceRate = status === 'taken' 
        ? Math.min(100, medication.adherence_rate + 1)
        : Math.max(0, medication.adherence_rate - 2);

      await updateMedication(medicationId, {
        current_streak: newStreak,
        adherence_rate: newAdherenceRate,
        last_taken: status === 'taken' ? new Date().toISOString() : medication.last_taken,
        total_doses: medication.total_doses + 1,
        missed_doses: status === 'missed' ? medication.missed_doses + 1 : medication.missed_doses
      });

      if (status === 'taken') {
        await speakText('Great job taking your medication! Keep up the good work!');
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }

      return data;
    } catch (error) {
      console.error('Error recording dose:', error);
      throw error;
    }
  };

  const toggleReminders = async (medicationId: string, enabled: boolean) => {
    try {
      await updateMedication(medicationId, { reminder_enabled: enabled });
      await speakText(`Reminders ${enabled ? 'enabled' : 'disabled'} for this medication.`);
    } catch (error) {
      console.error('Error toggling reminders:', error);
      throw error;
    }
  };

  const toggleCaregiverAlerts = async (medicationId: string, enabled: boolean) => {
    try {
      await updateMedication(medicationId, { caregiver_alerts: enabled });
      await speakText(`Caregiver alerts ${enabled ? 'enabled' : 'disabled'} for this medication.`);
    } catch (error) {
      console.error('Error toggling caregiver alerts:', error);
      throw error;
    }
  };

  const scanMedicationInfo = async (imagePath: string): Promise<{ name: string; dosage: string } | null> => {
    // Mock OCR functionality - in production, integrate with Google Vision API or AWS Textract
    const mockResults = [
      { name: 'Aspirin', dosage: '81mg' },
      { name: 'Ibuprofen', dosage: '200mg' },
      { name: 'Acetaminophen', dosage: '500mg' },
      { name: 'Vitamin D3', dosage: '1000 IU' },
      { name: 'Calcium', dosage: '600mg' }
    ];

    // Simulate processing time
    await new Promise(resolve => setTimeout(resolve, 2000));

    const result = mockResults[Math.floor(Math.random() * mockResults.length)];
    await speakText(`Detected ${result.name}, ${result.dosage}. Please verify this information before adding.`);
    
    return result;
  };

  const speakText = async (text: string) => {
    if (Platform.OS !== 'web') {
      try {
        await Speech.speak(text, {
          rate: 0.8,
          pitch: 1.0,
        });
      } catch (error) {
        console.error('Error speaking text:', error);
      }
    }
  };

  return {
    medications,
    reminders,
    doses,
    adherenceStats,
    loading,
    error,
    addMedication,
    updateMedication,
    deleteMedication,
    recordDose,
    toggleReminders,
    toggleCaregiverAlerts,
    scanMedicationInfo,
    todaysMedications: medications.filter(med => {
      const now = new Date();
      return med.time_of_day.some(time => {
        const [hour, minute] = time.split(':');
        const medicationTime = new Date();
        medicationTime.setHours(parseInt(hour), parseInt(minute), 0, 0);
        return medicationTime <= now;
      });
    }),
    upcomingMedications: medications.filter(med => {
      const now = new Date();
      return med.time_of_day.some(time => {
        const [hour, minute] = time.split(':');
        const medicationTime = new Date();
        medicationTime.setHours(parseInt(hour), parseInt(minute), 0, 0);
        return medicationTime > now;
      });
    }),
    medicationsNeedingRefill: medications.filter(med => 
      med.days_remaining && med.days_remaining <= 7
    )
  };
} 