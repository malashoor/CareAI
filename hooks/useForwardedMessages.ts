import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import type { User } from '@/types/user';

interface ForwardedMessage {
  id: string;
  original_message_id: string;
  from_user_id: string;
  to_user_id: string;
  notes: string;
  priority: 'normal' | 'urgent' | 'emergency';
  created_at: string;
  from_user?: User;
  to_user?: User;
  original_message?: {
    audio_url: string;
    transcript: string;
    duration: number;
    context?: any;
  };
}

export function useForwardedMessages(userId: string) {
  const [messages, setMessages] = useState<ForwardedMessage[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Subscribe to new forwarded messages
    const subscription = supabase
      .channel('forwarded_messages')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'forwarded_messages',
          filter: `to_user_id=eq.${userId}`
        },
        (payload) => {
          if (payload.new) {
            loadMessage(payload.new.id);
          }
        }
      )
      .subscribe();

    // Initial fetch
    loadMessages();

    return () => {
      subscription.unsubscribe();
    };
  }, [userId]);

  const loadMessage = async (messageId: string) => {
    const { data } = await supabase
      .from('forwarded_messages')
      .select(`
        *,
        from_user:profiles!forwarded_messages_from_user_id_fkey(id, name, avatar_url, role),
        to_user:profiles!forwarded_messages_to_user_id_fkey(id, name, avatar_url, role),
        original_message:voice_messages(audio_url, transcript, duration, context)
      `)
      .eq('id', messageId)
      .single();

    if (data) {
      setMessages(current => {
        const filtered = current.filter(m => m.id !== data.id);
        return [...filtered, data].sort(
          (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
      });
    }
  };

  const loadMessages = async () => {
    const { data } = await supabase
      .from('forwarded_messages')
      .select(`
        *,
        from_user:profiles!forwarded_messages_from_user_id_fkey(id, name, avatar_url, role),
        to_user:profiles!forwarded_messages_to_user_id_fkey(id, name, avatar_url, role),
        original_message:voice_messages(audio_url, transcript, duration, context)
      `)
      .eq('to_user_id', userId)
      .order('created_at', { ascending: false });

    if (data) {
      setMessages(data);
    }
    setLoading(false);
  };

  const forwardMessage = async (
    originalMessageId: string,
    toUserId: string,
    notes: string,
    priority: 'normal' | 'urgent' | 'emergency' = 'normal'
  ) => {
    const { data, error } = await supabase
      .from('forwarded_messages')
      .insert({
        original_message_id: originalMessageId,
        from_user_id: supabase.auth.user()?.id,
        to_user_id: toUserId,
        notes,
        priority
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  };

  return {
    messages,
    loading,
    forwardMessage,
    urgentCount: messages.filter(m => m.priority === 'urgent').length,
    emergencyCount: messages.filter(m => m.priority === 'emergency').length
  };
}