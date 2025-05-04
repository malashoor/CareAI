import { useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { GiftedUser, GiftedUserFilters, GiftedUserFormData } from '@/types/giftedUser';
import { AdminGiftingService } from '@/services/AdminGiftingService';
import { useVoiceFeedback } from '@/hooks/useVoiceFeedback';
import { t } from '@/i18n';

export function useAdminGifting() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [giftedUsers, setGiftedUsers] = useState<GiftedUser[]>([]);
  const { speak } = useVoiceFeedback();

  const fetchGiftedUsers = useCallback(async (filters?: GiftedUserFilters) => {
    setLoading(true);
    setError(null);
    try {
      let query = supabase
        .from('gifted_users')
        .select('*')
        .order('created_at', { ascending: false });

      if (filters?.region) {
        query = query.eq('region', filters.region);
      }
      if (filters?.status) {
        query = query.eq('status', filters.status);
      }
      if (filters?.charity_name) {
        query = query.eq('charity_name', filters.charity_name);
      }
      if (filters?.search) {
        query = query.or(`full_name.ilike.%${filters.search}%,email.ilike.%${filters.search}%`);
      }

      const { data, error: supabaseError } = await query;

      if (supabaseError) throw supabaseError;
      setGiftedUsers(data || []);
      speak(t('admin.giftedUsers.loaded'));
    } catch (err) {
      setError(err.message);
      speak(t('admin.giftedUsers.error'));
    } finally {
      setLoading(false);
    }
  }, [speak]);

  const addGiftedUser = useCallback(async (userData: GiftedUserFormData) => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: supabaseError } = await supabase
        .from('gifted_users')
        .insert([userData])
        .select()
        .single();

      if (supabaseError) throw supabaseError;
      
      setGiftedUsers(prev => [data, ...prev]);
      speak(t('admin.giftedUsers.added'));
      
      // Generate default reminders
      await AdminGiftingService.generateDefaultReminders(data.id);
    } catch (err) {
      setError(err.message);
      speak(t('admin.giftedUsers.error'));
    } finally {
      setLoading(false);
    }
  }, [speak]);

  const updateGiftedUser = useCallback(async (
    userId: string,
    updates: Partial<GiftedUserFormData>
  ) => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: supabaseError } = await supabase
        .from('gifted_users')
        .update(updates)
        .match({ id: userId })
        .select()
        .single();

      if (supabaseError) throw supabaseError;
      
      setGiftedUsers(prev =>
        prev.map(user => (user.id === userId ? data : user))
      );
      speak(t('admin.giftedUsers.updated'));
    } catch (err) {
      setError(err.message);
      speak(t('admin.giftedUsers.error'));
    } finally {
      setLoading(false);
    }
  }, [speak]);

  const sendInvite = useCallback(async (userId: string) => {
    setLoading(true);
    setError(null);
    try {
      const user = giftedUsers.find(u => u.id === userId);
      if (!user) throw new Error('User not found');

      await AdminGiftingService.sendInvite(user.email, user.phone);
      await updateGiftedUser(userId, { status: 'invited' });
      speak(t('admin.giftedUsers.inviteSent'));
    } catch (err) {
      setError(err.message);
      speak(t('admin.giftedUsers.error'));
    } finally {
      setLoading(false);
    }
  }, [giftedUsers, updateGiftedUser, speak]);

  return {
    loading,
    error,
    giftedUsers,
    fetchGiftedUsers,
    addGiftedUser,
    updateGiftedUser,
    sendInvite,
  };
} 