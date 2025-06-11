import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

interface DeliveryAddress {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  instructions?: string;
}

interface DeliveryLocation {
  id: string;
  user_id: string;
  address: DeliveryAddress;
  is_default: boolean;
  created_at: string;
  updated_at: string;
}

export function useDeliveryLocations(userId: string) {
  const [locations, setLocations] = useState<DeliveryLocation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLocations();

    const subscription = supabase
      .channel('delivery_locations')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'delivery_locations',
          filter: `user_id=eq.${userId}`
        },
        (payload) => {
          if (payload.new) {
            loadLocations();
          }
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [userId]);

  const loadLocations = async () => {
    const { data, error } = await supabase
      .from('delivery_locations')
      .select('*')
      .eq('user_id', userId)
      .order('is_default', { ascending: false });

    if (error) {
      console.error('Error loading delivery locations:', error);
      return;
    }

    setLocations(data || []);
    setLoading(false);
  };

  const addLocation = async (address: DeliveryAddress, isDefault: boolean = false) => {
    if (isDefault) {
      // Clear existing default
      await supabase
        .from('delivery_locations')
        .update({ is_default: false })
        .eq('user_id', userId)
        .eq('is_default', true);
    }

    const { data, error } = await supabase
      .from('delivery_locations')
      .insert({
        user_id: userId,
        address,
        is_default: isDefault
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  };

  const updateLocation = async (
    locationId: string,
    address: DeliveryAddress,
    isDefault: boolean = false
  ) => {
    if (isDefault) {
      // Clear existing default
      await supabase
        .from('delivery_locations')
        .update({ is_default: false })
        .eq('user_id', userId)
        .eq('is_default', true);
    }

    const { data, error } = await supabase
      .from('delivery_locations')
      .update({
        address,
        is_default: isDefault,
        updated_at: new Date().toISOString()
      })
      .eq('id', locationId)
      .select()
      .single();

    if (error) throw error;
    return data;
  };

  const deleteLocation = async (locationId: string) => {
    const { error } = await supabase
      .from('delivery_locations')
      .delete()
      .eq('id', locationId);

    if (error) throw error;
  };

  return {
    locations,
    loading,
    addLocation,
    updateLocation,
    deleteLocation,
    defaultLocation: locations.find(l => l.is_default)
  };
}