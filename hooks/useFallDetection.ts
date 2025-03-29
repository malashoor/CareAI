import { useState, useEffect } from 'react';
import { Platform } from 'react-native';
import * as Speech from 'expo-speech';
import { supabase } from '@/lib/supabase';

interface FallEvent {
  id: string;
  user_id: string;
  detected_at: string;
  location?: {
    latitude: number;
    longitude: number;
    accuracy: number;
  };
  severity: 'low' | 'medium' | 'high';
  response_status: 'detected' | 'notified' | 'responded' | 'resolved';
  responder_id?: string;
  device_data: any;
  notes?: string;
}

export function useFallDetection(userId: string) {
  const [events, setEvents] = useState<FallEvent[]>([]);
  const [monitoring, setMonitoring] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadEvents();

    const subscription = supabase
      .channel('fall_events')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'fall_detection_events',
          filter: `user_id=eq.${userId}`
        },
        (payload) => {
          if (payload.new) {
            handleNewEvent(payload.new as FallEvent);
          }
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [userId]);

  const loadEvents = async () => {
    const { data, error } = await supabase
      .from('fall_detection_events')
      .select(`
        *,
        responder:profiles!fall_detection_events_responder_id_fkey(
          id, name, role
        )
      `)
      .eq('user_id', userId)
      .order('detected_at', { ascending: false });

    if (error) {
      console.error('Error loading fall events:', error);
      return;
    }

    setEvents(data || []);
    setLoading(false);
  };

  const handleNewEvent = async (event: FallEvent) => {
    setEvents(current => [event, ...current]);

    // Trigger emergency notifications
    if (event.severity === 'high') {
      if (Platform.OS !== 'web') {
        Speech.speak(
          'Fall detected! Emergency contacts are being notified. Please respond if you are able.',
          {
            rate: 0.8,
            pitch: 1.0,
            volume: 1.0
          }
        );
      }

      // Notify emergency contacts
      const { data: contacts } = await supabase
        .from('profiles')
        .select('emergency_contacts')
        .eq('id', userId)
        .single();

      if (contacts?.emergency_contacts) {
        // In production, implement actual emergency contact notification
        console.log('Notifying emergency contacts:', contacts.emergency_contacts);
      }
    }
  };

  const recordFallEvent = async (
    severity: 'low' | 'medium' | 'high',
    location?: { latitude: number; longitude: number; accuracy: number },
    deviceData: any = {}
  ) => {
    const { data, error } = await supabase
      .from('fall_detection_events')
      .insert({
        user_id: userId,
        detected_at: new Date().toISOString(),
        location,
        severity,
        response_status: 'detected',
        device_data: deviceData
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  };

  const updateEventStatus = async (
    eventId: string,
    status: 'notified' | 'responded' | 'resolved',
    responderId?: string,
    notes?: string
  ) => {
    const { data, error } = await supabase
      .from('fall_detection_events')
      .update({
        response_status: status,
        responder_id: responderId,
        notes,
        updated_at: new Date().toISOString()
      })
      .eq('id', eventId)
      .select()
      .single();

    if (error) throw error;
    return data;
  };

  const startMonitoring = () => {
    setMonitoring(true);
    // In production, implement actual device monitoring
  };

  const stopMonitoring = () => {
    setMonitoring(false);
  };

  return {
    events,
    monitoring,
    loading,
    recordFallEvent,
    updateEventStatus,
    startMonitoring,
    stopMonitoring,
    recentEvents: events.slice(0, 5),
    hasActiveEvents: events.some(e => e.response_status !== 'resolved'),
    criticalEvents: events.filter(e => e.severity === 'high' && e.response_status !== 'resolved')
  };
}