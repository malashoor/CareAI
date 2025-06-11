import { useState, useEffect } from 'react';
import { Platform } from 'react-native';
import * as Speech from 'expo-speech';
import * as Haptics from 'expo-haptics';
import { supabase } from '@/lib/supabase';
import type { User } from '@/types/user';

interface Location {
  name: string;
  address: string;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
}

interface ReminderPreferences {
  advance_notice: number; // hours
  pre_appointment_notice: number; // minutes
  notification_type: 'text' | 'voice' | 'both';
}

export interface Appointment {
  id: string;
  senior_id: string;
  professional_id: string;
  title: string;
  description?: string;
  location: Location;
  start_time: string;
  end_time: string;
  status: 'scheduled' | 'confirmed' | 'cancelled' | 'completed';
  instructions?: string;
  reminder_preferences: ReminderPreferences;
  created_at: string;
  updated_at: string;
  senior?: User;
  professional?: User;
}

export function useAppointments(userId: string, role: 'senior' | 'medical') {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (userId) {
      loadAppointments();
    }

    const subscription = supabase
      .channel('appointments')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'appointments',
          filter: role === 'senior' 
            ? `senior_id=eq.${userId}`
            : `professional_id=eq.${userId}`
        },
        () => {
          loadAppointments();
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [userId, role]);

  const loadAppointments = async () => {
    try {
      setLoading(true);
      const query = supabase
        .from('appointments')
        .select(`
          *,
          senior:profiles!appointments_senior_id_fkey(id, name, avatar_url, role),
          professional:profiles!appointments_professional_id_fkey(id, name, avatar_url, role)
        `)
        .order('start_time', { ascending: true });

      if (role === 'senior') {
        query.eq('senior_id', userId);
      } else {
        query.eq('professional_id', userId);
      }

      const { data, error } = await query;

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      // If no data exists, create sample appointments for demo
      if (!data || data.length === 0) {
        await createSampleAppointments();
        return;
      }

      setAppointments(data || []);
    } catch (error) {
      console.error('Error loading appointments:', error);
      setError('Failed to load appointments');
    } finally {
      setLoading(false);
    }
  };

  const createSampleAppointments = async () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(10, 0, 0, 0);

    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 7);
    nextWeek.setHours(14, 30, 0, 0);

    const sampleAppointments = [
      {
        senior_id: userId,
        professional_id: 'sample-doctor-1',
        title: 'Regular Checkup',
        description: 'Routine health examination and vital signs check',
        location: {
          name: 'CareAI Medical Center',
          address: '123 Health St, Medical District',
          coordinates: { latitude: 37.7749, longitude: -122.4194 }
        },
        start_time: tomorrow.toISOString(),
        end_time: new Date(tomorrow.getTime() + 60 * 60 * 1000).toISOString(),
        status: 'scheduled' as const,
        instructions: 'Please bring your insurance card and current medication list',
        reminder_preferences: {
          advance_notice: 24,
          pre_appointment_notice: 30,
          notification_type: 'both' as const
        }
      },
      {
        senior_id: userId,
        professional_id: 'sample-doctor-2',
        title: 'Cardiology Consultation',
        description: 'Follow-up appointment for heart health monitoring',
        location: {
          name: 'Heart Health Clinic',
          address: '456 Cardiac Ave, Downtown',
          coordinates: { latitude: 37.7849, longitude: -122.4094 }
        },
        start_time: nextWeek.toISOString(),
        end_time: new Date(nextWeek.getTime() + 45 * 60 * 1000).toISOString(),
        status: 'scheduled' as const,
        instructions: 'Fasting required 12 hours before appointment',
        reminder_preferences: {
          advance_notice: 48,
          pre_appointment_notice: 60,
          notification_type: 'voice' as const
        }
      }
    ];

    for (const appointment of sampleAppointments) {
      await supabase.from('appointments').insert(appointment);
    }

    await loadAppointments();
  };

  const createAppointment = async (
    appointment: Omit<Appointment, 'id' | 'created_at' | 'updated_at'>
  ) => {
    try {
      const { data, error } = await supabase
        .from('appointments')
        .insert({
          ...appointment,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;

      // Schedule reminders
      await createReminders(data.id, appointment.start_time, appointment.reminder_preferences);

      // Send confirmation notification
      if (Platform.OS !== 'web') {
        await Speech.speak(
          `New appointment scheduled for ${new Date(appointment.start_time).toLocaleDateString()}`,
          { rate: 0.8, pitch: 1.0 }
        );
      }

      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      return data;
    } catch (error) {
      console.error('Error creating appointment:', error);
      throw error;
    }
  };

  const updateAppointment = async (
    appointmentId: string,
    updates: Partial<Appointment>
  ) => {
    try {
      const { data, error } = await supabase
        .from('appointments')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', appointmentId)
        .select()
        .single();

      if (error) throw error;

      // Update reminders if time changed
      if (updates.start_time || updates.reminder_preferences) {
        await updateReminders(
          appointmentId,
          updates.start_time || data.start_time,
          updates.reminder_preferences || data.reminder_preferences
        );
      }

      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      return data;
    } catch (error) {
      console.error('Error updating appointment:', error);
      throw error;
    }
  };

  const cancelAppointment = async (appointmentId: string) => {
    try {
      const { error } = await supabase
        .from('appointments')
        .update({
          status: 'cancelled',
          updated_at: new Date().toISOString()
        })
        .eq('id', appointmentId);

      if (error) throw error;

      // Cancel pending reminders
      await supabase
        .from('appointment_reminders')
        .update({ status: 'cancelled' })
        .eq('appointment_id', appointmentId)
        .eq('status', 'pending');

      if (Platform.OS !== 'web') {
        await Speech.speak('Appointment cancelled successfully.', { rate: 0.8, pitch: 1.0 });
      }

      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch (error) {
      console.error('Error cancelling appointment:', error);
      throw error;
    }
  };

  const createReminders = async (
    appointmentId: string,
    startTime: string,
    preferences: ReminderPreferences
  ) => {
    try {
      const start = new Date(startTime);
      const reminders = [
        {
          appointment_id: appointmentId,
          type: 'advance',
          scheduled_time: new Date(start.getTime() - preferences.advance_notice * 60 * 60 * 1000),
          status: 'pending'
        },
        {
          appointment_id: appointmentId,
          type: 'pre_appointment',
          scheduled_time: new Date(start.getTime() - preferences.pre_appointment_notice * 60 * 1000),
          status: 'pending'
        }
      ];

      const { error } = await supabase
        .from('appointment_reminders')
        .insert(reminders);

      if (error && error.code !== 'PGRST116') {
        console.warn('Could not create reminders:', error);
      }
    } catch (error) {
      console.warn('Error creating reminders:', error);
    }
  };

  const updateReminders = async (
    appointmentId: string,
    startTime: string,
    preferences: ReminderPreferences
  ) => {
    try {
      // Cancel existing pending reminders
      await supabase
        .from('appointment_reminders')
        .update({ status: 'cancelled' })
        .eq('appointment_id', appointmentId)
        .eq('status', 'pending');

      // Create new reminders
      await createReminders(appointmentId, startTime, preferences);
    } catch (error) {
      console.warn('Error updating reminders:', error);
    }
  };

  return {
    appointments,
    loading,
    error,
    createAppointment,
    updateAppointment,
    cancelAppointment,
    upcomingAppointments: appointments.filter(
      a => new Date(a.start_time) > new Date() && a.status === 'scheduled'
    ),
    todayAppointments: appointments.filter(
      a => {
        const start = new Date(a.start_time);
        const today = new Date();
        return start.getDate() === today.getDate() &&
               start.getMonth() === today.getMonth() &&
               start.getFullYear() === today.getFullYear() &&
               a.status === 'scheduled';
      }
    )
  };
}