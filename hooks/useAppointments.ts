import { useState, useEffect } from 'react';
import { Platform } from 'react-native';
import * as Speech from 'expo-speech';
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

  useEffect(() => {
    loadAppointments();

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

    if (error) {
      console.error('Error loading appointments:', error);
      return;
    }

    setAppointments(data || []);
    setLoading(false);
  };

  const createAppointment = async (
    seniorId: string,
    appointment: Omit<Appointment, 'id' | 'professional_id' | 'created_at' | 'updated_at'>
  ) => {
    const { data, error } = await supabase
      .from('appointments')
      .insert({
        ...appointment,
        senior_id: seniorId,
        professional_id: userId,
      })
      .select()
      .single();

    if (error) throw error;

    // Schedule reminders
    await createReminders(data.id, appointment.start_time, appointment.reminder_preferences);

    // Send confirmation notification
    if (Platform.OS !== 'web') {
      Speech.speak(
        `New appointment scheduled for ${new Date(appointment.start_time).toLocaleDateString()}`,
        { rate: 0.8, pitch: 1.0 }
      );
    }

    return data;
  };

  const updateAppointment = async (
    appointmentId: string,
    updates: Partial<Appointment>
  ) => {
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

    return data;
  };

  const cancelAppointment = async (appointmentId: string) => {
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
  };

  const createReminders = async (
    appointmentId: string,
    startTime: string,
    preferences: ReminderPreferences
  ) => {
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

    if (error) throw error;
  };

  const updateReminders = async (
    appointmentId: string,
    startTime: string,
    preferences: ReminderPreferences
  ) => {
    // Cancel existing pending reminders
    await supabase
      .from('appointment_reminders')
      .update({ status: 'cancelled' })
      .eq('appointment_id', appointmentId)
      .eq('status', 'pending');

    // Create new reminders
    await createReminders(appointmentId, startTime, preferences);
  };

  return {
    appointments,
    loading,
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