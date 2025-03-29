import { useState, useEffect } from 'react';
import { Platform } from 'react-native';
import * as Speech from 'expo-speech';
import { supabase } from '@/lib/supabase';

interface VoiceMessage {
  id: string;
  from_user_id: string;
  to_user_id: string;
  audio_url: string;
  transcript: string;
  duration: number;
  created_at: string;
  status: 'unread' | 'read';
}

export function useVoiceMessages(userId: string) {
  const [messages, setMessages] = useState<VoiceMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentMessageId, setCurrentMessageId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadMessages();

    const subscription = supabase
      .channel('voice_messages')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'voice_messages',
          filter: `to_user_id=eq.${userId}`
        },
        () => {
          loadMessages();
        }
      )
      .subscribe();

    return () => {
      stopPlayback();
      subscription.unsubscribe();
    };
  }, [userId]);

  const loadMessages = async () => {
    try {
      const { data, error: fetchError } = await supabase
        .from('voice_messages')
        .select('*')
        .eq('to_user_id', userId)
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;
      if (data) setMessages(data as VoiceMessage[]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load messages');
    } finally {
      setLoading(false);
    }
  };

  const playMessage = async (message: VoiceMessage) => {
    try {
      if (isPlaying) {
        await stopPlayback();
      }

      if (Platform.OS === 'web') {
        // For web, use text-to-speech for the transcript
        const options = {
          onStart: () => {
            setIsPlaying(true);
            setCurrentMessageId(message.id);
          },
          onDone: () => {
            setIsPlaying(false);
            setCurrentMessageId(null);
          },
          onError: (error: any) => {
            console.error('Speech playback error:', error);
            setError('Failed to play message');
            setIsPlaying(false);
            setCurrentMessageId(null);
          }
        };

        await Speech.speak(message.transcript, options);
      } else {
        // For native platforms, implement audio playback
        // This would use the audio_url to play the actual recording
      }

      // Mark message as read
      const { error: updateError } = await supabase
        .from('voice_messages')
        .update({ status: 'read' })
        .eq('id', message.id);

      if (updateError) throw updateError;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to play message');
      setIsPlaying(false);
      setCurrentMessageId(null);
    }
  };

  const stopPlayback = async () => {
    try {
      if (isPlaying) {
        if (Platform.OS === 'web') {
          await Speech.stop();
        } else {
          // Implement native audio stop
        }
        setIsPlaying(false);
        setCurrentMessageId(null);
      }
    } catch (err) {
      console.error('Error stopping playback:', err);
    }
  };

  return {
    messages,
    loading,
    error,
    isPlaying,
    currentMessageId,
    playMessage,
    stopPlayback,
    unreadCount: messages.filter(m => m.status === 'unread').length
  };
}