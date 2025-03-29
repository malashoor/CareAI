import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

interface DeliveryAddress {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  instructions?: string;
}

interface RefillRequest {
  id: string;
  medication_id: string;
  user_id: string;
  status: 'pending' | 'approved' | 'delivered';
  remaining_days: number;
  delivery_address: DeliveryAddress;
  approved_by?: string;
  created_at: string;
  updated_at: string;
  medication?: {
    name: string;
    dosage: string;
  };
}

export function useRefills(userId: string) {
  const [refills, setRefills] = useState<RefillRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRefills();

    // Subscribe to refill updates
    const subscription = supabase
      .channel('refill_updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'medication_refills',
          filter: `user_id=eq.${userId}`
        },
        (payload) => {
          if (payload.new) {
            loadRefills();
          }
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [userId]);

  const loadRefills = async () => {
    const { data, error } = await supabase
      .from('medication_refills')
      .select(`
        *,
        medication:medications(name, dosage)
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error loading refills:', error);
      return;
    }

    setRefills(data || []);
    setLoading(false);
  };

  const requestRefill = async (
    medicationId: string,
    remainingDays: number,
    deliveryAddress: DeliveryAddress
  ) => {
    const { data, error } = await supabase
      .from('medication_refills')
      .insert({
        medication_id: medicationId,
        user_id: userId,
        status: 'pending',
        remaining_days: remainingDays,
        delivery_address: deliveryAddress
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  };

  const approveRefill = async (refillId: string) => {
    const { data, error } = await supabase
      .from('medication_refills')
      .update({
        status: 'approved',
        approved_by: supabase.auth.user()?.id,
        updated_at: new Date().toISOString()
      })
      .eq('id', refillId)
      .select()
      .single();

    if (error) throw error;
    return data;
  };

  const updateDeliveryStatus = async (refillId: string, status: 'delivered') => {
    const { data, error } = await supabase
      .from('medication_refills')
      .update({
        status,
        updated_at: new Date().toISOString()
      })
      .eq('id', refillId)
      .select()
      .single();

    if (error) throw error;
    return data;
  };

  return {
    refills,
    loading,
    requestRefill,
    approveRefill,
    updateDeliveryStatus,
    pendingRefills: refills.filter(r => r.status === 'pending'),
    approvedRefills: refills.filter(r => r.status === 'approved'),
    deliveredRefills: refills.filter(r => r.status === 'delivered')
  };
}