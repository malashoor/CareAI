import { useState, useEffect } from 'react';
import { Platform } from 'react-native';
import * as Speech from 'expo-speech';
import { supabase } from '@/lib/supabase';

interface SocialActivity {
  id: string;
  title: string;
  description: string;
  type: 'fitness' | 'book_club' | 'hobby' | 'support_group' | 'game';
  start_time: string;
  end_time: string;
  max_participants?: number;
  location?: {
    name: string;
    address: string;
    coordinates?: {
      latitude: number;
      longitude: number;
    };
  };
  virtual_meeting_link?: string;
  created_by: string;
  status: 'upcoming' | 'in_progress' | 'completed' | 'cancelled';
  participants?: {
    id: string;
    name: string;
    avatar_url?: string;
  }[];
}

export function useSocialActivities(userId: string) {
  const [activities, setActivities] = useState<SocialActivity[]>([]);
  const [myActivities, setMyActivities] = useState<SocialActivity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadActivities();

    const subscription = supabase
      .channel('social_activities')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'social_activities'
        },
        () => {
          loadActivities();
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [userId]);

  const loadActivities = async () => {
    // Load all upcoming activities
    const { data: upcomingData } = await supabase
      .from('social_activities')
      .select(`
        *,
        participants:activity_participants(
          user:profiles(id, name, avatar_url)
        )
      `)
      .gt('start_time', new Date().toISOString())
      .order('start_time', { ascending: true });

    if (upcomingData) {
      setActivities(upcomingData);
    }

    // Load activities I'm participating in
    const { data: myData } = await supabase
      .from('activity_participants')
      .select(`
        activity:social_activities(
          *,
          participants:activity_participants(
            user:profiles(id, name, avatar_url)
          )
        )
      `)
      .eq('user_id', userId)
      .eq('status', 'registered')
      .order('created_at', { ascending: false });

    if (myData) {
      setMyActivities(myData.map(d => d.activity));
    }

    setLoading(false);
  };

  const createActivity = async (activity: Omit<SocialActivity, 'id' | 'created_by' | 'status'>) => {
    const { data, error } = await supabase
      .from('social_activities')
      .insert({
        ...activity,
        created_by: userId,
        status: 'upcoming'
      })
      .select()
      .single();

    if (error) throw error;

    // Announce new activity
    if (Platform.OS !== 'web') {
      Speech.speak(
        `New activity created: ${activity.title}, starting at ${new Date(activity.start_time).toLocaleString()}`,
        { rate: 0.8, pitch: 1.0 }
      );
    }

    return data;
  };

  const joinActivity = async (activityId: string) => {
    const { data, error } = await supabase
      .from('activity_participants')
      .insert({
        activity_id: activityId,
        user_id: userId,
        status: 'registered'
      })
      .select()
      .single();

    if (error) throw error;

    // Confirm registration
    if (Platform.OS !== 'web') {
      Speech.speak(
        'You have successfully registered for this activity!',
        { rate: 0.8, pitch: 1.0 }
      );
    }

    await loadActivities();
    return data;
  };

  const leaveActivity = async (activityId: string) => {
    const { error } = await supabase
      .from('activity_participants')
      .delete()
      .eq('activity_id', activityId)
      .eq('user_id', userId);

    if (error) throw error;
    await loadActivities();
  };

  const updateActivity = async (
    activityId: string,
    updates: Partial<SocialActivity>
  ) => {
    const { data, error } = await supabase
      .from('social_activities')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', activityId)
      .select()
      .single();

    if (error) throw error;

    // Notify participants of changes
    if (Platform.OS !== 'web') {
      Speech.speak(
        'Activity details have been updated. Please check the new information.',
        { rate: 0.8, pitch: 1.0 }
      );
    }

    await loadActivities();
    return data;
  };

  return {
    activities,
    myActivities,
    loading,
    createActivity,
    joinActivity,
    leaveActivity,
    updateActivity,
    upcomingActivities: activities.filter(
      a => new Date(a.start_time) > new Date() && a.status === 'upcoming'
    ),
    recommendedActivities: activities.filter(
      a => {
        const start = new Date(a.start_time);
        const now = new Date();
        const threeDaysFromNow = new Date();
        threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3);
        return start > now && start < threeDaysFromNow && a.status === 'upcoming';
      }
    )
  };
}