import { useState, useEffect } from 'react';

interface SocialActivity {
  id: string;
  title: string;
  description: string;
  date: string;
  participants: number;
  maxParticipants: number;
  location?: string;
  type: 'group' | 'individual' | 'virtual';
  status: 'upcoming' | 'ongoing' | 'completed' | 'cancelled';
}

interface SocialActivitiesState {
  activities: SocialActivity[];
  loading: boolean;
  error: string | null;
}

export const useSocialActivities = (userId: string) => {
  const [state, setState] = useState<SocialActivitiesState>({
    activities: [],
    loading: false,
    error: null,
  });

  useEffect(() => {
    const fetchActivities = async () => {
      setState(prev => ({ ...prev, loading: true, error: null }));
      try {
        // TODO: Replace with actual API call
        const mockActivities: SocialActivity[] = [
          {
            id: '1',
            title: 'Morning Walk Group',
            description: 'Join us for a refreshing morning walk in the park',
            date: new Date(Date.now() + 86400000).toISOString(), // Tomorrow
            participants: 5,
            maxParticipants: 10,
            location: 'Central Park',
            type: 'group',
            status: 'upcoming',
          },
          {
            id: '2',
            title: 'Virtual Book Club',
            description: 'Discussion of the monthly book selection',
            date: new Date(Date.now() + 172800000).toISOString(), // Day after tomorrow
            participants: 8,
            maxParticipants: 15,
            type: 'virtual',
            status: 'upcoming',
          },
        ];

        setState({
          activities: mockActivities,
          loading: false,
          error: null,
        });
      } catch (error) {
        setState({
          activities: [],
          loading: false,
          error: 'Failed to fetch activities',
        });
      }
    };

    fetchActivities();
  }, [userId]);

  const joinActivity = async (activityId: string) => {
    try {
      // TODO: Replace with actual API call
      setState(prev => ({
        ...prev,
        activities: prev.activities.map(activity =>
          activity.id === activityId
            ? { ...activity, participants: activity.participants + 1 }
            : activity
        ),
      }));
    } catch (error) {
      console.error('Error joining activity:', error);
    }
  };

  const leaveActivity = async (activityId: string) => {
    try {
      // TODO: Replace with actual API call
      setState(prev => ({
        ...prev,
        activities: prev.activities.map(activity =>
          activity.id === activityId
            ? { ...activity, participants: activity.participants - 1 }
            : activity
        ),
      }));
    } catch (error) {
      console.error('Error leaving activity:', error);
    }
  };

  return {
    ...state,
    joinActivity,
    leaveActivity,
  };
}; 