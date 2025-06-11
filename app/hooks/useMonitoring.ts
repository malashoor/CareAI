import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import type { User } from '@/types/user';

interface HealthMetric {
  id: string;
  user_id: string;
  type: 'heart_rate' | 'blood_pressure' | 'temperature';
  value: number;
  timestamp: string;
  status: 'normal' | 'attention' | 'critical';
}

interface MedicationStatus {
  id: string;
  user_id: string;
  medication_id: string;
  status: 'taken' | 'missed' | 'upcoming';
  scheduled_time: string;
  taken_time?: string;
}

export function useMonitoring(monitoredUserId: string) {
  const [healthMetrics, setHealthMetrics] = useState<HealthMetric[]>([]);
  const [medications, setMedications] = useState<MedicationStatus[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Subscribe to real-time health metrics updates
    const healthSubscription = supabase
      .channel('health_metrics')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'health_metrics',
          filter: `user_id=eq.${monitoredUserId}`
        },
        (payload) => {
          if (payload.new) {
            setHealthMetrics(current => {
              const filtered = current.filter(m => m.id !== payload.new.id);
              return [...filtered, payload.new as HealthMetric].sort(
                (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
              );
            });
          }
        }
      )
      .subscribe();

    // Subscribe to medication status updates
    const medicationSubscription = supabase
      .channel('medication_status')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'medication_status',
          filter: `user_id=eq.${monitoredUserId}`
        },
        (payload) => {
          if (payload.new) {
            setMedications(current => {
              const filtered = current.filter(m => m.id !== payload.new.id);
              return [...filtered, payload.new as MedicationStatus].sort(
                (a, b) => new Date(b.scheduled_time).getTime() - new Date(a.scheduled_time).getTime()
              );
            });
          }
        }
      )
      .subscribe();

    // Initial data fetch
    Promise.all([
      supabase
        .from('health_metrics')
        .select('*')
        .eq('user_id', monitoredUserId)
        .order('timestamp', { ascending: false })
        .limit(10),
      supabase
        .from('medication_status')
        .select('*')
        .eq('user_id', monitoredUserId)
        .order('scheduled_time', { ascending: false })
        .limit(10)
    ]).then(([healthData, medicationData]) => {
      if (healthData.data) setHealthMetrics(healthData.data as HealthMetric[]);
      if (medicationData.data) setMedications(medicationData.data as MedicationStatus[]);
      setLoading(false);
    });

    return () => {
      healthSubscription.unsubscribe();
      medicationSubscription.unsubscribe();
    };
  }, [monitoredUserId]);

  return {
    healthMetrics,
    medications,
    loading,
    hasAbnormalMetrics: healthMetrics.some(m => m.status !== 'normal'),
    hasMissedMedications: medications.some(m => m.status === 'missed')
  };
}